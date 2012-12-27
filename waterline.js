// Dependencies
var async = require('async');
var _ = require('underscore');
var parley = require('parley');

// Prototype definitions
var Adapter = require('./adapter.js');
var Collection = require('./collection.js');
var Model = require('./model.js');

// Read global config
var config = require('./config.js');

// Util
var buildDictionary = require('./buildDictionary.js');

// Include built-in adapters
var builtInAdapters = buildDictionary(__dirname + '/adapters', /(.+Adapter)\.js$/, /Adapter/);

/**
* Prepare waterline to interact with adapters
*/
module.exports = function (options,cb) {

	var adapters = options.adapters || {};
	var collections = options.collections || {};
	var log = options.log || console.log;
	var $$ = new parley();

	// Merge passed-in adapters with default adapters
	adapters = _.extend(builtInAdapters,adapters);

	// Error aggregator obj
	// var errs;

	// initialize each adapter in series
	// TODO: parallelize this process (would decrease server startup time)
	$$(async).forEach(_.keys(adapters),prepareAdapter);

	// Instantiate special collections
	var transCol = $$(instantiateCollection)(config.transactionCollection);

	$$(function (err,transCol,xcb) {
		// Attach transaction collection to each adapter
		_.each(adapters,function(adapter,adapterName){
			adapters[adapterName].transactionCollection = transCol;
		});
		xcb();
	})(transCol);
	

	// TODO: in sails, in the same way ---->
	// set up session adapter
	// set up socket adapter
	// ------->

	// then associate each collection with its adapter and sync its schema
	$$(async).forEach(_.keys(collections),prepareCollection);


	// Attach transaction collection to each adapter
	$$(function (xcb) {

		// Pass instantiated adapters and models
		cb(null,{
			adapters: adapters,
			collections: collections
		});

		// Just for cleanliness/sanity
		xcb();
	})();


	// Instantiate an adapter object
	function prepareAdapter (adapterName,cb) {
		// Pass waterline config down to adapters
		adapters[adapterName].config = _.extend({
			log: log
		}, adapters[adapterName].config, config);

		// Build actual adapter object from definition
		// and replace the entry in the adapter dictionary
		adapters[adapterName] = new Adapter(adapters[adapterName]);

		// Load adapter data source
		adapters[adapterName].initialize(cb);
	}

	// Instantiate a collection object and store it back in the dictionary
	function prepareCollection (collectionName, cb) {
		var collection = collections[collectionName];
		instantiateCollection(collection,function (err,collection) {
			collections[collectionName] = collection;
			cb(err,collection);
		});
	}

	// Instantiate a collection object
	function instantiateCollection (collection, cb) {

		// If no adapter is specified, default to 'dirty'
		if (!collection.adapter) collection.adapter = 'dirty';

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
		collection = new Collection(collection);

		// Synchronize schema with data source
		collection.sync(function (err){ cb(err,collection); });
	}
};
