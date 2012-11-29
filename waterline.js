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
_.plural = function (collection,application) {
	if (_.isArray(collection)) {
		return _.map(collection,application);
	}
	else if (_.isObject(collection)) {
		return application(collection);
	}
	else {
		throw "Invalid collection passed to _.plural aggreagator:"+collection;
	}
};




var Collection = function (definition) {

	this.create = function (values,cb) {

	};
	this.find = function (criteria,cb) {

	};
	this.update = function (criteria,values,cb) {

	};
	this.destroy = function (criteria,cb) {

	};
};

var Model = function (values) {

	// Join the subset of models with another collection
	this.join = function (otherModel,fk,cb) {
		

	};
};



// Usage
// MySQLAdapter.registerModel('User',{

// });
var Adapter = {

	_connect: function () {
		// Bind all methods to this context
		_.bindAll(this);
	},

	// Synchronize the data store with the defined models
	_synchronize: function(models, cb) {
		this.sync[this.scheme](models,cb);
	},

	// DDL (uniform across all waterline adapters)
	_define: function (name,cb){
		this.find.apply(this,arguments);
	},
	_describe: function (name,def,cb){
		this.find.apply(this,arguments);
	},
	_alter: function (name,def,cb){
		this.find.apply(this,arguments);
	},
	_drop: function (name,cb){
		this.find.apply(this,arguments);
	},

	// DQL (uniform across all waterline adapters)
	_create: function (name,def,cb) {
		this.find.apply(this,arguments);
	},
	_find: function (name,criteria,cb) {
		criteria = this._normalizeCriteria(criteria);
		this.find.apply(this,arguments);
	},
	_update: function (name,criteria,def,cb) {
		criteria = this._normalizeCriteria(criteria);
		this.find.apply(this,arguments);
	},
	_destroy: function (name,criteria,cb) {
		criteria = this._normalizeCriteria(criteria);
		this.find.apply(this,arguments);
	},


	// Generate a new model
	registerModel: function (modelName,definition) {
		sails.log("Binding "+modelName+" to adapter:",this);
		sails.models[modelName] = new Collection(this,definition);
		if (global[modelName]) {
			sails.log.warn("WARNING: Could not create your model, "+modelName+" in the global namespace.  Another variable w/ that name already exists.");
		}
		else {
			global[modelName] = sails.models[modelName];
		}
		return sails.models[modelName];
	},

	// Turn a values object or a list of values objects into a model or list of models
	build: function (collection) {
		_.plural(collection,this._buildModel,"Invalid collection passed to build():"+collection);
	},
	// Create a single model
	_buildModel: function (values) {
		return values;
	},

	// Normalize the different ways of specifying criteria into a uniform object
	_normalizeCriteria: function (criteria) {
		if ((_.isFinite(criteria) || _.isString(criteria)) && +criteria > 0) {
			criteria = {
				id: +criteria
			};
		}
		if (!_.isObject(criteria)) {
			throw 'Invalid criteria, ' + criteria + ' in find()';
		}
		return criteria;
	}
};

module.exports= Adapter;