// Dependencies
var async = require('async');
var _ = require('underscore');
_.str = require('underscore.string');
var parley = require('parley');

// Prototype definitions
var Adapter = require('./adapter.js');
var Collection = require('./collection');

// Util
var modules = require('../loader');
var util = require('../util');
var fs = require('fs-extra');

// Make existsSync not crash on older versions of Node
fs.existsSync = fs.existsSync || require('path').existsSync;


/**
* Prepare waterline to interact with adapters
*/
module.exports = function (options,cb) {
	var self = this;

	// If logger was passed in, use it.  Otherwise, use the console.
	var log = options.log || console.log;

	// Read default global waterline config and extend with user options
	var waterlineConfig = require('./config.js');
	var collectionDefaults = _.extend(waterlineConfig.collection,options.collection);
	waterlineConfig = _.extend(waterlineConfig, options);
	waterlineConfig.collection = collectionDefaults;

	// Trim slashes off of app path
	waterlineConfig.appPath = _.str.rtrim(waterlineConfig.appPath,'/');

	// Only tear down waterline once 
	// (if teardown() is called explicitly, don't tear it down when the process exits)
	var tornDown = false;
	
	var adapterDefs = _.extend({},options.adapters);

	// Create dictionaries out of adapter and collection defs
	var collectionDefs = _.extend({},options.collections);

	// Spawn asynchronous thread of execution
	var $$ = new parley();

	// TODO: load additional models asynchronously

	// Search collections for adapters not passed in and require them
	// Then merge that set with the passed-in adapters
	_.extend(adapterDefs,getMissingAdapters(collectionDefs));

	// Instantiate adapters
	var adapters = _.clone(adapterDefs);
	$$(async.forEach)(_.keys(adapters), instantiateAdapter);

	// Extend collection defs using their adapter defaults,
	// then waterline defaults
	$$(function (xcb) {
		collectionDefs = util.objMap(collectionDefs, function (collectionDef) {
			return _.defaults(collectionDef, waterlineConfig.collection, adapters[collectionDef.adapter].defaults);
		});
		xcb();
	})();

	// Set up transaction collections for each adapter, if they have a commitLog defined
	$$(async.forEach)(_.keys(adapters), function (adapterName, cb) {
		var commitLog = adapters[adapterName].commitLog;
		if (!commitLog) return cb();

		var transactionAdapter = adapters[commitLog.adapter];
		
		// If transaction adapter unknown, fetch it
		if (!transactionAdapter) {
			adapters[commitLog.adapter] = requireAdapter(commitLog.adapter);
			instantiateAdapter(commitLog.adapter, afterwards);
		}
		else afterwards(null, transactionAdapter);
	
		function afterwards(err, transactionAdapter) {
			if (err) return cb(err);

			// Instantiate transaction collection
			new Collection(commitLog, transactionAdapter, function (err,transactionCollection) {
				adapters[adapterName].transactionCollection = transactionCollection;
				return cb();
			});
		}
	});

	// Instantiate collections
	var collections = _.clone(collectionDefs);
	$$(async.forEach)(_.keys(collections), instantiateCollection);

	// Provide hook for process-end event and teardown waterline
	$$(listenForProcessEnd)();
	
	// Waterline is ready-- fire the callback,
	// passing back instantiated adapters and models
	$$(cb)(null, {
		adapters: adapters,
		collections: collections
	});




	// Discover and include any "missing" adapters
	// (adapters which are defined in collections but were not passed in)
	function getMissingAdapters (collectionDefs) {
		var foundAdapterDefs = {};

		_.each(collectionDefs, function (collectionDef, collectionName) {


			// Assume default adapter if adapter is not defined
			if (!collectionDef.adapter) collectionDef.adapter = waterlineConfig.collection.adapter;

			var adapterName = collectionDef.adapter;

			// If the adapter def is not a string, something is not right
			if (!_.isString(adapterName)) throw new Error("Invalid adapter name ("+adapterName+") in collection (" + collectionName +")");

			// Already found
			else if (foundAdapterDefs[adapterName]) return;

			// User adapter defined-- use that
			else if (adapterDefs[adapterName]) foundAdapterDefs[adapterName] = adapterDefs[adapterName];

			// If this adapter is unknown, try to require it
			else foundAdapterDefs[adapterName] = requireAdapter(adapterName, collectionName);
		});

		return foundAdapterDefs;
	}

	// Try to import an unknown adapter
	function requireAdapter(adapterName, collectionName) {

		// First, try to stat the adapter module
		var modulePath = waterlineConfig.appPath+'/node_modules/'+adapterName;
		var exists = fs.existsSync(modulePath);
		log.verbose('Loading module ' + adapterName + "...");

		// If it exists, require it.
		if (exists) return require(modulePath);
		else {
			var err = "Unknown adapter ("+adapterName+") in collection (" + collectionName +")";
			log.error(err);
			log.error("Try running: npm install "+adapterName);
			log.error("To save the adapter as a permanent dependency, run: npm install "+adapterName+" --save");
			throw new Error(err);
		}
		
	}


	// Adapter definition must be called as a function
	// Defining adapters as functions allows them maximum flexibility (vs. simple objects)
	function instantiateAdapter (adapterName, cb) {		
		new Adapter(adapters[adapterName], function (err, adapter) {
			adapters[adapterName] = adapter;
			return cb(err, adapter);
		});
	}

	// Instantiate a new collection
	function instantiateCollection (collectionName, cb) {
		var collectionDef = collections[collectionName];

		// Get instantiated adapter for this collection
		var adapter = adapters[collectionDef.adapter];

		// Instantiate new collection using definition and adapter
		new Collection(collectionDef, adapter, function(err, collection) {
			collections[collectionName] = collection;
			return cb(err);
		});
	}


	// Assign listener for process-end
	// (this logic lives here to avoid assigning multiple events in each adapter and collection)
	function listenForProcessEnd(xcb) {
		var exiting = false;
		process.on('SIGINT', serverOnHalt);
		process.on('SIGTERM', serverOnHalt);
		process.on('exit', function process_exit() {
			// If SIGINT or SIGTERM wasn't run, this is a dirty exit-- 
			if (!exiting) log.verbose('Server stopped.');
		});
		function serverOnHalt (){
			exiting = true;
			teardown(function () {
				process.exit();
			});
		}
		xcb();
	}

	// Tear down all open waterline adapters (and therefore, collections)
	function teardown (cb) {
		cb = cb || function(){};

		// Only tear down once
		if (tornDown) return cb("Waterline is already torn down!  I can't do it again!");
		tornDown = true;

		// Fire each adapter's teardown event
		async.forEach(_.values(adapters),function (adapter,cb) {
			adapter.teardown(cb);
		},cb);
	}

	// Expose public teardown() method
	module.exports.teardown = teardown;

};
