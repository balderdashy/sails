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


////////////////////////////////////////////////////////////////////////
// UTILS
////////////////////////////////////////////////////////////////////////

// Mix in some commonly used underscore fns
_.mixin({

	// Really LOUD version of console.log.debug
	shout: function() {
		var args = _.values(arguments);

		console.log("\n");
		if(args.length == 1) {
			console.log("*", args[0]);
		} else {
			console.log("*", args.shift());
			console.log("------------------------------");
			args.length > 0 && _.each(args, function(arg) {
				console.log("   => ", arg, "   (" + (typeof arg) + ")");
			});
		}
	},

	// Get the file extension
	fileExtension: function(str) {
		if(str === null) return '';
		var pieces = String(str).split('.');
		return pieces.length > 1 ? _.last(pieces) : '';
	},

	// Pretty rendering of things like: 1st, 2nd, 3rd, 4th
	th: function(integer) {
		if(_.isFinite(+integer) && Math.floor(+integer) === +integer) {
			var lastDigit = +integer % 10;
			var lastTwoDigits = +integer % 100;
			var response = integer + "";

			// Handle n-teen case
			if(lastTwoDigits >= 11 && lastTwoDigits <= 13) {
				return response + "th";
			}

			// Handle general case
			switch(lastDigit) {
			case 1:
				return response + "st";
			case 2:
				return response + "nd";
			case 3:
				return response + "rd";
			default:
				return response + "th";
			}
		} else {
			console.warn("You specified: ", integer);
			throw new Error("But _.th only works on integers!");
		}
	},

	// ### _.objMap
	// _.map for objects, keeps key/value associations
	objMap: function(input, mapper, context) {
		return _.reduce(input, function(obj, v, k) {
			obj[k] = mapper.call(context, v, k, input);
			return obj;
		}, {}, context);
	},
	// ### _.objFilter
	// _.filter for objects, keeps key/value associations
	// but only includes the properties that pass test().
	objFilter: function(input, test, context) {
		return _.reduce(input, function(obj, v, k) {
			if(test.call(context, v, k, input)) {
				obj[k] = v;
			}
			return obj;
		}, {}, context);
	},
	// ### _.objReject
	//
	// _.reject for objects, keeps key/value associations
	// but does not include the properties that pass test().
	objReject: function(input, test, context) {
		return _.reduce(input, function(obj, v, k) {
			if(!test.call(context, v, k, input)) {
				obj[k] = v;
			}
			return obj;
		}, {}, context);
	},

	/**
	 * Usage:
	 *	obj -> the object
	 *	arguments* -> other arguments can be specified to be invoked on each of the functions
	 */
	objInvoke: function(obj) {
		var args = _.toArray(arguments).shift();
		return _.objMap(obj, function(fn) {
			return fn(args);
		});
	}
});


// Recursive underscore methods
_.recursive = {

	// fn(value,keyChain)
	all: function(collection, fn, maxDepth) {
		if(!_.isObject(collection)) {
			return true;
		}

		// Default value for maxDepth
		maxDepth = maxDepth || 50;

		// Kick off recursive function
		return _all(collection, null, [], fn, 0);

		function _all(item, key, keyChain, fn, depth) {
			var lengthenedKeyChain = [];

			if(depth > maxDepth) {
				throw new Error('Depth of object being parsed exceeds maxDepth ().  Maybe it links to itself?');
			}

			// If the key is null, this is the root item, so skip this step
			// Descend
			if(key !== null && keyChain) {
				lengthenedKeyChain = keyChain.slice(0);
				lengthenedKeyChain.push(key);
			}

			// If the current item is a collection
			if(_.isObject(item)) {
				return _.all(item, function(subval, subkey) {
					return _all(subval, subkey, lengthenedKeyChain, fn, depth + 1);
				});
			}
			// Leaf items land here and execute the iterator
			else {
				return fn(item, lengthenedKeyChain);
			}
		}
	},

	// fn(original,newOne,anotherNewOne,...)
	extend: function(original, newObj) {
		// TODO: make this work for more than one newObj
		// var newObjects = _.toArray(arguments).shift();

		return _.extend(original, _.objMap(newObj, function(newVal, key) {
			var oldVal = original[key];

			// If the new value is a non-object or array, 
			// or the old value is a non-object or array, use it
			if(_.isArray(newVal) || !_.isObject(newVal) || _.isArray(oldVal) || !_.isObject(oldVal)) {
				return !_.isUndefined(newVal) ? newVal : oldVal;
			}
			// Otherwise, we have to descend recursively
			else {
				return _.recursive.extend(oldVal, newVal);
			}
		}));
	},

	// fn(original,newOne,anotherNewOne,...)
	defaults: function(original, newObj) {
		// TODO: make this work for more than one newObj
		// var newObjects = _.toArray(arguments).shift();

		return _.extend(original, _.objMap(newObj, function(newVal, key) {
			var oldVal = original[key];

			// If the new value is a non-object or array, 
			// or the old value is a non-object or array, use it
			if(_.isArray(newVal) || !_.isObject(newVal) || _.isArray(oldVal) || !_.isObject(oldVal)) {
				return !_.isUndefined(oldVal) ? oldVal : newVal;
			}
			// Otherwise, we have to descend recursively
			else {
				return _.recursive.extend(oldVal, newVal);
			}
		}));
	}
};