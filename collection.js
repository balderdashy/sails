var _ = require('underscore');
var parley = require('parley');
var util = require('sails-util');

var Collection = module.exports = function(definition) {
	var self = this;

	// ********************************************************************
	// Configure collection-specific configuration
	// Copy over only the methods from the adapter that you need, and modify if necessary
	// ********************************************************************

	// If persistent is false, this collection will be wiped and recreated when the server starts
	// (defaults to true)
	definition.persistent = !_.isUndefined(definition.persistent) ? definition.persistent : true;
	

	if (!definition.persistent) {
		definition.sync = _.bind(definition.adapter.sync.drop, definition.adapter, definition);
	}
	else if (definition.persistent) {
		definition.sync = _.bind(definition.adapter.sync.alter, definition.adapter, definition);
	}
	
	// Absorb definition methods
	_.extend(this, definition);

	// Define core methods
	this.create = function(values, cb) {
		if (_.isFunction(values)) {
			cb = values;
			values = null;
		}
		return this.adapter.create(this.identity,values,cb);
	};
	// Call find method in adapter
	this.find = function(options, cb) {
		if (_.isFunction(options) || !options) {
			throw new Error('find(criteria,callback) requires a criteria parameter.  To get all models in a collection, use findAll()');
		}
		return this.adapter.find(this.identity,options,cb);
	};
	this.findAll = function (cb) {
		return this.adapter.find(this.identity,null,cb);
	};
	// Call update method in adapter
	this.update = function(criteria, values, cb) {
		return this.adapter.update(this.identity,criteria,values,cb);
	};
	// Call destroy method in adapter
	this.destroy = function(criteria, cb) {
		return this.adapter.destroy(this.identity,criteria,cb);
	};

	this.findOrCreate = function (criteria, values, cb) { 
		return this.adapter.findOrCreate(this.identity,criteria,values,cb);
	};
	this.findAndUpdate = function (criteria, values, cb) { 
		return this.adapter.findAndUpdate(this.identity, criteria, values, cb); 
	};
	this.findAndDestroy = function (criteria, cb) { 
		return this.adapter.findAndDestroy(this.identity, criteria, cb); 
	};

	this.transaction = function (name, cb) {
		return this.adapter.transaction(name, cb);
	};

	//////////////////////////////////////////
	// Utility methods
	//////////////////////////////////////////

	// Return a trimmed set of the specified attributes
	// with only the attributes which actually exist in the server-side model
	this.filter = function(params) {
		var trimmedParams = util.objFilter(params, function(value, name) {
			return _.contains(_.keys(this.attributes), name);
		}, this);
		return trimmedParams;
	};
	this.trimParams = this.filter;

	// Bind instance methods to collection
	_.bindAll(definition);
	_.bindAll(this);
};