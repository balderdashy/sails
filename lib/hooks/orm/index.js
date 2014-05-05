/**
 * Module dependencies.
 */

var _ = require('lodash'),
	async = require('async'),
	Err = require('../../../errors'),
	Waterline = require('waterline'),
	util = require('util'),
	fs = require('fs'),
	STRINGFILE = require('sails-stringfile');



module.exports = function(sails) {



	var loadAppModelsAndAdapters = require('./loadUserModules')(sails);


	/**
	 * Expose Hook definition
	 */

	return {

		defaults: {

			globals: {
				adapters: true,
				models: true
			},

			// Default model properties
			models: {

				// This default connection (i.e. datasource) for the app
				// will be used for each model unless otherwise specified.
				// connection: 'localDiskDb'
			},


			// Connections to data sources, web services, and external APIs.
			// Can be attached to models and/or accessed directly.
			connections: {

				// Built-in disk persistence
				// (defaults to .tmp/disk.db)
				// localDiskDb: { adapter: 'sails-disk' }
			}
		},

		configure: function () {

			var self = this;

			//////////////////////////////////////////////////////////////////////////////////////////
			// Backwards compat. for `config.adapters`
			//////////////////////////////////////////////////////////////////////////////////////////

			// `sails.config.adapters` is now `config.connections`
			if (sails.config.adapters) {

				// `config.adapters.default` is being replaced with `config.models.connection`
				if (sails.config.adapters['default']) {

					sails.after('lifted', function () {

						STRINGFILE.logDeprecationNotice(
							'config.adapters.default',
							STRINGFILE.get('links.docs.migrationGuide.connections'),
							sails.log.debug) &&
						STRINGFILE.logUpgradeNotice(
							STRINGFILE.get('upgrade.config.models.connection'), [], sails.log.debug);

					});

					sails.config.models.connection = sails.config.models.connection || sails.config.adapters['default'];
				}

				// Merge `config.adapters` into `config.connections`
				sails.after('lifted', function () {

					STRINGFILE.logDeprecationNotice(
						'config.adapters',
						STRINGFILE.get('links.docs.migrationGuide.connections'),
						sails.log.debug) &&
					STRINGFILE.logUpgradeNotice(
						STRINGFILE.get('upgrade.config.connections'), [], sails.log.debug);

				});
				_.each(sails.config.adapters, function (legacyAdapterConfig, connectionName) {

					// Ignore `default`
					// (it was a special case in Sails versions <= v0.10)
					if (connectionName === 'default') {
						return;
					}

					// Normalize `module` to `adapter`
					var connection = _.clone(legacyAdapterConfig);
					connection.adapter = connection.module;
					delete connection.module;

					sails.after('lifted', function () {

						STRINGFILE.logDeprecationNotice(
							'config.adapters.*.module',
							STRINGFILE.get('links.docs.migrationGuide.connections'),
							sails.log.debug) &&
						STRINGFILE.logUpgradeNotice(
							STRINGFILE.get('upgrade.config.connections.*.adapter'), [connectionName], sails.log.debug);

					});
					sails.config.connections[connectionName] = sails.config.connections[connectionName] = connection;
				});
				delete sails.config.adapters;

			} // </if (sails.config.adapters) >



			// Listen for reload events
			// (which will just run the hook's `initialize()` fn again)
			sails.on('hook:orm:reload', function() {

				// Teardown all of the adapters, since initialize() will restart them
				teardown(function() {
					self.initialize(function(err) {
						// If the re-initialization was a success, trigger an event
						// in case something needs to respond to the ORM reload (e.g. pubsub)
						if (!err) {
							sails.emit('hook:orm:reloaded');
						} else {
							throw new Error(err);
						}
					});
				});

			});

			// Listen for lower event, and tear down all of the adapters
			sails.on('lower', teardown);

			function teardown(cb) {
				cb = cb || function(){};
				async.forEach(Object.keys(sails.adapters), function(name, cb) {
					var adapter = sails.adapters[name];
					if (adapter.teardown) {
						adapter.teardown(null, cb);
					} else {
						cb();
					}
				}, cb);
			}

		},

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

				// Normalize model definitions and merge in defaults from `sails.config.models`
				modelDefs: ['_loadModules', function normalizeModelDefs (cb) {
					_.each(sails.models, self.normalizeModelDef);
					cb(null, sails.models);
				}],

				// Once all user model definitions are loaded into sails.models,
				// go ahead and start the ORM, instantiate the models
				instantiatedCollections: ['modelDefs', this.startORM],


				_prepareModels: ['instantiatedCollections', this.prepareModels]

			}, cb);
		},



		/**
		 * Merge defaults and normalize options in this model definition
		 */
		normalizeModelDef: function (modelDef, modelID) {

			// Implicit framework defaults
			var implicitDefaults = {
				identity: modelID,
				tableName: modelID
			};

			// Rebuild model definition using the defaults
			modelDef = _.merge(implicitDefaults, sails.config.models, modelDef);

			// Merge in modelDef connection setting
			if( !modelDef.connection && sails.config.models.connection ) {
				modelDef.connection = sails.config.models.connection;
			}

			// If this is production, force `migrate: safe`!!
			if ( process.env.NODE_ENV === 'production' && modelDef.migrate !== 'safe' ) {
				sails.config.models.migrate = 'safe';
				sails.log.verbose(util.format('Forcing Waterline to use `migrate: "safe" strategy (since this is production)'));
			}


			// Backwards compatibilty for `Model.adapter`
			if (modelDef.adapter) {
				sails.log.verbose(
					'Deprecation warning :: ' +
					'Replacing `' + modelDef.globalId + '.adapter` ' +
					'with `' + modelDef.globalId + '.connection`....');
				modelDef.connection = modelDef.adapter;
				delete modelDef.adapter;
			}

      // Backwards compatiblity for lifecycle callbacks
      if (modelDef.beforeValidation) {
        sails.log.verbose(
          'Deprecation warning :: the `beforeValidation()` model lifecycle callback is now `beforeValidate()`.\n' +
          'For now, I\'m replacing it for you (in `' + modelDef.globalId + '`)...');
        modelDef.beforeValidate = modelDef.beforeValidation;
      }
      if (modelDef.afterValidation) {
        sails.log.verbose(
          'Deprecation warning :: the `afterValidation()` model lifecycle callback is now `afterValidate()`.\n' +
          'For now, I\'m replacing it for you (in `' + modelDef.globalId + '`)...');
        modelDef.afterValidate = modelDef.afterValidation;
      }

			// If no connection can be determined (even by using app-level defaults [config.models])
			// throw a fatal error.
			if ( !modelDef.connection ) {
				return Err.fatal.__ModelIsMissingConnection__(modelDef.globalId);
			}

			// Coerce `Model.connection` to an array
			if ( ! _.isArray(modelDef.connection) ) {
				modelDef.connection = [modelDef.connection];
			}


			// ========================================================================
			// ========================================================================
			// ========================================================================

			// Iterate through each of this models' connections
			// -> Make sure the adapter specified has been required.
			// -> If invalid connection found, throw fatal error.
			modelDef.connection = _.map( modelDef.connection, function (connection) {
				_normalizeConnection(connection, modelID);
				return connection;
			});

			// If it isn't set directly, set the model's `schema` property
			// based on the first adapter in its connections (left -> right)
			//
			// TODO: pull this out and into Waterline core
			if ( typeof modelDef.schema === 'undefined') {
				var connection, schema;
				for (var i in modelDef.connection) {
					connection = modelDef.connection[i];
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


			//
			// ========================================================================
			// ========================================================================
			// ========================================================================


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

			// -> Instantiate ORM in memory.
			// -> Iterate through each model definition:
			//		-> Create a proper Waterline Collection for each model
			//		-> then register it w/ the ORM.
			sails.log.verbose('Starting ORM...');
			var waterline = new Waterline();
			_.each(modelDefs, function loadModelsIntoWaterline (modelDef, modelID) {
				sails.log.silly('Registering model `' + modelID + '` in Waterline (ORM)');
				waterline.loadCollection( Waterline.Collection.extend(modelDef) );
			});

			// Find all the connections used
			var connections = _.reduce(sails.adapters, function getConnectionsInPlay (connections, adapter, adapterKey) {
				_.each(sails.config.connections, function(connection, connectionKey) {
					if (adapterKey === connection.adapter) {
						connections[connectionKey] = connection;
					}
				});
				return connections;
			}, {});

			// App defaults from `sails.config.models`
			var appDefaults = sails.config.models;

			// -> "Initialize" ORM
			// 		: This performs tasks like managing the schema across associations,
			//		: hooking up models to their connections, and auto-migrations.
			waterline.initialize({
				adapters: sails.adapters,
				connections: connections,
				defaults: appDefaults
			}, cb);
		},


		/**
		 * prepareModels
		 *
		 * @param {Function}	cb
		 *						  -> err	// Error, if one occurred, or null
		 *
		 * @param {Object}		stack
		 *						stack.instantiatedCollections {}
		 */
		prepareModels: function (cb, stack) {
			var collections = stack.instantiatedCollections.collections || [];

			Object.keys(collections).forEach(function eachInstantiatedCollection (modelID) {

				// Bind context for models
				// (this (breaks?)allows usage with tools like `async`)
				_.bindAll(collections[modelID]);

				// Derive information about this model's associations from its schema
				var associatedWith = [];
				_(collections[modelID].attributes).forEach(function buildSubsetOfAssociations(attrDef, attrName) {
					if (typeof attrDef === 'object' && (attrDef.model || attrDef.collection)) {
						associatedWith.push(_.merge({
							alias: attrName,
							type: attrDef.model ? 'model' : 'collection'
						}, attrDef));
					}
				});

				// Expose `Model.associations` (an array)
				collections[modelID].associations = associatedWith;


				// Set `sails.models.*` reference to instantiated Collection
				// Exposed as `sails.models[modelID]`
				sails.models[modelID] = collections[modelID];

				// Create global variable for this model
				// (if enabled in `sails.config.globals`)
				// Exposed as `[globalId]`
				if (sails.config.globals && sails.config.globals.models) {
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
	 * @throws {Err.fatal}	__UnknownConnection__
	 * @api private
	 */
	function _lookupConnection (connectionName, modelID) {
		var connection = sails.config.connections[connectionName];

		// If this is not a known connection, throw a fatal error.
		if (!connection) {
			return Err.fatal.__UnknownConnection__ (connectionName, modelID);
		}
		return connection;
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
	 * @throws {Err.fatal}		__UnknownConnection__
	 * @throws {Err.fatal}		__InvalidConnection__
	 * @throws {Err.fatal}		__InvalidAdapter__
	 * @api private
	 */
	function _normalizeConnection (connection, modelID) {

		// Connection specified has not been configured
		var connectionObject = sails.config.connections[connection];
		if(!connectionObject) return Err.fatal.__InvalidConnection__ (connection, modelID);

		// Backwards compatibilty for `connection.module`
		if ( connectionObject.module ) {
			sails.log.verbose(
				'Deprecation warning :: In model `' + modelID + '`\'s `connection` config, ' +
				'replacing `module` with `adapter`....');
			connectionObject.adapter = connectionObject.module;
			delete connectionObject.module;
		}

		var moduleName = connectionObject.adapter;

		// Adapter is required for a connection
		if ( !connectionObject.adapter ) {
			// Invalid connection found, throw fatal error.
			return Err.fatal.__InvalidConnection__ (connectionObject, modelID);
		}

		// Verify that referenced adapter has been loaded
		// If it doesn't, try and load it as a dependency from `node_modules`
		if (!sails.adapters[connectionObject.adapter]) {

			// (Format adapter name to make sure we make the best attempt we can)
			if ( ! moduleName.match(/^(sails-|waterline-)/) ) {
				moduleName = 'sails-' + moduleName;
			}

			// Since it is unknown so far, try and load the adapter from `node_modules`
			sails.log.verbose('Loading adapter (', moduleName, ') for ' + modelID, ' from `node_modules` directory...');
			var modulePath = sails.config.appPath + '/node_modules/' + moduleName;
			if ( !fs.existsSync (modulePath) ) {
				// If adapter doesn't exist, log an error and exit
				return Err.fatal.__UnknownAdapter__ (connectionObject.adapter, modelID, sails.majorVersion, sails.minorVersion);
			}

			// Since the module seems to exist, try to require it (execute the code)
			try {
				sails.adapters[moduleName] = require(modulePath);
			}
			catch (err) {
				return Err.fatal.__InvalidAdapter__ (moduleName, err);
			}
		}

		// Defaults connection object to its adapter's defaults
		// TODO: pull this out into waterline core
		var itsAdapter = sails.adapters[connectionObject.adapter];
		connection = _.merge({}, itsAdapter.defaults, connectionObject);

		// If the adapter has a `registerCollection` method, it must be a v0.9.x adapter
		if (itsAdapter.registerCollection) {
			sails.log.warn('The adapter `'+connectionObject.adapter+'` appears to be designed for an earlier version of Sails.');
			sails.log.warn('(it has a `registerCollection()` method.)');
			sails.log.warn('Since you\'re running Sails v0.10.x, it probably isn\'t going to work.');
			sails.log.warn('To attempt to install the updated version of this adapter, run:');
			sails.log.warn('npm install '+connectionObject.adapter+'@0.10.x');
			return Err.fatal.__InvalidAdapter__ (moduleName, 'Adapter is not compatible with the current version of Sails.');
		}

		// Success- connection normalized and validated
		// (any missing adapters were either acquired, or the loading process was stopped w/ a fatal error)
		return connection;
	}

};
