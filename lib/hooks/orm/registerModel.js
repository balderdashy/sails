module.exports = function (sails) {

	/**
	 * Module dependencies.
	 */
	var ormUtil = require('./util')(sails);



	return registerModel ;


	/**
	 * Instantiate a new Waterline Collection from the Sails Model
	 */

	function registerModel (modelId, cb) {

		// Determine if model is schema or schemaless
		var modelAdapters = sails.models[modelId].adapter;

		// Check if main model adapter config has a default schema setting
		var adapter = sails.adapters[modelAdapters[0]];
		var defaultSchema = adapter.config && adapter.config.hasOwnProperty('schema');

		// Check if the model is overriding the schema setting
		var overrideSchema = typeof sails.models[modelId].schema !== 'undefined';

		// Set the schema value if there is a default and nothing is overriding it
		if(defaultSchema && !overrideSchema) {
			sails.models[modelId].schema = adapter.config && adapter.config.schema;
		}

		// Mixin local model defaults to the adapters passed into the model
		var adapters = ormUtil.overrideConfig(modelId);

		// Wrap model in Waterline.Collection.extend
		var Model = Waterline.Collection.extend(sails.models[modelId]);

		new Model({

			// Pass in a default tableName, can be overwritten in a model definition
			tableName: modelId,

			// Pass in all the adapters Sails knows about
			adapters: adapters

		}, function(err, collection) {
			if (err) return cb(err);

			// Set Model to instantiated Collection
			sails.models[modelId] = collection;

			// Globalize Model if Enabled
			if (sails.config.globals.models) {
				var globalName = sails.models[modelId].globalId || sails.models[modelId].identity;
				global[globalName] = collection;
			}

			cb();
		});
	}

};
