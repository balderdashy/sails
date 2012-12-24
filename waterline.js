// Dependencies
var async = require('async');
var _ = require('underscore');
var parley = require('parley');

// Prototype definitions
var Adapter = require('./adapter.js');
var Collection = require('./collection.js');
var Model = require('./model.js');

// Util
var buildDictionary = require('./buildDictionary.js');

// Include built-in adapters
var builtInAdapters = buildDictionary(__dirname + '/adapters', /(.+Adapter)\.js$/, /Adapter/);

/**
* Prepare waterline to interact with adapters
*/
module.exports = function (options,cb) {

	var adapters = options.adapters;
	var collections = options.collections;
	var log = options.log || console.log;
	
	var $$ = new parley();

	// Merge passed-in adapters with default adapters
	adapters = _.extend(builtInAdapters,adapters || {});

	// Error aggregator obj
	var errs;

	// initialize each adapter in series
	// TODO: parallelize this process (would decrease server startup time)
	for (var adapterName in adapters) {

		// Pass waterline config down to adapters
		adapters[adapterName].config = _.extend({
			log: log
		}, adapters[adapterName].config);

		// Build actual adapter object from definition
		// and replace the entry in the adapter dictionary
		adapters[adapterName] = new Adapter(adapters[adapterName]);

		// Load adapter data source
		$$(adapters[adapterName]).initialize();
	}

	// When all adapters are loaded,
	// associate each model with its adapter and sync its schema
	collections = collections || {};
	for (var collectionName in collections) {
		var collection = collections[collectionName];


		// Use adapter shortname in model def. to look up actual object
		if (_.isString(collection.adapter)) {
			if (! adapters[collection.adapter]) throw "Unknown adapter! ("+collection.adapter+")  Maybe try installing it?";
			else collection.adapter = adapters[collection.adapter];
		}

		// Then check that a valid adapter object was retrieved (or already existed)
		if (!(_.isObject(collection.adapter) && collection.adapter._isWaterlineAdapter)) {
			throw "Invalid adapter!";
		}

		// Build actual collection object from definition
		collections[collectionName] = new Collection(collection);

		// Synchronize schema with data source
		var e = $$(collection).sync();
		$$(function (e) {errs = errs || e;}).ifError(e);
	}

	// Pass instantiated adapters and models
	$$(cb)(errs,{
		adapters: adapters,
		collections: collections
	});
};