// Dependencies
var async = require('async');
var _ = require('underscore');
var parley = require('parley');

// mock sails for now
var config = {
	createdAt: true,
	updatedAt: true
};

/**
* Prepare waterline to interact with adapters
*/
module.exports = function (adapters,collections,cb) {

	// connect each adapter in series
	// TODO: parallelizing this process will increase load-time
	var $$ = new parley();
	for (var adapterName in adapters) {
		var adapter = adapters[adapterName];

		// bind adapter methods to self
		adapter = _.bindAll(adapter);

		// connect to adapter
		$$(adapter).connect();
	}

	// Connect each model to its adapter and sync it
	for (var collectionName in collections) {
		var collection = collections[collectionName];

		// Use adapter shortname in model def. to look up actual object
		collection.adapter = adapters[collection.adapter];

		// TODO: wrap calls to adapter with common functionality

		// Sync (depending on scheme)
		switch (collection.scheme) {
			case "drop"	: collection.sync = _.bind(collection.adapter.sync.drop, collection.adapter, collection); break;
			case "alter": collection.sync = _.bind(collection.adapter.sync.alter, collection.adapter, collection); break;
			default		: throw new Error('Invalid scheme in '+collection.identity+' model!');
		}
		$$(collection).sync();

		// Build actual collection object from definition
		collections[collectionName] = new Collection(collection);
	}

	// Pass instantiated adapters and models
	$$(cb)(null,{
		adapters: adapters,
		collections: collections
	});
};



var Collection = module.exports.Collection = function(definition) {
	_.extend(this, definition);

	this.create = function(values, cb) {
		this.adapter.create(this,values,cb);
	};
	this.find = function(criteria, cb) {

	};
	this.update = function(criteria, values, cb) {

	};
	this.destroy = function(criteria, cb) {

	};

	// Bind instance methods to collection
	_.bindAll(this);
};


























/**
 * Run a method on an object -OR- each item in an array and return the result
 * Also handle errors gracefully
 */
_.plural = function(collection, application) {
	if(_.isArray(collection)) {
		return _.map(collection, application);
	} else if(_.isObject(collection)) {
		return application(collection);
	} else {
		throw "Invalid collection passed to _.plural aggreagator:" + collection;
	}
};







var Model = module.exports.Model = function(values) {

		// Join the subset of models with another collection
		this.join = function(otherModel, fk, cb) {


		};
	};



// Extend adapter definition
var Adapter = module.exports.Adapter = function (adapter) {
	_.extend(this, adapter);

	this.config = adapter.config;

	this.connect = function(cb) {
		console.log("I AM",this);
		adapter.connect(cb);
	};
	this.synchronize = function (collection,cb) {
		adapter.sync[adapter.scheme](collection,cb);
	};
	this.define = function(collection, definition, cb) { 
		adapter.define.apply(null,arguments);
	};
	this.describe = function(collection, cb) { 
		adapter.describe.apply(null,arguments);
	};
	this.drop = function(collection, cb) { 
		adapter.drop.apply(null,arguments);
	};
	this.alter = function (collection,newAttrs,cb) { 
		adapter.alter.apply(null,arguments);
	};
	this.create = function(collection, values, cb) { 
		adapter.create.apply(null,arguments);
	};
	this.find = function(collection, criteria, cb) {
		criteria = normalizeCriteria(criteria);
		adapter.find.apply(null,arguments);
	};
	this.update = function(collection, criteria, values, cb) {
		criteria = normalizeCriteria(criteria);
		adapter.update.apply(null,arguments);
	};
	this.destroy = function(collection, criteria, cb) {
		criteria = normalizeCriteria(criteria);
		adapter.destroy.apply(null,arguments);
	};
	this.lock = function (collection, criteria, cb) { 
		adapter.lock.apply(null,arguments);
	};
	this.unlock = function (collection, criteria, cb) { 
		adapter.unlock.apply(null,arguments);
	};
	this.join = function(thisModel, otherModel, key, foreignKey, left, right, cb) {
		adapter.join.apply(null,arguments);
	};
	return this;
};

// Normalize the different ways of specifying criteria into a uniform object
function normalizeCriteria (criteria) {
	if((_.isFinite(criteria) || _.isString(criteria)) && +criteria > 0) {
		criteria = {
			id: +criteria
		};
	}
	if(!_.isObject(criteria)) {
		throw 'Invalid criteria, ' + criteria + ' in find()';
	}
	return criteria;
}