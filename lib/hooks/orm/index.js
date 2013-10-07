module.exports = function(sails) {


	/**
	 * Module dependencies.
	 */


	var util = require('../../util'),
		async = require('async'),
		FatalError = require('../../errors/fatal')(sails),
		loadAppModelsAndAdapters = require('./loadUserModules')(sails),
		registerModel = require('./registerModel')(sails),
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
				
				loadAppModelsAndAdapters: loadAppModelsAndAdapters,

				// Normalize model definitions and merge in defaults from `sails.config.model`
				normalizeModelDefinitions: ['loadAppModelsAndAdapters', function normalizeModelDefs (cb) {
					util.each(sails.models, self.normalizeModelDef);
					cb();
				}],

				// Once all user model definitions are loaded into sails.models, 
				// go ahead and start the ORM.
				instantiateModels: ['normalizeModelDefinitions', this.instantiateModels]

			}, cb);
		},



		/**
		 * Merge defaults and normalize options in this model definition
		 */
		normalizeModelDef: function (modelDef, mid) {
			// merge in defaults from `sails.config.model`
			modelDef = util.merge({}, sails.config.model, modelDef);

			// Backwards compatibilty for `Model.adapter`
			if (modelDef.adapter) {
				sails.log.verbose(
					'Deprecation warning :: ' + 
					'Replacing `' + modelDef.globalId + '.adapter` ' +
					'with `' + modelDef.globalId + '.connections`....');
				modelDef.connections = modelDef.adapter;
				delete modelDef.adapter;
			}

			// Ensure that Model.connections is an array
			if ( ! util.isArray(modelDef.connections) ) {
				modelDef.connections = [modelDef.connections];
			}

			// Go through each of this models' connections-- if it is a string (i.e. named connection),
			// dereference it to get the complete connection config object
			modelDef.connections = util.map( modelDef.connections, function (connection) {
				
				// If `connection` is not an object yet, try to look-up connection by name
				if ( util.isString(connection) ) {
					connection = _lookupConnection(connection, mid);
					connection = _normalizeConnection(connection, mid);
					return connection;
				}
				// `connection` defined inline in model-- just need to normalize it
				if ( util.isObject(connection) ) {
					return _normalizeConnection(connection, mid);
				}
				// Invalid connection found, throw fatal error.
				return FatalError.__InvalidConnection__ (connection, modelDef.identity);
			});

			// Save modified model definition back to sails.models
			sails.models[mid] = modelDef;
		},


		/**
		 * Start the ORM by instantiating Waterline Collections
		 */

		instantiateModels: function(cb) {
			sails.log.verbose('Starting ORM...');

			// Iterate through the connections for each model
			async.each( Object.keys(sails.models), function eachModel(modelID, cb) {
				// var connections = modelDef.connections;
				// sails.log(mid, ' connections::', modelDef.connections);
				sails.log.verbose('Registering model ' + modelID + '...');
				registerModel(modelID, function (err) {

					// Expose model as global variable
					// (if enabled in `sails.config.globals`)
					if (sails.config.globals.models) {
						var globalName = sails.models[modelID].globalId || sails.models[modelID].identity;
						global[globalName] = sails.models[modelID];
					}

					return cb(err);
				});
			}, cb);

			// sails.log('Stop for now!');
			// process.exit(0);
			// Set the adapters referenced, and attempt to load them if necessary


			// Load all external adapters used in models
// <<<<<<< HEAD
// 			async.each(util.keys(sails.models), function (modelIdentity, cb) {
// 				ormUtil.loadAdapters(modelIdentity, cb);
// 			}, function (err) {

// 				// Build Config for each adapter
// 				util.each(sails.adapters, function(adapter, identity) {
// 					ormUtil.buildAdapterConfig(identity);
// 				});

// 				var waterline = new Waterline();

// 				Object.keys(sails.models).forEach(function(model) {
// 					waterline.loadCollection(loadCollection(model));
// 				});

// 				waterline.initialize({ adapters: sails.adapters }, function(err, collections) {
// 					if(err) return cb(err);

// 					Object.keys(collections).forEach(function(key) {

// 						// Set Model to instantiated Collection
// 						sails.models[key] = collections[key];

// 						// Globalize Model if Enabled
// 						if (sails.config.globals.models) {
// 							var globalName = sails.models[key].globalId || sails.models[key].identity;
// 							global[globalName] = collections[key];
// 						}

// 					});

// 					cb();
// 				});
// 			});
// =======
// 			// async.each(util.keys(sails.models), function (modelIdentity, cb) {
// 			// 	ormUtil.loadAdapters(modelIdentity, cb);
// 			// }, function (err) {

// 			// 	// Build Config for each adapter
// 			// 	util.each(sails.adapters, function(adapter, identity) {
// 			// 		ormUtil.buildAdapterConfig(identity);
// 			// 	});

// 			// 	// Loop through models and instantiate a Waterline Collection
// 			// 	async.each(Object.keys(sails.models), loadCollection, function(err) {
// 			// 		if (err) return cb(err);
// 			// 		cb();
// 			// 	});
// 			// });
// >>>>>>> development

		},


		/**
		 * Stop the ORM by removing all references to instantiated models
		 *
			////////////////////////////////////////////////////////////////////////////
			// TODO: Verify this works
			////////////////////////////////////////////////////////////////////////////

		 */

		// stop: function() {

		// 	sails.log.verbose('Stopping ORM...');

		// 	// delete all references to sails.models and their global
		// 	Object.keys(sails.models).forEach(function(model) {
		// 		if (global[model.globalId]) {
		// 			delete global[model.globalId];
		// 		}

		// 		delete sails.models[model];
		// 	});
		// },





		/**
		 * Reload the ORM by removing all models and reloading them
		 * then reinstantiate the Waterline Collections.

			////////////////////////////////////////////////////////////////////////////
			// TODO: Verify this works
			////////////////////////////////////////////////////////////////////////////

		 */

		// restart: function(cb) {
		// 	sails.log.verbose('Restarting ORM...');

		// 	var self = this;

		// 	// Stop the ORM
		// 	this.stop();

		// 	// reload sails.models
		// 	modelsLoader(function() {

		// 		// Start the ORM
		// 		self.start(cb);

		// 	});
		// }
	};



	/**
	 * Lookup a connection
	 *
	 * @api private
	 */
	function _lookupConnection (connection, modelID) {
		var connectionID = connection;
		connection = sails.config.connections[connectionID];

		// If this is not a known connection
		if (!connection) {

			return FatalError.__UnknownConnection__ (connection, modelID);

			// TODO: also try looking up an adapter, pretending that the connection id is an adapter id

			// // Try it out as the identity of an adapter
			// var adapterID = connectionID;

			// // Search `sails.adapters` (adapters from the app itself)
			// if (sails.adapters[adapterID]) {
			// 	// TODO
			// }

			// // as well as adapter dependencies in node_modules
			// // TODO

			// // If nothing makes sense, throw a fatal error
			// return FatalError.__UnknownConnection__ (connection, modelDef.identity);
		}
		return connection;
	}



	/**
	 * Normalize properites of a connection
	 * (handles deprecation warnings / validation errors and making types consistent)
	 *
	 * @api private
	 */
	function _normalizeConnection (connection, modelID) {
		// Connection is not formatted properly, throw a fatal error.
		if ( !util.isObject(connection) ) {
			return FatalError.__InvalidConnection__ (connection, modelID);
		}

		// Backwards compatibilty for `connection.module`
		if ( connection.module ) {
			sails.log.verbose(
				'Deprecation warning :: In model `' + modelID + '`\'s `connections` config, ' + 
				'replacing `module` with `adapter`....');
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
		if (!sails.adapters[connection.adapter]) {

			// (Format adapter name to make sure we make the best attempt we can)
			var moduleName = connection.adapter;
			if ( ! moduleName.match(/^(sails-|waterline-)/) ) {
				moduleName = 'sails-' + moduleName;
			}

			// Since it is unknown so far, try and load the adapter from `node_modules`
			sails.log.verbose('Loading adapter (', moduleName, ') for ' + modelID, ' from `node_modules` directory...');
			var modulePath = sails.config.appPath + '/node_modules/' + moduleName;
			if ( !fs.existsSync (modulePath) ) {
				// If adapter doesn't exist, log an error and exit
				return FatalError.__UnknownAdapter__ (connection.adapter, modelID);
			}

			// Since the module seems to exist, try to require it (execute the code)
			try {
				sails.adapters[moduleName] = require(modulePath);
			}
			catch (err) {
				return FatalError.__InvalidAdapter__ (moduleName, err);
			}
		}

		// Success- connection normalized and validated
		// (any missing adapters were either acquired, or the loading process was stopped w/ a fatal error)
		return connection;
	}

};
