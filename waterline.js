// Dependencies
var async = require('async');
var _ = require('underscore');
var parley = require('parley');

// Prototype definitions
var Adapter = require('./adapter.js');
var Collection = require('./collection.js');
var Model = require('./model.js');

// mock sails for now
var config = {
	createdAt: true,
	updatedAt: true
};

/**
* Prepare waterline to interact with adapters
*/
module.exports = function (adapters,collections,cb) {
	var $$ = new parley();

	// initialize each adapter in series
	// TODO: parallelize this process (would decrease server startup time)
	for (var adapterName in adapters) {

		// Build actual adapter object from definition
		// and replace the entry in the adapter dictionary
		adapters[adapterName] = new Adapter(adapters[adapterName]);

		// Load adapter data source
		$$(adapters[adapterName]).initialize();
	}

	// When all adapters are loaded,
	// associate each model with its adapter and sync its schema
	for (var collectionName in collections) {
		var collection = collections[collectionName];

		// Use adapter shortname in model def. to look up actual object
		collection.adapter = adapters[collection.adapter];

		// Build actual collection object from definition
		collections[collectionName] = new Collection(collection);

		// Synchronize schema with data source
		$$(collection).sync();
	}

	// Pass instantiated adapters and models
	$$(cb)(null,{
		adapters: adapters,
		collections: collections
	});
};

