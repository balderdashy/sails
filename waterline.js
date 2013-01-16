// Dependencies
var async = require('async');
var _ = require('underscore');
_.str = require('underscore.string');
var parley = require('parley');

// Prototype definitions
var Adapter = require('./adapter.js');
var Collection = require('./collection.js');
var Model = require('./model.js');

// Util
var modules = require('sails-moduleloader');

// Include built-in adapters and collections
var builtInAdapters = modules.required({
	dirname		: __dirname + '/adapters',
	filter		: /(.+Adapter)\.js$/,
	replaceExpr	: /Adapter/
});
var builtInCollections = modules.required({
	dirname		: __dirname + '/collections',
	filter		: /(.+)\.js$/
});

/**
* Prepare waterline to interact with adapters
*/
module.exports = function (options,cb) {
	var self = this;

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

	// Read global config
	// Extend default config with user options
	var config = require('./config.js');
	config = _.extend(config, options);

	// Error aggregator obj
	// var errs;

	// initialize each adapter in series
	// TODO: parallelize this process (would decrease server startup time)
	$$(async).forEach(_.keys(adapters),prepareAdapter);

	// then associate each collection with its adapter and sync its schema
	$$(async).forEach(_.keys(collections),prepareCollection);

	// Now that everything is instantiated, augment the live collections with a transaction collection
	$$(async).forEach(_.values(collections),addTransactionCollection);

	// And sync them
	$$(async).forEach(_.values(collections),syncCollection);


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
		var exiting = false;
		process.on('SIGINT', serverOnHalt);
		process.on('SIGTERM', serverOnHalt);
		// If SIGINT or SIGTERM wasn't run, this is a dirty exit-- 
		process.on('exit', function process_exit() {
			if (!exiting) log.warn("Server stopped itself.");
		});
		function serverOnHalt (){
			exiting = true;
			teardown({
				adapters: adapters,
				collections: collections
			}, function () {
				process.exit();
			});
		}
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


	// Use adapter shortname to look up actual adapter
	// cb :: (err, adapter)
	function getAdapterByIdentity (identity, cb) {

		if (adapters[identity]) cb(null, adapters[identity]);

		// If the adapter doesn't exist yet, try to require it
		else loadAdapter(identity, cb);
	}

	// cb :: (err, adapter)
	function loadAdapter (identity, cb) {
		// Add to adapters set
		adapters[identity] = require(identity) ();
		
		// Then prepare the adapter
		prepareAdapter(identity,function (err) {
			cb (err, adapters[identity]);
		});
	}

	// Instantiate a collection object
	function instantiateCollection (definition, cb) {

		// Track whether this collection can use the shared version of its adapter
		// or whether a new instance of the adapter needs to be instantiated
		// (necessary in cases w/ fundamentally different settings-- i.e. separate database)
		var sharedAdapter = false;

		// Whether to use the app's default adapter
		var defaultAdapter = false;

		// If no adapter is specified, default to whatever's in the config
		if (!definition.adapter) {

			// If no adapter is specifed, the default adapter will be used
			// (and it will be shared)
			defaultAdapter = true;
			sharedAdapter = true;

			definition.adapter = config.defaultAdapter;
		}

		// Adapter specified as a string
		if (_.isString(definition.adapter)) {

			// If the adapter is specifed as a string, it can be shared
			sharedAdapter = true;

			getAdapterByIdentity(definition.adapter, afterwards);
		}
		else if (_.isObject(definition.adapter)) {

			if (!definition.adapter.identity) return cb("No identity specified in adapter definition!");

			getAdapterByIdentity(definition.adapter.identity, function gotAdapter (err,adapter) {
			
				// If the shared adapter can't be used
				// Absorb relevant items from collection config into the cloned adapter definition
				// Instantiate a new, cloned adapter unique to this collection
				if (!sharedAdapter) {

					// TODO:	be smart and only maintain the minimum number of adapters in memory necessary
					//			Since adapter connections need only be config-specific
					var temporalIdentity = adapter.identity + '-' + definition.identity;
					
					// Add to adapters set (and pass in config object)
					adapters[temporalIdentity] = require(adapter.identity) (definition.adapter);
					
					// Then prepare the adapter
					prepareAdapter(temporalIdentity, function (err) {
						afterwards (err, adapters[temporalIdentity]);
					});
				}
				else afterwards(err,adapter);
			});
		}

		function afterwards(err, adapter) {
			if (err) return cb(err);
			
			// Check that a valid adapter object was retrieved (or already existed)
			if (!adapter || !_.isObject(adapter)) {
				console.error("Invalid adapter:",definition.adapter);
				throw new Error("Invalid adapter!");
			}

			// Inject a reference to the true adapter object in the collection def
			definition.adapter = adapter;

			// Build actual collection object from definition
			var collection = new Collection(definition);

			// Update the adapter's in-memory schema cache
			adapter._adapter.schema[collection.identity] = collection.schema;

			// Call initializeCollection() event on adapter
			collection.adapter.initializeCollection(collection.identity,function (err) {
				if (err) throw err;

				cb(err,collection);
			});
		}

	}

	// add transaction collection to each collection's adapter
	function addTransactionCollection (collection, cb) {
		collection.adapter.transactionCollection = collections[config.transactionDbIdentity];
		cb();
	}

	// Sync a collection w/ its adapter's data store
	function syncCollection (collection,cb) {
		// Synchronize schema with data source
		collection.sync(function (err) { 
			if (err) throw err;
			cb(err,collection); 
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

