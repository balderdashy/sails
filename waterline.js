// Dependencies
var async = require('async');
var _ = require('underscore');
_.str = require('underscore.string');
var parley = require('parley');

// Prototype definitions
var Adapter = require('./adapter.js');
var Collection = require('./collection.js');

// Util
var modules = require('sails-moduleloader');

/**
* Prepare waterline to interact with adapters
*/
module.exports = function (options,cb) {
	var self = this;

	// Read global config
	// Extend default config with user options
	var globalConfig = require('./config.js');
	globalConfig = _.extend(globalConfig, options);

	// Only tear down waterline once 
	// (if teardown() is called explicitly, don't tear it down when the process exits)
	var tornDown = false;

	var log = options.log || console.log;
	var $$ = new parley();

	var collections = {};
	var adapters = {};

	// Extend with adapter and collection defs passed in 
	collections = _.extend(collections,options.collections);
	adapters = _.extend(adapters,options.adapters);


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
	function prepareAdapter (adapterName, config, cb) {
		// Instantiate adapter (if it hasn't been already)
		if (_.isFunction (adapters[adapterName])) {
			adapters[adapterName] = adapters[adapterName](config);
		}
		
		// Pass waterline config down to adapters
		adapters[adapterName].config = _.extend({
			log: log
		}, globalConfig, adapters[adapterName].config, config);
		console.log("config:",config,adapterName);


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

		if (!_.isString(definition.adapter)) {
			sails.log.error("Invalid adapter defintion:", definition.adapter, " in ",definition.identity);
			process.exit(1);
		}

		// Whether to use the app's default adapter
		var defaultAdapter = false;

		// If no adapter is specified, default to whatever's in the config
		if (!definition.adapter) {

			// If no adapter is specifed, the default adapter will be used
			defaultAdapter = true;

			definition.adapter = globalConfig.defaultAdapter;
		}

		var identity = definition.adapter;

		if (!adapters[identity]) {
			// If the adapter doesn't exist yet, try to require it
			adapters[identity] = require(identity);
		}

		// Then prepare the adapter
		return prepareAdapter(identity, definition, function (err) {
			return afterwards (err, adapters[identity]);
		});

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

			// Update the adapter's in-memory schema cache (if one exists)
			if (adapter._adapter.schema) {
				adapter._adapter.schema[collection.identity] = collection.schema;
			}

			// Call initializeCollection() event on adapter
			collection.adapter.initializeCollection(collection.identity,function (err) {
				if (err) throw err;

				cb(err,collection);
			});
		}

	}

	// add transaction collection to each collection's adapter
	function addTransactionCollection (collection, cb) {
		if (collection.adapter.transactionCollection) return cb();
		else {
			instantiateCollection(require('./defaultTransactionCollection.js'), function (err, result) {
				collection.adapter.transactionCollection = result;
				console.log("TRANSACTION COLLECTION:::",result);
				cb(err, result);
			});
		}
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

