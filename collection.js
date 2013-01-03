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

	//////////////////////////////////////////
	// Dynamic finders
	//////////////////////////////////////////

	// Query the collection using the name of the attribute directly
	// @method	findBy or findAllBy
	this.generateDynamicFinder = function (attrName, method) {
		// Return a closure
		return function (value, options, cb) {
			if (_.isFunction(options)) {
				cb = options;
				options = null;
			}
			options = options || {};

			var usage = _.str.capitalize(this.identity)+'.'+method+_.str.capitalize(attrName)+
						'(someValue,[options],callback)';
			// if(_.isUndefined(value)) usageError('No value specified!',usage);
			if(options.where) usageError('Cannot specify `where` option in a dynamic '+method+'*() query!',usage);
			if(!_.isFunction(cb)) usageError('Invalid callback specified!',usage);

			// Build criteria query and submit it
			options.where = {};
			options.where[attrName] = value;

			// Use either find or findAll
			if (method === 'findBy') return self.find(options,cb);
			else if (method === 'findAllBy') return self.findAll(options,cb);
		};
	};

	var attributes = _.clone(this.attributes) || {};
	attributes = require('./augmentAttributes')(attributes,_.extend({},config,this.config));

	// For each defined attribute, create a dynamic finder function
	_.each(attributes,function (attrDef, attrName) {
		self['findBy'+_.str.capitalize(attrName)] = self.generateDynamicFinder(attrName,'findBy');
		self['findAllBy'+_.str.capitalize(attrName)] = self.generateDynamicFinder(attrName,'findAllBy');
		// TODO: findBy*OrCreate
		// TODO: findAllBy*OrCreate
	});

	// Then create compound dynamic finders using the various permutations
	// TODO


	//////////////////////////////////////////
	// Promises / Deferred Objects
	//////////////////////////////////////////

	// =============================
	// TODO: (for a later release)
	// =============================
	/*
		// when done() is called (or some comparably-named terminator)
		// run every operation in the queue and trigger the callback
		this.done = function (cb) {
			// A callback is always required here
			if(!_.isFunction(cb)) usageError('Invalid callback specified!',usage);
		};

		// Join with another collection
		// (use optimized join in adapter if one was provided)
		this.join = function (anotherOne, cb) {
	
		}
	*/
	// =============================

	//////////////////////////////////////////
	// Core CRUD
	//////////////////////////////////////////

	this.create = function(values, cb) {
		// =============================
		// TODO: (for a later release)
		// =============================
		/*
			
			if (this._isDeferredObject) {
				if (this.terminated) {
					throw new Error("The callback was already triggered!");
				}

				// If this was called from a deferred object, 
				// instead of doing the normal operation, pop it on a queue for later

				if (cb) {
					// If a callback is specified, terminate the deferred object
				}
			}
			else {
				// Do the normal stuff
			}

			if (!cb) {
				// No callback specified
				// Initialize and return a deferred object
			}
		*/
		// =============================

		if (_.isFunction(values)) {
			cb = values;
			values = null;
		}
		var usage = _.str.capitalize(this.identity)+'.create({someAttr: "someValue"},callback)';
		if(!_.isFunction(cb)) usageError('Invalid callback specified!',usage);

		return this.adapter.create(this.identity,values,cb);
	};

	// Call find method in adapter
	this.find = function(options, cb) {
		if (_.isFunction(options)) {
			cb = options;
			options = null;
		}
		var usage = _.str.capitalize(this.identity)+'.find(criteria,callback)';
		if(!_.isFunction(cb)) usageError('Invalid callback specified!',usage);

		return this.adapter.find(this.identity,options,cb);
	};

	this.findAll = function (options, cb) {
		if (_.isFunction(options)) {
			cb = options;
			options = null;
		}
		var usage = _.str.capitalize(this.identity)+'.findAll(criteria,callback)';
		if(!_.isFunction(cb)) usageError('Invalid callback specified!',usage);

		return this.adapter.findAll(this.identity, options, cb);
	};
	this.where = this.findAll;
	this.select = this.findAll;

	// Call update method in adapter
	this.update = function(options, newValues, cb) {
		if (_.isFunction(options)) {
			cb = options;
			options = null;
		}
		var usage = _.str.capitalize(this.identity)+'.update(criteria, newValues, callback)';
		if(!options) usageError('No criteria option specified! If you\'re trying to update everything, maybe try updateAll?',usage);
		if(!newValues) usageError('No updated values specified!',usage);
		if(!_.isFunction(cb)) usageError('Invalid callback specified!',usage);

		return this.adapter.update(this.identity,options,newValues,cb);
	};
	this.updateWhere = this.update;

	// Call destroy method in adapter
	this.destroy = function(options, cb) {
		if (_.isFunction(options)) {
			cb = options;
			options = null;
		}
		var usage = _.str.capitalize(this.identity)+'.destroy(options, callback)';
		if(!options) usageError('No options specified! If you\'re trying to destroy everything, maybe try destroyAll?',usage);
		if(!_.isFunction(cb)) usageError('Invalid callback specified!',usage);

		return this.adapter.destroy(this.identity,options,cb);
	};
	this.destroyWhere = this.destroy;


	//////////////////////////////////////////
	// Composite
	//////////////////////////////////////////
	this.findOrCreate = function (criteria, values, cb) { 
		if (_.isFunction(values)) {
			cb = values;
			values = criteria;
		}
		var usage = _.str.capitalize(this.identity)+'.findOrCreate(criteria, values, callback)';
		if(!criteria) usageError('No criteria option specified!',usage);
		if(!values) usageError('No values specified!',usage);
		if(!_.isFunction(cb)) usageError('Invalid callback specified!',usage);

		return this.adapter.findOrCreate(this.identity,criteria,values,cb);
	};

	// TODO: findOrCreateAll()
	this.findOrCreateAll = function () { throw new Error('findOrCreateAll() is not implemented yet!'); };

	//////////////////////////////////////////
	// Aggregate methods
	//////////////////////////////////////////

	this.createAll = function (valuesList, cb) {
		var my = this;
		var usage = _.str.capitalize(this.identity)+'.createAll(valuesList, callback)';
		if(!valuesList) usageError('No valuesList specified!',usage);
		if(!_.isArray(valuesList)) usageError('Invalid valuesList specified (should be an array!)',usage);
		if(!_.isFunction(cb)) usageError('Invalid callback specified!',usage);
		
		// If an optimized createAll exists, use it, otherwise use an asynchronous loop with create()
		this.adapter.createAll(this.identity,valuesList,cb);
	};

	this.updateAll = function (newValues,cb) {
		var usage = _.str.capitalize(this.identity)+'.updateAll(newValues, callback)';
		if(!newValues) usageError('No updated values specified!',usage);
		if(!_.isFunction(cb)) usageError('Invalid callback specified!',usage);
		return this.adapter.updateAll(this.identity,newValues,cb);
	};

	this.destroyAll = function (cb) {
		var usage = _.str.capitalize(this.identity)+'.destroyAll(newValues, callback)';
		if(!_.isFunction(cb)) usageError('Invalid callback specified!',usage);
		return this.adapter.destroyAll(this.identity,cb);
	};

	//////////////////////////////////////////
	// Special methods
	//////////////////////////////////////////

	this.transaction = function (transactionName, atomicLogic, afterUnlock) {
		var usage = _.str.capitalize(this.identity)+'.transaction(transactionName, atomicLogicFunction, afterUnlockFunction)';
		if (!atomicLogic) {
			return usageError('Missing required parameter: atomicLogicFunction!',usage);
		}
		else if (!_.isFunction(atomicLogic)) {
			return usageError('Invalid atomicLogicFunction!  Not a function: '+atomicLogic,usage);
		}
		else if (afterUnlock && !_.isFunction(afterUnlock)) {
			return usageError('Invalid afterUnlockFunction!  Not a function: '+afterUnlock,usage);
		}
		else return this.adapter.transaction(this.identity+'.'+transactionName, atomicLogic, afterUnlock);
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
	console.error("\n\n");
	throw new Error(err+'\n==============================================\nProper usage :: \n'+usage+'\n==============================================\n');
}