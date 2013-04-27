//////////////////////////////////////////////////////////////////////
// collection.js
//
// This file is the prototype for collections defined using Waterline
// It contains the entry point for all ORM methods (e.g. User.find())
//
// Methods in this file defer to the adapter for their true implementation:
// the implementation here just validates and normalizes the parameters.
//
//////////////////////////////////////////////////////////////////////

var _ = require('underscore');
var parley = require('parley');
var async = require('async');

var normalize = require('./normalize');
var Deferred = require('./deferredObject');
var ModelStream = require('./stream');

var util = require('../util');

module.exports = Collection;
function Collection (definition, adapter, cb) {
	var self = this;

	// Absorb options and methods from definition
	_.extend(this, definition);

	// Absorb methods from adapter, but prepend the collectionName as the first argument	
	var adapterMethods = {};
	_.each(_.functions(adapter), function (methodName) {
		adapterMethods[methodName] = _.bind(adapter[methodName], adapter, definition.identity);
	});
	_.defaults(this, adapterMethods);
	

	// Validate and marshal attribute defs
	if (definition.attributes) {
		definition.attributes = util.objMap(definition.attributes, function (attr, attrName) {
			var type;
			if (_.isString(attr)) attr = {
				type: attr
			};
			else if (!_.isArray(attr) && _.isObject(attr)) {
				// If object is empty, this is an open-ended object type
				if (_.isEqual({},attr)) {
					attr = {
						type: 'object'
					};
				}

				// If no special properties are specified,
				// assume this is an explicit object type
				// which may include recursive type restrictions
				else if (!attr.type && !attr.defaultsTo) {
					attr = {
						type: attr
					};
				}
			}
			else {
				"Invalid attribute '"+attrName+"' in model ("+definition.identity+").";
			}

			// Lowercase attr type (if it's a string)
			if (_.isString(attr.type)) {
				attr.type = attr.type.toLowerCase();
			}
			// TODO: do this recursively, if type is an explicit object

			return attr;
		});
	}

	//////////////////////////////////////////
	// DDL
	//////////////////////////////////////////
	this.describe = function (cb) {
		return adapter.describe(definition.identity, cb);
	};

	this.alter = function (attributes, cb) {
		return adapter.alter(definition.identity, attributes, cb);
	};

	this.drop = function (cb) {
		return adapter.drop(definition.identity, cb);
	};


	//////////////////////////////////////////
	// Dynamic finders
	//////////////////////////////////////////
	// Query the collection using the name of the attribute directly
	// find or findAll will take care of callback 
	// (with deferred object or the appropriate error)
	// So no need to worry about that
	this.generateDynamicFinder = function(attrName, method, dontCapitalize) {

		// Capitalize attribute name if necessary to be syntactically correct
		var preparedAttrName;
		if (dontCapitalize) preparedAttrName = attrName;
		else preparedAttrName = _.str.capitalize(attrName);

		// Figure out actual dynamic method name by injecting attribute name		
		var actualMethodName = method.replace(/\*/g, preparedAttrName);

		// Assign this finder to the collection
		this[actualMethodName] = function dynamicMethod(value, options, cb) {
			if(_.isFunction(options)) {
				cb = options;
				options = null;
			}
			options = options || {};


			var usage = _.str.capitalize(this.identity) + '.' + actualMethodName + '(someValue,[options],callback)';
			if(_.isUndefined(value)) return usageError('No value specified!', usage, cb);
			if(options.where) return usageError('Cannot specify `where` option in a dynamic ' + method + '*() query!', usage, cb);


			// Build criteria query and submit it
			options.where = {};
			options.where[attrName] = value;

			// Make modifications based on method as necessary
			if(method === 'findBy*' || method === 'findBy*In') {
				return self.find(options, cb);
			} else if(method === 'findBy*Like') {
				return self.find(_.extend(options, {
					where: {
						like: options.where
					}
				}), cb);
			}

			// Aggregate finders
			else if(method === 'findAllBy*' || method === 'findAllBy*In') {
				return self.findAll(options, cb);
			} else if(method === 'findAllBy*Like') {
				return self.findAll(_.extend(options, {
					where: {
						like: options.where
					}
				}), cb);
			}

			// Count finders
			else if(method === 'countBy*' || method === 'countBy*In') {
				return self.count(options, cb);
			} else if(method === 'countBy*Like') {
				return self.count(_.extend(options, {
					where: {
						like: options.where
					}
				}), cb);
			}

			// Searchers
			else if (method === '*StartsWith') {
				return self.startsWith(options, cb);
			}
			else if (method === '*Contains') {
				return self.contains(options, cb);
			}
			else if (method === '*EndsWith') {
				return self.endsWith(options, cb);
			}
		};
	};

	// Clone attributes and augment with id, createdAt, updatedAt, etc. if necessary
	var attributes = _.clone(this.attributes) || {};
	attributes = require('./augmentAttributes')(attributes, this);

	// Maintain an in-memory cache of the schema for quicker lookup
	this.schema = attributes;

	// For each defined attribute, create a dynamic finder function
	_.each(attributes, function(attrDef, attrName) {

		this.generateDynamicFinder(attrName, 'findBy*');
		this.generateDynamicFinder(attrName, 'findBy*In');
		this.generateDynamicFinder(attrName, 'findBy*Like');

		this.generateDynamicFinder(attrName, 'findAllBy*');
		this.generateDynamicFinder(attrName, 'findAllBy*In');
		this.generateDynamicFinder(attrName, 'findAllBy*Like');

		this.generateDynamicFinder(attrName, 'countBy*');
		this.generateDynamicFinder(attrName, 'countBy*In');
		this.generateDynamicFinder(attrName, 'countBy*Like');

		this.generateDynamicFinder(attrName, '*StartsWith', true);
		this.generateDynamicFinder(attrName, '*Contains', true);
		this.generateDynamicFinder(attrName, '*EndsWith', true);
	}, this);


	//////////////////////////////////////////
	// Join
	//////////////////////////////////////////
	// Join with another collection
	// (use optimized join in adapter if one was provided)
	this.join = function(collection, fk, pk, cb) {
		// If no callback specified, return deferred object
		if(!_.isFunction(cb)) {
			return new Deferred({
				method: 'join',
				collection: this,
				args: {
					collection: collection,
					fk: fk,
					pk: pk
				},
				argsKeys: ['collection', 'fk', 'pk']
			});
		} else return adapter.join(this.identity, collection, fk, pk, cb);
	};

	// =============================


	//////////////////////////////////////////
	// Core CRUD
	//////////////////////////////////////////
	this.create = function(values, cb) {
		if (!this.attributes) {
			return cb(new Error("Cannot call default create() behavior without defining attributes in model definition."));
		}
		if(_.isFunction(values)) {
			cb = values;
			values = null;
		}
		else if (_.isArray(values)) {
			return this.createEach(values,cb);
		}

		var usage = _.str.capitalize(this.identity) + '.create({someAttr: "someValue"},callback)';

		// Always cast values to empty object
		if (!values) values = {};

		// And clone the object to prevent inadvertently changing user data
		else values = _.clone(values);

		// Populate default values
		_.each(this.attributes, function (scheme, attrName) {
			// Ignore if value is set
			if(values[attrName]) return;

			// Set default value if available
			if (_.isObject(scheme) && typeof scheme.defaultsTo !== 'undefined') {
				values[attrName] = scheme.defaultsTo;
			}
		});

		// TODO: Validate constraints using Anchor

		// Automatically add updatedAt and createdAt (if enabled)
		if (this.autoCreatedAt) values.createdAt = new Date();
		if (this.autoUpdatedAt) values.updatedAt = new Date();

		// If no callback specified, return deferred object
		if(!_.isFunction(cb)) {
			return new Deferred({
				method: 'create',
				collection: this,
				args: {
					values: values
				},
				argsKeys: ['values']
			});
		} 

		// Build model(s) from result set
		else return adapter.create(this.identity, values, buildModel(this, cb));
	};

	// Call find method in adapter
	this.find = function(criteria, cb) {
		var usage = _.str.capitalize(this.identity) + '.find([criteria],callback)';

		if(_.isFunction(criteria)) {
			cb = criteria;
			criteria = null;
		}

		// If no callback specified, return deferred object
		if(!_.isFunction(cb)) {
			return new Deferred({
				method: 'find',
				collection: this,
				args: {
					criteria: criteria
				},
				argsKeys: ['criteria']
			});
		} 

		// Build model(s) from result set 
		else return adapter.find(this.identity, criteria, buildModel(this, cb));
	};

	this.findAll = function(criteria, options, cb) {
		var usage = _.str.capitalize(this.identity) + '.findAll([criteria],[options],callback)';
		if(_.isFunction(criteria)) {
			cb = criteria;
			criteria = null;
			options = null;
		} else if(_.isFunction(options)) {
			cb = options;
			options = null;
		}

		// Normalize criteria and fold in options
		criteria = normalize.criteria(criteria);
		if(_.isObject(options) && _.isObject(criteria)) {
			criteria = _.extend({}, criteria, options);
		}

		if(_.isFunction(criteria) || _.isFunction(options)) {
			return usageError('Invalid options specified!', usage, cb);
		}

		// If no callback specified, return deferred object
		if(!_.isFunction(cb)) {
			return new Deferred({
				method: 'findAll',
				collection: this,
				args: {
					criteria: criteria
				},
				argsKeys: ['criteria']
			});
		} 
		// Build model(s) from result set
		else return adapter.findAll(this.identity, criteria, buildModel(this, cb));
	};
	this.where = this.findAll;
	this.select = this.findAll;


	//////////////////////////////////////////
	// Helper methods (these call other collection-level methods)
	//////////////////////////////////////////

	// If criteria is an object, return models where ALL of the specified attributes match queryString
	// If criteria is a string, match against ANY of the collection's attributes

	this.findLike = function(criteria, options, cb) {
		var usage = _.str.capitalize(this.identity) + '.findLike([criteria],[options],callback)';

		if(criteria = normalize.likeCriteria(criteria, attributes)) {
			return this.find(criteria, options, cb);
		} else return usageError('Criteria must be string or object!', usage, cb);
	};

	this.findAllLike = function(criteria, options, cb) {
		var usage = _.str.capitalize(this.identity) + '.findAllLike([criteria],[options],callback)';

		if(criteria = normalize.likeCriteria(criteria, attributes)) {
			return this.findAll(criteria, options, cb);
		} else return usageError('Criteria must be string or object!', usage, cb);
	};

	
	this.startsWith = function (criteria, options, cb) {
		var usage = _.str.capitalize(this.identity) + '.startsWith([criteria],[options],callback)';

		if (criteria = normalize.likeCriteria(criteria, attributes, function applyStartsWith(criteria) {
			return criteria + '%';
		})) {
			return this.findAll(criteria, options, cb);
		} else return usageError('Criteria must be a string or object!', usage, cb);
		throw new notImplementedError();
	};

	// Return models where >= 1 of the specified attributes contain queryString
	this.contains = function (criteria, options, cb) {
		var usage = _.str.capitalize(this.identity) + '.startsWith([criteria],[options],callback)';

		if (criteria = normalize.likeCriteria(criteria, attributes, function applyContains(criteria) {
			return '%' + criteria + '%';
		})) {
			return this.findAll(criteria, options, cb);
		} else return usageError('Criteria must be a string or object!', usage, cb);
		throw new notImplementedError();
	};

	// Return models where >= 1 of the specified attributes end with queryString
	this.endsWith = function (criteria, options, cb) {
		var usage = _.str.capitalize(this.identity) + '.startsWith([criteria],[options],callback)';

		if (criteria = normalize.likeCriteria(criteria, attributes, function applyEndsWith(criteria) {
			return '%' + criteria;
		})) {
			return this.findAll(criteria, options, cb);
		} else return usageError('Criteria must be a string or object!', usage, cb);
		throw new notImplementedError();
	};

	//////////////////////////////////////////
	// Cardinality methods
	//////////////////////////////////////////
	this.count = function(criteria, options, cb) {
		var usage = _.str.capitalize(this.identity) + '.count([criteria],[options],callback)';
		if(_.isFunction(criteria)) {
			cb = criteria;
			criteria = null;
			options = null;
		} else if(_.isFunction(options)) {
			cb = options;
			options = null;
		}

		// Normalize criteria and fold in options
		criteria = normalize.criteria(criteria);
		if(_.isObject(options) && _.isObject(criteria)) {
			criteria = _.extend({}, criteria, options);
		}

		if(_.isFunction(criteria) || _.isFunction(options)) {
			return usageError('Invalid options specified!', usage, cb);
		}

		// If no callback specified, return deferred object
		if(!_.isFunction(cb)) {
			return new Deferred({
				method: 'count',
				collection: this,
				args: {
					criteria: criteria
				},
				argsKeys: ['criteria']
			});
		} 
		// Build model(s) from result set
		else return adapter.count(this.identity, criteria, cb);
	};
	this.countAll = this.count;


	// Call update method in adapter
	this.update = function(options, newValues, cb) {
		if(_.isFunction(options)) {
			cb = options;
			options = null;
		}
		var usage = _.str.capitalize(this.identity) + '.update(criteria, newValues, callback)';
		if(!newValues) return usageError('No updated values specified!', usage, cb);
		if(!_.isFunction(cb)) return usageError('Invalid callback specified!', usage, cb);

		// TODO: Validate constraints using Anchor

		// Automatically change updatedAt (if enabled)
		if (this.autoUpdatedAt) newValues.updatedAt = new Date();

		// If no callback specified, return deferred object
		if(!_.isFunction(cb)) {
			return new Deferred({
				method: 'update',
				collection: this,
				args: {
					options: options,
					newValues: newValues
				},
				argsKeys: ['options', 'newValues']
			});
		} 
		// Build model(s) from result set
		else return adapter.update(this.identity, options, newValues, buildModel(this, cb));
	};
	this.updateWhere = this.update;
	this.updateAll = this.update;

	// Call destroy method in adapter
	this.destroy = function(options, cb) {
		if(_.isFunction(options)) {
			cb = options;
			options = null;
		}
		var usage = _.str.capitalize(this.identity) + '.destroy([options], callback)';


		// Build enhanced callback fn for deferred/promise usage
		cb = buildModel(this, cb);

		// If no callback specified, return deferred object
		if(!_.isFunction(cb)) {
			return new Deferred({
				method: 'destroy',
				collection: this,
				args: {
					options: options
				},
				argsKeys: ['options']
			});
		} 

		// Build model(s) from result set
		else return adapter.destroy(this.identity, options, buildModel(this, cb));
	};
	this.destroyWhere = this.destroy;
	this.destroyAll = this.destroy;


	//////////////////////////////////////////
	// Composite
	//////////////////////////////////////////
	this.findOrCreate = function(criteria, values, cb) {
		if(_.isFunction(values)) {
			cb = values;
			values = null;
		}

		// This is actually an implicit call to findOrCreateEach
		if (_.isArray(criteria) && _.isArray(values)) {
			return this.findOrCreateEach(criteria, values, cb);
		}

		var usage = _.str.capitalize(this.identity) + '.findOrCreate([criteria], values, callback)';
		if(!criteria) return usageError('No criteria option specified!', usage, cb);
		if(!_.isFunction(cb)) return usageError('Invalid callback specified!', usage, cb);

		// Build model(s) from result set
		return adapter.findOrCreate(this, this.identity, criteria, values, buildModel(this, cb));
	};


	//////////////////////////////////////////
	// Aggregate methods
	//////////////////////////////////////////
	this.createEach = function(valuesList, cb) {

		var usage = _.str.capitalize(this.identity) + '.createEach(valuesList, callback)';
		if(!valuesList) return usageError('No valuesList specified!', usage, cb);
		if(!_.isArray(valuesList)) return usageError('Invalid valuesList specified (should be an array!)', usage, cb);
		if(!_.isFunction(cb)) return usageError('Invalid callback specified!', usage, cb);
		if (!_.all(valuesList, function (values) {
			return _.isObject(values) && !_.isArray(values);
		})) return usageError('Invalid valuesList specified (should be an array of valid values objects!)', usage, cb);

		var self = this;
		_.each(valuesList, function (values) {
			// TODO: Populate default values
			// (just use describe(), but first we need an in-memory cache for calls to describe())

			// TODO: Validate constraints using Anchor

			// Automatically add updatedAt and createdAt (if enabled)
			if (self.autoCreatedAt) values.createdAt = new Date();
			if (self.autoUpdatedAt) values.updatedAt = new Date();
		});

		// Build model(s) from result set
		adapter.createEach(this.identity, valuesList, buildModel(this, cb));
	};

	// Iterate through a list of objects, trying to find each one
	// For any that don't exist, create them
	this.findOrCreateEach = function(attributesToCheck, valuesList, cb) {
		if(_.isFunction(valuesList)) {
			cb = valuesList;
			valuesList = null;
		}
		var usage = _.str.capitalize(this.identity) + '.findOrCreateEach(attributesToCheck, valuesList, callback)';
		if(!_.isFunction(cb)) return usageError('Invalid callback specified!', usage, cb);
		if(!attributesToCheck) return usageError('No attributesToCheck specified!', usage, cb);
		if(!_.isArray(attributesToCheck)) return usageError('No attributesToCheck specified!', usage, cb);
		if(!valuesList) return usageError('No valuesList specified!', usage, cb);
		if(!_.isArray(valuesList)) return usageError('Invalid valuesList specified (should be an array!)', usage, cb);
		if (!_.all(valuesList, function (values) {
			return _.isObject(values) && !_.isArray(values);
		})) return usageError('Invalid valuesList specified (should be an array of valid values objects!)', usage, cb);

		// Build model(s) from result set
		adapter.findOrCreateEach(this, this.identity, attributesToCheck, valuesList, buildModel(this, cb));
	};

	//////////////////////////////////////////
	// Special methods
	//////////////////////////////////////////
	this.transaction = function(transactionName, atomicLogic, afterUnlock) {
		var usage = _.str.capitalize(this.identity) + '.transaction(transactionName, atomicLogicFunction, afterUnlockFunction)';
		if(!atomicLogic) {
			return usageError('Missing required parameter: atomicLogicFunction!', usage, cb);
		} else if(!_.isFunction(atomicLogic)) {
			return usageError('Invalid atomicLogicFunction!  Not a function: ' + atomicLogic, usage, cb);
		} else if(afterUnlock && !_.isFunction(afterUnlock)) {
			return usageError('Invalid afterUnlockFunction!  Not a function: ' + afterUnlock, usage, cb);
		} else return adapter.transaction(this.identity + '.' + transactionName, atomicLogic, afterUnlock);
	};


	// Stream back a result set
	this.stream = function (criteria, transformation) {
		var self = this;
		var usage = _.str.capitalize(this.identity) + '.stream([criteria],[options])';

		// Normalize criteria and fold in options
		criteria = normalize.criteria(criteria);

		// Configure stream to adapter, kick off fetch, and return stream object
		// so that user code can use it as it fires data events
		var stream = new ModelStream(transformation);

		// very important to wait until next tick before triggering adapter
		// otherwise write() and end() won't fire properly
		process.nextTick(function (){
			// Write once immediately to force prefix in case no models are returned
			stream.write();

			adapter.stream(self.identity, criteria, stream);
		});

		return stream;
	};

	//////////////////////////////////////////
	// Utility methods
	//////////////////////////////////////////
	// Return a trimmed set of the specified params
	// with only the attributes which actually exist in the server-side model
	this.filter = function(params) {
		// If attributes aren't defined, send back empty obj
		if(!this.attributes) return {};

		var trimmedParams = util.objFilter(params, function(value, name) {
			return _.contains(_.keys(this.attributes), name);
		}, this);
		return trimmedParams;
	};
	this.trimParams = this.filter;


	// Absorb options and methods from definition
	// ONE MORE TIME to override any methods
	_.extend(this, definition);

	// Bind method context to self
	_.bindAll(this);


	//////////////////////////////////////////////////////////////////////
	// Apply configuration
	//////////////////////////////////////////////////////////////////////

	// if configured as such, make each collection globally accessible
	if(this.globalize) {
		var globalName = this.globalId || this.identity;
		global[globalName] = this;
	}


	// Inform the adapter that a new collection has been instantiated
	adapter.registerCollection(self, function (err) {
		if (err) return cb(err);

		// If not syncable, don't sync, get on out
		if (!adapter.syncable) return cb(null,self);

		// Assign synchronization behavior depending on migrate option in collection
		if (self.migrate === 'drop' ||
			self.migrate === 'alter' ||
			self.migrate === 'safe') {

			// Sync with datastore
			var sync = adapter.sync[self.migrate];
			sync.apply(adapter,[self, function (err) {

				// Finally trigger callback, passing back instantiated collection
				return cb(err, self);
			}]);
		}
	});
}


// Apply an enhancement (startsWith, endsWith, contains) to a LIKE criteria
function enhanceLikeQuery(criteria, enhancer) {
	if (_.isObject(criteria)) {
		return util.objMap(_.clone(criteria), enhancer);
	}
	else if (_.isString(criteria)) {
		return enhancer(criteria);
	}
}


// Build a callback function which will validate result set and decorate a model with instance methods
function buildModel (collection, cb) {
	return function (err, resultSet) {

		var mappedSet = {};

		// Verify model came across in the proper format
		mappedSet = normalize.resultSet(resultSet);

		// Add instance methods
		mappedSet = util.pluralize(mappedSet, function (model) {
			model.save = _.bind(collection.__save, collection, collection.identity, model);
			model.destroy = _.bind(collection.__destroy, collection, collection.identity, model);
			model.values = _.omit(model,['save','destroy','values']) || {};
			return model;
		});

		return cb(err,mappedSet);
	};
}


function usageError(err, usage, cb) {
	var message = err + '\n==============================================\nProper usage :: \n' + usage + '\n==============================================\n';
	if (cb) return cb(message);
	else {
		console.error("\n\n");
		throw new Error(message);
	}
}


function notImplementedError() {
	return 'Not implemented yet: we welcome your commits! Visit https://github.com/balderdashy/waterline for more info. ^_^';
}