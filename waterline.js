// Dependencies
var async = require('async');
var _ = require('underscore');

// mock sails for now
sails = {
	config: {
		waterline: {
			createdAt: true,
			updatedAt: true
		}
	},
	models: {}
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



var Collection = module.exports.Collection = function(definition) {
		_.extend(this, definition);

		this.create = function(values, cb) {

		};
		this.find = function(criteria, cb) {

		};
		this.update = function(criteria, values, cb) {

		};
		this.destroy = function(criteria, cb) {

		};
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


// var Adapter = module.exports.Adapter = {
// 	_connect: function() {
// 		// Bind all methods to this context
// 		_.bindAll(this);

// 		console.log("raw");
// 		this.
// 	},

// 	// Synchronize the data store with the defined models
// 	synchronize: function(collection, cb) {
// 		this.sync[this.scheme](models, cb);
// 	},

// 	// DDL (uniform across all waterline adapters)
// 	_define: function(collection, definition) {

// 	},
// 	_describe: function(collection) {

// 	},
// 	_alter: function(collection, def) {

// 	},
// 	_drop: function(collection) {

// 	},

// 	// DQL (uniform across all waterline adapters)
// 	_create: function(name, def) {

// 	},
// 	_find: function(name, criteria) {
// 		criteria = this._normalizeCriteria(criteria);

// 	},
// 	_update: function(name, criteria, def) {
// 		criteria = this._normalizeCriteria(criteria);

// 	},
// 	_destroy: function(name, criteria) {
// 		criteria = this._normalizeCriteria(criteria);

// 	},


// 	// Generate a new model and make it available in both sails.models and the global namespace
// 	registerModel: function(modelName, definition) {
// 		sails.log("Binding " + modelName + " to adapter:", this);
// 		sails.models[modelName] = new Collection(this, definition);
// 		if(global[modelName]) {
// 			sails.log.warn("WARNING: Could not create your model, " + modelName + " in the global namespace.  Another variable w/ that name already exists.");
// 			return null;
// 		} else {
// 			return global[modelName] = sails.models[modelName];
// 		}
// 	},

// 	// Turn a values object or a list of values objects into a model or list of models
// 	build: function(collection) {
// 		_.plural(collection, this.buildModel, "Invalid collection passed to build():" + collection);
// 	},
// 	// Create a single model
// 	buildModel: function(values) {
// 		return values;
// 	},

