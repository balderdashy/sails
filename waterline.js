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

// Only tear down waterline once 
// (if teardown() is called explicitly, don't tear it down when the process exits)
var tornDown = false;

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
	var transactionsDb = $$(instantiateCollection)(config.transactionCollection);

	// Attach transaction collection to each adapter
	$$(function (err,transactionsDb,xcb) {
		_.each(adapters,function(adapter,adapterName){
			adapters[adapterName].transactionCollection = transactionsDb;
		});
		xcb();
	})(transactionsDb);
	

	// TODO: in sails, in the same way ---->
	// set up session adapter
	// set up socket adapter
	// ------->

	// then associate each collection with its adapter and sync its schema
	$$(async).forEach(_.keys(collections),prepareCollection);

	// Now that the others are instantiated, add transaction collection to list
	// (this is so events like teardownCollection() fire properly)
	$$(function (err,transactionsDb,xcb) {
		collections[transactionsDb.identity] = transactionsDb;
		xcb();
	})(transactionsDb);


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
		collection.sync(function (err){ 
			if (err) throw err;
			cb(err,collection); 
		});
	}

};

// Tear down all open waterline adapters and collections
function teardown (options,cb) {
	// Only tear down once
	if (tornDown) return cb && cb();
	tornDown = true;
	cb = cb || function(){};
	
	console.log("TEARDOWN");

	async.auto({

		// Fire each adapter's teardown event
		adapters: function (cb) {
			async.forEach(options.adapters,function (adapter,cb) {
				console.log(adapter);
				adapter.teardown(cb);
			},cb);
		},

		// Fire each collection's teardown event
		collections: function (cb) {
			async.forEach(options.collections,function (collection,cb) {
				collection.adapter.teardownCollection(collection.identity,cb);
			},cb);
		}
	}, cb);
}
