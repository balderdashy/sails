// Extend adapter definition
var Adapter = module.exports = function (definition) {
	this.config = definition.config;

	this.initialize = function(cb) {
		definition.connect(cb);
	};
	this.teardown = function (cb) {
		definition.teardown(cb);
	};


	this.define = function(collectionName, definition, cb) { 
		definition.define.apply(null,arguments);
	};
	this.describe = function(collectionName, cb) { 
		definition.describe.apply(null,arguments);
	};
	this.drop = function(collectionName, cb) { 
		definition.drop.apply(null,arguments);
	};
	this.alter = function (collectionName,newAttrs,cb) { 
		definition.alter.apply(null,arguments);
	};



	this.create = function(collectionName, values, cb) { 
		definition.create.apply(null,arguments);
	};
	this.find = function(collectionName, criteria, cb) {
		criteria = normalizeCriteria(criteria);
		definition.find.apply(null,arguments);
	};
	this.update = function(collectionName, criteria, values, cb) {
		criteria = normalizeCriteria(criteria);
		definition.update.apply(null,arguments);
	};
	this.destroy = function(collectionName, criteria, cb) {
		criteria = normalizeCriteria(criteria);
		definition.destroy.apply(null,arguments);
	};


	this.lock = function (collectionName, criteria, cb) { 
		definition.lock.apply(null,arguments);
	};
	this.unlock = function (collectionName, criteria, cb) { 
		definition.unlock.apply(null,arguments);
	};

	// If @thisModel and @otherModel are both using this adapter, do a more efficient remote join.
	// (By default, an inner join, but right and left outer joins are also supported.)
	this.join = function(collectionName, otherCollectionName, key, foreignKey, left, right, cb) {
		cb();
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
	_.bindAll(definition);
	_.bindAll(this);
	_.bind(this.sync.drop,this);
	_.bind(this.sync.alter,this);
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