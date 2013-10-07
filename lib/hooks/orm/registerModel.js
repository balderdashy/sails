module.exports = function (sails) {

	/**
	 * Module dependencies.
	 */
	var util = require('../../util'),
		Waterline = require('waterline');



	return registerModel ;


	/**
	 * Instantiate a new Waterline Collection from the Sails Model
	 */

	function registerModel (modelID, cb) {

		/////////////////////////////////////////////////////////////////////////////////
		// TODO: figure out if this is still relevant
		/////////////////////////////////////////////////////////////////////////////////
		/////////////////////////////////////////////////////////////////////////////////
		/////////////////////////////////////////////////////////////////////////////////

		// // Determine if model is schema or schemaless
		// var modelAdapters = sails.models[modelID].adapter;

		// // Check if main model adapter config has a default schema setting
		// var adapter = sails.adapters[modelAdapters[0]];
		// var defaultSchema = adapter.config && adapter.config.hasOwnProperty('schema');

		// // Check if the model is overriding the schema setting
		// var overrideSchema = typeof sails.models[modelID].schema !== 'undefined';

		// // Set the schema value if there is a default and nothing is overriding it
		// if(defaultSchema && !overrideSchema) {
		// 	sails.models[modelID].schema = adapter.config && adapter.config.schema;
		// }
		/////////////////////////////////////////////////////////////////////////////////
		/////////////////////////////////////////////////////////////////////////////////
		/////////////////////////////////////////////////////////////////////////////////

		// var adapters = ormUtil.overrideConfig(modelID);

		// Wrap model in Waterline.Collection.extend
		var modelDef = sails.models[modelID];
		var Model = Waterline.Collection.extend(modelDef);

		// Build set of customized/cloned adapters
		// Take the subset of relevant (referenced in this model's `connections`) adapters 
		// from sails.adapters, then merge in the appropriate config from the connections.
		var adHocAdapters = {};
		util.each(modelDef.connections, function buildAdapterCloneForConnection (connection) {
			var adapterID = connection.adapter;
			var clonedAdapter = util.cloneDeep(sails.adapters[adapterID]);
			var clonedConnection = util.cloneDeep(connection);
			clonedAdapter.config = util.extend(clonedAdapter.config || {} ,clonedConnection);			

			delete clonedAdapter.config.adapter;
			clonedAdapter.config.module = clonedAdapter.config.adapter;
			clonedAdapter.config.schema = false;
			adHocAdapters[adapterID] = clonedAdapter;
		});
		console.log('*** für model :: ', modelID, '**', adHocAdapters);

		new Model({

			// Pass in a default tableName, can be overwritten in a model definition
			tableName: modelID,

			// Pass in adapters that were built from connections Sails
			// (Waterline only understands adapters)
			adapters: adHocAdapters

		}, function(err, collection) {
			if (err) return cb(err);

			// Save `sails.models[modelID]` as instantiated Waterline Collection
			sails.models[modelID] = collection;

			cb();
		});
	}

};
