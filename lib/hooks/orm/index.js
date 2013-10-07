module.exports = function(sails) {


	/**
	 * Module dependencies.
	 */


	var util = require('../../util'),
		async = require('async'),
		Waterline = require('waterline'),
		FatalError = require('../../errors/fatal')(sails),
		loadAppModelsAndAdapters = require('./loadUserModules')(sails);


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
				sails.log.verbose('Deprecation warning :: Replacing `config.adapters.default` with `config.model.connections`....');
				modelDef.connections = modelDef.adapter;
			}

			// Ensure that Model.connections is an array
			if ( ! util.isArray(modelDef.connections) ) {
				modelDef.connections = [modelDef.connections];
			}

			// Go through each of this models' connections-- if it is a string (i.e. named connection),
			// dereference it to get the complete connection config object
			modelDef.connections = util.map( modelDef.connections, _normalizeConnection);

			// Save modified model definition back to sails.models
			sails.models[mid] = modelDef;
		},


		/**
		 * Start the ORM by instantiating Waterline Collections
		 */

		instantiateModels: function(cb) {
			sails.log.verbose('Starting ORM...');

			// Iterate through the connections for each model
			util.each( sails.models, function eachModel(modelDef, mid) {
				var connections = modelDef.connections;

				sails.log(mid, ' connections::', modelDef.connections);
			});

			sails.log('Stop for now!');
			process.exit(0);
			// Set the adapters referenced, and attempt to load them if necessary

			
			// Load all external adapters used in models
			// async.each(util.keys(sails.models), function (modelIdentity, cb) {
			// 	ormUtil.loadAdapters(modelIdentity, cb);
			// }, function (err) {

			// 	// Build Config for each adapter
			// 	util.each(sails.adapters, function(adapter, identity) {
			// 		ormUtil.buildAdapterConfig(identity);
			// 	});

			// 	// Loop through models and instantiate a Waterline Collection
			// 	async.each(Object.keys(sails.models), loadCollection, function(err) {
			// 		if (err) return cb(err);
			// 		cb();
			// 	});
			// });

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
	 * Lookup/normalize one of a model's connections
	 *
	 * @api private
	 */

	function _normalizeConnection (connection) {
		
		// This is already a connection config object-- use it
		if ( util.isObject(connection) ) {
			return connection;
		}

		// Try to look-up connection by name
		if ( util.isString(connection) ) {
			var connectionID = connection;
			connection = sails.config.connections[connectionID];

			// If this is not a known connection
			if (!connection) {
				throw new Error('Adapters not allowed to be referenced directly in models for now ahh its complicated');

				// Try it out as the name of an adapter
				// var adapterModuleName = connectionID;

				// // Search `sails.adapters` as well as node_modules
				// if (sails.adapters[adapterModuleName]) {}

				// // TODO: FINISH THIS!!!

				// // If nothing makes sense, throw a fatal error
				// return FatalError.__UnknownConnection__ (connection, modelDef.identity);
			}
			return connection;
		}

		// Connection is not formatted properly, throw a fatal error.
		return FatalError.__InvalidConnection__ (connection, modelDef.identity);
	}

};
