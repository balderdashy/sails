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

var builtInCollections = buildDictionary(__dirname + '/collections', /(.+)\.js$/);

/**
* Prepare waterline to interact with adapters
*/
module.exports = function (options,cb) {
	// Only tear down waterline once 
	// (if teardown() is called explicitly, don't tear it down when the process exits)
	var tornDown = false;

	var adapters = options.adapters || {};
	var collections = options.collections || {};
	var log = options.log || console.log;
	var $$ = new parley();

	// Merge passed-in adapters + collections with defaults
	adapters = _.extend(builtInAdapters,adapters);
	collections = _.extend(builtInCollections,collections);
	// console.log("----------KEYS----->",_.keys(collections));


	// Error aggregator obj
	// var errs;

	// initialize each adapter in series
	// TODO: parallelize this process (would decrease server startup time)
	$$(async).forEach(_.keys(adapters),prepareAdapter);

	// then associate each collection with its adapter and sync its schema
	$$(async).forEach(_.keys(collections),prepareCollection);

	// Now that everything is instantiated, add transaction collection to each collection's adapter
	$$(function (xcb) {
		_.each(collections,function(collection) {
			collection.adapter.transactionCollection = collections[config.transactionDbIdentity];
			// console.log("ADDED ",collection.adapter);
		});
		xcb();
	})();


	// Fire teardown() on process-end and make it public
	// (this logic lives here to avoid assigning multiple events in each adapter and collection)
	$$(function (xcb) {

		// Make teardown() public
		module.exports.teardown = function(options,cb) {
			teardown({
				adapters: adapters,
				collections: collections
			},cb);
		};

		// When process ends, fire teardown
		process.on('SIGINT', process.exit);
		process.on('SIGTERM', process.exit);
		process.on('exit', function() {
			teardown({
				adapters: adapters,
				collections: collections
			});
		});

		xcb();
	})();

	
	// Pass instantiated adapters and models
	$$(function (xcb) {
		cb(null,{
			adapters: adapters,
			collections: collections
		});

		xcb();
	})();


	// Instantiate an adapter object
	function prepareAdapter (adapterName,cb) {
		// Pass waterline config down to adapters
		adapters[adapterName].config = _.extend({
			log: log
		}, config, adapters[adapterName].config);

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
	function instantiateCollection (definition, cb) {

		// If no adapter is specified, default to 'dirty'
		if (!definition.adapter) definition.adapter = 'dirty';

		// Use adapter shortname in model def. to look up actual object
		if (_.isString(definition.adapter)) {
			if (! adapters[definition.adapter]) throw "Unknown adapter! ("+definition.adapter+")  Did you include a valid adapter with this name?";
			else definition.adapter = adapters[definition.adapter];
		}

		// Then check that a valid adapter object was retrieved (or already existed)
		if (!(_.isObject(definition.adapter) && definition.adapter._isWaterlineAdapter)) {
			throw "Invalid adapter!";
		}

		// Build actual collection object from definition
		var collection = new Collection(definition);

		// Call initializeCollection() event on adapter
		collection.adapter.initializeCollection(collection.identity,function (err) {
			if (err) throw err;

			// Synchronize schema with data source
			collection.sync(function (err) { 
				if (err) throw err;
				cb(err,collection); 
			});
		});

	}

	// Tear down all open waterline adapters and collections
	function teardown (options,cb) {
		cb = cb || function(){};

		// Only tear down once
		if (tornDown) return cb();
		tornDown = true;

		async.auto({

			// Fire each adapter's teardown event
			adapters: function (cb) {
				async.forEach(_.values(options.adapters),function (adapter,cb) {
					adapter.teardown(cb);
				},cb);
			},

			// Fire each collection's teardown event
			collections: function (cb) {
				async.forEach(_.values(options.collections),function (collection,cb) {
					collection.adapter.teardownCollection(collection.identity,cb);
				},cb);
			}
		}, cb);
	}
};

