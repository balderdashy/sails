module.exports = function(sails) {


	/**
	 * Module dependencies.
	 */


	var util = require('../../util'),
		async = require('async'),
		ormUtil = require('./util')(sails),
		Waterline = require('waterline'),
		loadModules = require('./modules')(sails);


	/**
	 * Expose Hook definition
	 */

	return {

		initialize: function(cb) {
			var self = this;

			////////////////////////////////////////////////////////////////////////////
			// NOTE: If a user hook needs to add or modify model definitions,
			// the hook should wait until `hook:orm:loaded`, then reload the original 
			// model modules `orm/loadModules`. Finally, the ORM should be flushed using
			// `restart()` below.
			////////////////////////////////////////////////////////////////////////////


			// Load model and adapter definitions defined in the project, and then
			// wait until all other hooks are loaded before continuing, since user
			// hooks might add / modify model definitions.
			loadModules(function(err) {
				if (err) return cb(err);

				// Merge model defaults (`config.models`) into each model def.
				// (this provides the default connections to each model)
				util.each(sails.models, function eachModel (modelDefinition) {
					util.merge(modelDefinition, sails.config.model);
				});

				// Once all user model definitions are loaded into sails.models, 
				// go ahead and start the ORM.
				self.start(cb);
			});
		},




		/**
		 * Start the ORM by instantiating Waterline Collections
		 */

		start: function(cb) {
			sails.log.verbose('Starting ORM...');

			// "Resolve" Adapters
			// Ensures that each model has somthing set for the adapter
			util.each(sails.models, function(model, identity) {
				model.adapter = ormUtil.resolveAdapter(model);
			});

			
			// Load all external adapters used in models
			async.each(util.keys(sails.models), function (modelIdentity, cb) {
				ormUtil.loadAdapters(modelIdentity, cb);
			}, function (err) {

				// Build Config for each adapter
				util.each(sails.adapters, function(adapter, identity) {
					ormUtil.buildAdapterConfig(identity);
				});

				// Loop through models and instantiate a Waterline Collection
				async.each(Object.keys(sails.models), loadCollection, function(err) {
					if (err) return cb(err);
					cb();
				});
			});

		},




		/**
		 * Stop the ORM by removing all references to instantiated models
		 *
			////////////////////////////////////////////////////////////////////////////
			// TODO: Verify this works
			////////////////////////////////////////////////////////////////////////////

		 */

		stop: function() {

			sails.log.verbose('Stopping ORM...');

			// delete all references to sails.models and their global
			Object.keys(sails.models).forEach(function(model) {
				if (global[model.globalId]) {
					delete global[model.globalId];
				}

				delete sails.models[model];
			});
		},





		/**
		 * Reload the ORM by removing all models and reloading them
		 * then reinstantiate the Waterline Collections.
			
			////////////////////////////////////////////////////////////////////////////
			// TODO: Verify this works
			////////////////////////////////////////////////////////////////////////////

		 */

		restart: function(cb) {
			sails.log.verbose('Restarting ORM...');

			var self = this;

			// Stop the ORM
			this.stop();

			// reload sails.models
			modelsLoader(function() {

				// Start the ORM
				self.start(cb);

			});
		}
	};




	/**
	 * Instantiate a new Waterline Collection from the Sails Model
	 */

	function loadCollection(model, cb) {

		// Determine if model is schema or schemaless
		var modelAdapters = sails.models[model].adapter;

		// Check if main model adapter config has a default schema setting
		var adapter = sails.adapters[modelAdapters[0]];
		var defaultSchema = adapter.config && adapter.config.hasOwnProperty('schema');

		// Check if the model is overriding the schema setting
		var overrideSchema = typeof sails.models[model].schema !== 'undefined';

		// Set the schema value if there is a default and nothing is overriding it
		if(defaultSchema && !overrideSchema) {
			sails.models[model].schema = adapter.config && adapter.config.schema;
		}

		// Mixin local model defaults to the adapters passed into the model
		var adapters = ormUtil.overrideConfig(model);

		// Wrap model in Waterline.Collection.extend
		var Model = Waterline.Collection.extend(sails.models[model]);

		new Model({

			// Pass in a default tableName, can be overwritten in a model definition
			tableName: model,

			// Pass in all the adapters Sails knows about
			adapters: adapters

		}, function(err, collection) {
			if (err) return cb(err);

			// Set Model to instantiated Collection
			sails.models[model] = collection;

			// Globalize Model if Enabled
			if (sails.config.globals.models) {
				var globalName = sails.models[model].globalId || sails.models[model].identity;
				global[globalName] = collection;
			}

			cb();
		});
	}

};
