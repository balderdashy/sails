module.exports = function(sails) {


	/**
	 * Module dependencies.
	 */


	var util = require('../../util'),
		async = require('async'),
		FatalError = require('../../errors/fatal')(sails),
		loadAppModelsAndAdapters = require('./loadUserModules')(sails),
		Waterline = require('waterline'),
		fs = require('fs');


	/**
	 * Expose Hook definition
	 */

	return {

		initialize: function(cb) {
			var self = this;

			////////////////////////////////////////////////////////////////////////////
			// NOTE: If a user hook needs to add or modify model definitions,
			// the hook should wait until `hook:orm:loaded`, then reload the original 
			// model modules `orm/loadUserModules`. Finally, the ORM should be flushed using
			// `restart()` below.
			////////////////////////////////////////////////////////////////////////////


			// Load model and adapter definitions defined in the project
			async.auto({
				
				_loadModules: loadAppModelsAndAdapters,

				// Normalize model definitions and merge in defaults from `sails.config.model`
				modelDefs: ['_loadModules', function normalizeModelDefs (cb) {
					util.each(sails.models, self.normalizeModelDef);
					cb(null, sails.models);
				}],

				// Once all user model definitions are loaded into sails.models, 
				// go ahead and start the ORM, instantiate the models
				instantiatedCollections: ['modelDefs', this.startORM],


				_exposeModels: ['instantiatedCollections', this.exposeModels]

			}, cb);
		},



		/**
		 * Merge defaults and normalize options in this model definition
		 */
		normalizeModelDef: function (modelDef, modelID) {

			// TODO	: (after plane when there's internet)
			//		: Is there a recursive version of _.defaults()?
			//		: Otherwise, we have to do:
			//		: `modelDef = util.merge({}, sails.config.model, modelDef);`

			// Implicit framework defaults
			var implicitDefaults = {
				identity: modelID,
				tableName: modelID
			};

			// App defaults from `sails.config.model`
			var appDefaults = sails.config.model;
			
			// Rebuild model definition using the defaults
			modelDef = util.merge(implicitDefaults, appDefaults, modelDef);

			// Backwards compatibilty for `Model.adapter`
			if (modelDef.adapter) {
				// sails.log.warn(
				// 	'Deprecation warning :: ' + 
				// 	'Replacing `' + modelDef.globalId + '.adapter` ' +
				// 	'with `' + modelDef.globalId + '.connections`....');
				modelDef.connections = modelDef.adapter;
				delete modelDef.adapter;
			}

			// Ensure that Model.connections is an array
			if ( ! util.isArray(modelDef.connections) ) {
				modelDef.connections = [modelDef.connections];
			}

			
			// Iterate through each of this models' connections
			// -> If `connection` is not an object yet, try to look-up connection by name
			// -> Otherwise `connection` defined inline in model-- just need to normalize it
			// -> If invalid connection found, throw fatal error.
			modelDef.connections = util.map( modelDef.connections, function (connection) {
				if ( util.isString(connection) ) {
					connection = _lookupConnection(connection, modelID);
					connection = _normalizeConnection(connection, modelID);
					return connection;
				}
				if ( util.isObject(connection) ) {
					return _normalizeConnection(connection, modelID);
				}
				return FatalError.__InvalidConnection__ (connection, modelDef.identity);
			});

			// If it isn't set directly, set the model's `schema` property 
			// based on the first adapter in its connections (left -> right)
			if ( typeof modelDef.schema === 'undefined') {
				var connection, schema;
				for (var i in modelDef.connections) {
					connection = modelDef.connections[i];
					// console.log('checking connection: ', connection);
					if (typeof connection.schema !== 'undefined') {
						schema = connection.schema;
						break;
					}
				}
				// console.log('trying to determine preference for schema setting..', modelDef.schema, typeof modelDef.schema, typeof modelDef.schema !== 'undefined', schema);
				if (typeof schema !== 'undefined') {
					modelDef.schema = schema;
				}
			}


			// Save modified model definition back to sails.models
			sails.models[modelID] = modelDef;
		},



		/**
		 * Instantiate Waterline Collection for each Sails Model,
		 * then start the ORM.
		 *
		 * @param {Function}	cb
		 *						  -> err	// Error, if one occurred, or null
		 *
		 * @param {Object}		stack
		 *						stack.modelDefs {}
		 *
		 * @global {Object}		sails
		 *						sails.models {}
		 */
		startORM: function(cb, stack) {
			var modelDefs = stack.modelDefs;

			// -> Build adHoc adapters (this will add `adapter` key to models)
			//		(necessary for loading the right adapter config w/i Waterline)
			var adHocAdapters = _buildAdHocAdapterSet(modelDefs);
			sails.adHocAdapters = adHocAdapters;

			// -> Instantiate ORM in memory.
			// -> Iterate through each model definition:
			//		-> Create a proper Waterline Collection for each model
			//		-> then register it w/ the ORM.
			sails.log.verbose('Starting ORM...');
			var instantiatedCollections = {};

			async.each( Object.keys(modelDefs), function instantiateCollection (modelID, next) {
				var modelDef = modelDefs[modelID];

				sails.log.verbose(
					'Registering model `' + modelID + '` in Waterline (ORM) with definition ::','\n',
					modelDef,'\n');

				var Model = Waterline.Collection.extend(modelDef);
				new Model({
					adapters: adHocAdapters,
					tableName: modelDef.tableName
				}, function (err, instantiatedCollection) {
					if (err) return next(err);
					instantiatedCollections[modelID] = instantiatedCollection;
					return next();
				});
			}, function allCollectionsInstantiated (err) {
				if (err) return cb(err);
				// console.log('***** ',instantiatedCollections);
				return cb(null, instantiatedCollections);
			});
		},


		/**
		 * exposeModels
		 * 
		 * @param {Function}	cb
		 *						  -> err	// Error, if one occurred, or null
		 *
		 * @param {Object}		stack
		 *						stack.instantiatedCollections {}
		 */
		exposeModels: function (cb, stack) {
			var collections = stack.instantiatedCollections;

			Object.keys(collections).forEach(function eachInstantiatedCollection (modelID) {

				// Set `sails.models.*` reference to instantiated Collection
				// Exposed as `sails.models[modelID]`
				sails.models[modelID] = collections[modelID];

				// Create global variable for this model
				// (if enabled in `sails.config.globals`)
				// Exposed as `[globalId]`
				if (sails.config.globals.models) {
					var globalName = sails.models[modelID].globalId || sails.models[modelID].identity;
					global[globalName] = collections[modelID];
				}
			});

			cb();
		}
	};



	/**
	 * Lookup a connection (e.g., `{ adapter: 'sails-disk' }`)
	 * by name (e.g., 'devDB')
	 *
	 * @param {String}	connectionName
	 *
	 * @param {String}	modelID
	 *					// Optional, improves quality of error messages
	 *
	 * @global	sails
	 *			sails.config
	 *			sails.config.connections {}
	 *
	 * @throws {FatalError}	__UnknownConnection__
	 * @api private
	 */
	function _lookupConnection (connectionName, modelID) {
		var connection = sails.config.connections[connectionName];

		if (connection) return connection;

		// If this is not a known connection, we should throw a fatal error.
		// Try loading it as an adapter though, just in case
		// (also backwards compat w/ <= v0.9.4)
		// sails.log.warn('Deprecated: No such connection "' + connectionName + '" exists...');
		// sails.log.warn('Trying to load it as an adapter instead-- using module ' +
		// 	'`sails-' + connectionName + '` with its default settings...'
		// );
		var loadedModuleName = _ensureAdapter( connectionName );
		return { adapter: loadedModuleName };

		// TODO: consider removing the above tolerance in 0.10.x
		// return FatalError.__UnknownConnection__ (connectionName, modelID);
	}



	/**
	 * Normalize properties of a connection
	 * (handles deprecation warnings / validation errors and making types consistent)
	 *
	 * @param {Object}	connection
	 *					connection.adapter	// Name of adapter module used by this connection
	 *					connection.module	// Deprecated- equivalent to `connection.adapter`
	 *
	 * @param {String}	modelID
	 *					// Optional, improves quality of error messages
	 *					// Identity of the model this connection came from
	 *
	 * @throws {FatalError}		__UnknownConnection__
	 * @throws {FatalError}		__InvalidConnection__
	 * @throws {FatalError}		__InvalidAdapter__
	 * @api private
	 */
	function _normalizeConnection (connection, modelID) {
		// Connection is not formatted properly, throw a fatal error.
		if ( !util.isObject(connection) ) {
			return FatalError.__InvalidConnection__ (connection, modelID);
		}

		// Backwards compatibilty for `connection.module`
		if ( connection.module ) {
			// sails.log.warn(
			// 	'Deprecation warning :: In model `' + modelID + '`\'s `connections` config, ' + 
			// 	'replacing `module` with `adapter`....');
			connection.adapter = connection.module;
			delete connection.module;
		}

		// Adapter is required for a connection
		if ( !connection.adapter ) {
			// Invalid connection found, throw fatal error.
			return FatalError.__InvalidConnection__ (connection, modelID);
		}

		// Verify that referenced adapter has been loaded
		// If it doesn't, try and load it as a dependency from `node_modules`
		var moduleName = _ensureAdapter(connection.adapter);
		connection.adapter = moduleName;

		// Defaults connection object to its adapter's defaults
		var itsAdapter = sails.adapters[moduleName];
		connection = util.merge(
			{}, 
			itsAdapter.defaults, 
			connection);

		// If the adapter has a `registerConnection` method, it must be a v0.10.x adapter
		if (itsAdapter.registerConnection) {
			console.error();
			console.error();
			sails.log.warn('The adapter `'+moduleName+'` appears to be designed for a later version of Sails (v0.10)');
			sails.log.warn('(it has a `registerConnection()` method.)');
			sails.log.warn('Since you\'re running Sails v'+sails.version+', it won\'t be compatible.');
			console.error();
			sails.log.warn('To install a compatible version of `'+moduleName+'`, run:');
			sails.log.warn('npm install '+moduleName+'@0.9.x');
			console.error();
			console.error();
			return FatalError.__InvalidAdapter__ (moduleName, 'Adapter `'+moduleName+'` is not compatible with the current version of Sails.');
		}

		// Success- connection normalized and validated
		// (any missing adapters were either acquired, or the loading process was stopped w/ a fatal error)
		return connection;
	}



	/**
	 * Make sure the specified adapter is loaded
	 * If not, try to require() it.
	 *
	 * @returns name of the module that Sails was able to load, otherwise, fatal error
	 */
	function _ensureAdapter ( moduleName ) {

		// Verify that referenced adapter has been loaded
		// If it doesn't, try and load it as a dependency from `node_modules`
		if (!sails.adapters[moduleName]) {

			// (Format adapter name to make sure we make the best attempt we can)
			if ( ! moduleName.match(/^(sails-|waterline-)/) ) {
				moduleName = 'sails-' + moduleName;
			}

			// Since it is unknown so far, try and load the adapter from `node_modules`
			// sails.log.warn('Loading adapter (', moduleName, ') for ' + modelID, ' from `node_modules` directory...');
			var modulePath = sails.config.appPath + '/node_modules/' + moduleName;
			if ( !fs.existsSync (modulePath) ) {
				// If adapter doesn't exist, log an error and exit
				return FatalError.__UnknownAdapter__ (moduleName);
			}

			// Since the module seems to exist, try to require it (execute the code)
			try {
				sails.adapters[moduleName] = require(modulePath);
			}
			catch (err) {
				return FatalError.__InvalidAdapter__ (moduleName, err);
			}
		}

		// Return `sails-*` module name
		return moduleName;
	}


	/**
	 * buildAdHocAdapterSet
	 *
	 * The `ad hoc adapter set` consists of the working adapters Waterline uses internally
	 * to talk to various resources.  In this function, ad hoc adapters are built from the connection configuration 
	 * in the provided models.  For each unique connection, a new ad-hoc adapter is built, and `registerCollection()` 
	 * will be run.
	 *
	 * Note	: `Model.connections` must already be cross-referenced against `sails.config.connections` at this point,
	 *		: since we assume that in every case, `Model.connections` is an array of objects with an `adapter` property.
	 *
	 * @sideEffect modifies `modelDefinitions` (adds `adapter` key)
	 *
	 * @param {Object} modelDefinitions
	 *
	 * TODO :	Perhaps instead of creating clones (ad-hoc adapters), extend Waterline to figure out connection objects
	 *			internally, so then they can just be passed in.
	 *			e.g., `modelDef.adapter = util.cloneDeep(modelDef.connections);`
	 */
	function _buildAdHocAdapterSet (modelDefinitions) {

		// Build set of customized/cloned adapters
		var adHocAdapters = {};
		var i = 0;

		util.each(modelDefinitions, function eachModelDef (modelDef) {

			// Keep track of generated unique connection IDs
			var connectionIDs = [];

			util.each(modelDef.connections, function eachConnection (connection) {

				// Track unique, process-wide identifiers for each connection
				var connectionID = 'adhoc_adapter_' + i;
				connectionIDs.push(connectionID);
				i++;

				// Create and save new ad-hoc adapter
				adHocAdapters[connectionID] = _cloneAdapter({
					adapterID: connection.adapter,
					adapterDefs: sails.adapters,
					connection: connection
				});
			});

			// Populate the `adapter` property in the model definition
			// with an array of the uniquely generated connection ID strings for this model.
			// TODO: in Waterline core, use `connectionNames` instead (or something like that)
			sails.log.verbose('Setting Model.adapter with ad-hoc clone ids => ', connectionIDs);
			modelDef.adapter = connectionIDs;


			// Old way (replaced w/ generated connection names- since uniquness guarantee was hard to achieve)
			// ::::::::::::::::::::::::::::::::::::
			// Then pluck out the adapter ids from the model's connections 
			// and plug them as a list of strings into `Model.adapter`
			// modelDef.adapter = util.pluck(modelDef.connections, 'adapter');
		});

		return adHocAdapters;
	}


	/**
	 * _cloneAdapter
	 *
	 * Given the definitions of all relevant adapters,
	 * @returns a configured, ad-hoc adapter clone
	 *
	 * @param {Object} opts
	 * @api private
	 */
	function _cloneAdapter (opts) {
		with (opts) {
			var clonedAdapter = util.cloneDeep(adapterDefs[adapterID]);
			var clonedConnection = util.cloneDeep(connection);
			clonedAdapter.config = util.merge(clonedAdapter.defaults || {}, clonedConnection);
			sails.log.verbose(
				'Cloned new ad-hoc adapter','\n',
				'\t:: source adapter ::',adapterID, '\n',
				'\t:: source connection ::',connection, '\n',
				'\t:: config ::',clonedAdapter.config,'\n'
			);
			return clonedAdapter;
		}
	}

};