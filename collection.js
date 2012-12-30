var _ = require('underscore');
var parley = require('parley');
var async = require('async');
var util = require('sails-util');
var config = require('./config');

var Collection = module.exports = function(definition) {
	var self = this;

	// ********************************************************************
	// Configure collection-specific configuration
	// Copy over only the methods from the adapter that you need, and modify if necessary
	// ********************************************************************

	// Pass up options from adapter  (defaults to global options)
	definition.migrate = definition.migrate || definition.adapter.config.migrate || config.migrate;
	definition.globalize = !_.isUndefined(definition.globalize) ? definition.globalize :
			!_.isUndefined(definition.adapter.config.globalize) ? definition.adapter.config.globalize : 
			config.globalize;

	// Pass down appropriate configuration items to adapter
	_.each(['defaultPK', 'updatedAt', 'createdAt'],function(key) {
		if (!_.isUndefined(definition[key])) {
			definition.adapter.config[key] = definition[key];
		}
	});
	
	// Set behavior in adapter depending on migrate option
	if (definition.migrate === 'drop') {
		definition.sync = _.bind(definition.adapter.sync.drop, definition.adapter, definition);
	}
	else if (definition.migrate === 'alter') {
		definition.sync = _.bind(definition.adapter.sync.alter, definition.adapter, definition);
	}
	else if (definition.migrate === 'safe') {
		definition.sync = _.bind(definition.adapter.sync.safe, definition.adapter, definition);
	}
	
	// Absorb definition methods
	_.extend(this, definition);

	// if configured as such, make each collection globally accessible
	if (definition.globalize) {
		var globalName = _.str.capitalize(this.identity);
		global[globalName] = this;
	}

	// Define core methods
	this.create = function(values, cb) {
		if (_.isFunction(values)) {
			cb = values;
			values = null;
		}
		var usage = this.identity+'.create({someAttr: "someValue"},callbackFunction)';
		if(!_.isFunction(cb)) throw usageError('No callback specified!',usage);

		return this.adapter.create(this.identity,values,cb);
	};

	// Call find method in adapter
	this.find = function(options, cb) {
		if (_.isFunction(options)) {
			cb = options;
			options = null;
		}
		var usage = this.identity+'.find(criteria,callbackFunction)';
		if(!_.isFunction(cb)) throw usageError('No callback specified!',usage);

		return this.adapter.find(this.identity,options,cb);
	};
	this.findWhere = this.find;

	// Call update method in adapter
	this.update = function(options, newValues, cb) {
		if (_.isFunction(options)) {
			cb = options;
			options = null;
		}
		var usage = this.identity+'.update(criteria, newValues, callbackFunction)';
		if(!options) throw usageError('No criteria option specified! If you\'re trying to update everything, maybe try updateAll?',usage);
		if(!newValues) throw usageError('No updated values specified!',usage);
		if(!_.isFunction(cb)) throw usageError('No callback specified!',usage);

		return this.adapter.update(this.identity,options,newValues,cb);
	};
	this.updateWhere = this.update;

	// Call destroy method in adapter
	this.destroy = function(options, cb) {
		if (_.isFunction(options)) {
			cb = options;
			options = null;
		}
		var usage = this.identity+'.destroy(options, callbackFunction)';
		if(!options) throw usageError('No options specified! If you\'re trying to destroy everything, maybe try destroyAll?',usage);
		if(!_.isFunction(cb)) throw usageError('No callback specified!',usage);

		return this.adapter.destroy(this.identity,options,cb);
	};
	this.destroyWhere = this.destroy;


	//////////////////////////////////////////
	// Composite
	//////////////////////////////////////////
	this.findOrCreate = function (criteria, values, cb) { 
		return this.adapter.findOrCreate(this.identity,criteria,values,cb);
	};
	this.findAndUpdate = function (criteria, values, cb) { 
		return this.adapter.findAndUpdate(this.identity, criteria, values, cb); 
	};
	this.findAndDestroy = function (criteria, cb) { 
		return this.adapter.findAndDestroy(this.identity, criteria, cb); 
	};

	//////////////////////////////////////////
	// Aggregate methods
	//////////////////////////////////////////

	this.createAll = function (valuesList, cb) {
		var my = this;
		var usage = this.identity+'.createAll(valuesList, callbackFunction)';
		if(!valueList) throw usageError('No valuesList specified!',usage);
		if(!_.isArray(valueList)) throw usageError('Invalid valuesList specified (should be an array!)',usage);
		if(!_.isFunction(cb)) throw usageError('No callback specified!',usage);
		
		// If an optimized createAll exists, use it, otherwise use an asynchronous loop with create()
		this.adapter.createAll(this.identity,valuesList,cb);
	};

	this.findAll = this.find;

	this.updateAll = function (newValues,cb) {
		var usage = this.identity+'.updateAll(newValues, callbackFunction)';
		if(!newValues) throw usageError('No updated values specified!',usage);
		if(!_.isFunction(cb)) throw usageError('No callback specified!',usage);
		return this.adapter.updateAll(this.identity,newValues,cb);
	};

	this.destroyAll = function (cb) {
		var usage = this.identity+'.destroyAll(newValues, callbackFunction)';
		if(!_.isFunction(cb)) throw usageError('No callback specified!',usage);
		return this.adapter.destroyAll(this.identity,cb);
	};

	//////////////////////////////////////////
	// Special methods
	//////////////////////////////////////////

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


function usageError(err,usage) {
	return new Error(err+'\nProper usage :: '+usage);
}