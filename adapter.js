var _ = require('underscore');
var parley = require('parley');

var config = require('./config.js');

// Extend adapter definition
var Adapter = module.exports = function (adapter) {
	this.config = adapter.config;

	this.initialize = function(cb) {
		// When process ends, close all open connections
		var self = this;
		process.on('SIGINT', process.exit);
		process.on('SIGTERM', process.exit);
		process.on('exit', function () { self.teardown(); });

		adapter.initialize ? adapter.initialize(cb) : cb();
	};
	this.teardown = function (cb) {
		adapter.teardown ? adapter.teardown(cb) : cb && cb();
	};


	this.define = function(collectionName, definition, cb) { 


		// If id is not defined, add it
		// TODO: Make this check for ANY primary key
		// TODO: Make this disableable in the config
		if (!definition.attributes.id) {
			definition.attributes.id = {
				type: 'INTEGER',
				primaryKey: true,
				autoIncrement: true
			};
		}

		// If the config allows it, and they aren't already specified,
		// extend definition with updatedAt and createdAt
		if(config.createdAt && !definition.createdAt) definition.createdAt = 'DATE';
		if(config.updatedAt && !definition.updatedAt) definition.updatedAt = 'DATE';

		// Convert string-defined attributes into fully defined objects
		for (var attr in definition.attributes) {
			if(_.isString(definition[attr])) {
				definition[attr] = {
					type: definition[attr]
				};
			}
		}

		// Verify that collection doesn't already exist
		var $ = new parley();
		$(this).describe(collectionName);
		$(cb).ifNotNull("Trying to define a collection which already exists.");
		$(cb).ifError();
		adapter.define ? $(adapter).define(collectionName,definition,cb) : $(cb)();
	};

	this.describe = function(collectionName, cb) { 
		adapter.describe ? adapter.describe(collectionName,cb) : cb();
	};
	this.drop = function(collectionName, cb) { 
		// TODO: foreach through and delete all of the models for this collection
		adapter.drop ? adapter.drop(collectionName,cb) : cb();
	};
	this.alter = function (collectionName,newAttrs,cb) { 
		adapter.alter ? adapter.alter(collectionName,newAttrs,cb) : cb();
	};



	this.create = function(collectionName, values, cb) {
		adapter.create ? adapter.create(collectionName,values,cb) : cb();
	};
	this.find = function(collectionName, criteria, cb) {
		criteria = normalizeCriteria(criteria);
		adapter.find ? adapter.find(collectionName,criteria,cb) : cb();
	};
	this.update = function(collectionName, criteria, values, cb) {
		criteria = normalizeCriteria(criteria);
		adapter.update ? adapter.update(collectionName,criteria,values,cb) : cb();
	};
	this.destroy = function(collectionName, criteria, cb) {
		criteria = normalizeCriteria(criteria);
		adapter.destroy ? adapter.destroy(collectionName,criteria,cb) : cb();
	};


	this.lock = function (collectionName, criteria, cb) { 
		adapter.lock ? adapter.lock(collectionName,criteria,cb) : cb();
	};
	this.unlock = function (collectionName, criteria, cb) { 
		adapter.unlock ? adapter.unlock(collectionName,criteria,cb) : cb();
	};

	// If @thisModel and @otherModel are both using this adapter, do a more efficient remote join.
	// (By default, an inner join, but right and left outer joins are also supported.)
	this.join = function(collectionName, otherCollectionName, key, foreignKey, left, right, cb) {
		adapter.join ? adapter.join(collectionName, otherCollectionName, key, foreignKey, left, right, cb) : cb();
	};

	// Sync given collection's schema with the underlying data model
	// Scheme can be 'drop' or 'alter'
	// Controls whether database is dropped and recreated when app starts,
	// or whether waterline will try and synchronize the schema with the app models.
	this.sync = {

		// Drop and recreate collections
		drop: function(collection,cb) {
			var $ = new parley();
			$(this).drop(collection);
			$(this).define(collection.identity,collection);
			$(cb)();
		},
		
		// Alter schema
		alter: function(collection, cb) {
			var self = this;

			// Iterate through each attribute on each model in your app
			_.each(collection.attributes, function checkAttribute(attribute) {
				// and make sure that a comparable field exists in the data store
				// TODO
			});

			// Check that the attribute exists in the data store
			// TODO

			// If not, alter the collection to include it
			// TODO

			// Iterate through each attribute in this collection
			// and make sure that a comparable field exists in the model
			// TODO

			// If not, alter the collection and remove it
			// TODO
			cb(err);	
		}
	};

	// Bind adapter methods to self
	_.bindAll(adapter);
	_.bindAll(this);
	_.bind(this.sync.drop,this);
	_.bind(this.sync.alter,this);

	// Mark as valid adapter
	this._isWaterlineAdapter = true;
};


/**
 * Run a method on an object -OR- each item in an array and return the result
 * Also handle errors gracefully
 */
function plural (collection, application) {
	if(_.isArray(collection)) {
		return _.map(collection, application);
	} else if(_.isObject(collection)) {
		return application(collection);
	} else {
		throw "Invalid collection passed to plural aggreagator:" + collection;
	}
}

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