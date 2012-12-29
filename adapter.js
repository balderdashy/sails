var _ = require('underscore');
var parley = require('parley');
var uuid = require('node-uuid');

// Read global config
var config = require('./config.js');

// Extend adapter definition
module.exports = function(adapter) {
	var self = this;

	// Absorb configuration
	this.config = adapter.config = _.extend({

		// Default transaction collection name
		transactionCollection: _.clone(config.transactionCollection)

	}, adapter.config || {});

	// Absorb identity
	this.identity = adapter.identity;

	// Initialize is fired once-per-adapter
	this.initialize = function(cb) {
		adapter.initialize ? adapter.initialize(cb) : cb();
	};

	// Teardown is fired once-per-adapter
	// (i.e. tear down any remaining connections to the underlying data model)
	this.teardown = function(cb) {
		adapter.teardown ? adapter.teardown(cb) : (cb && cb());
	}; 

	// teardownCollection is fired once-per-collection
	// (i.e. flush data to disk before the adapter shuts down)
	this.teardownCollection = function(collectionName,cb) {
		adapter.teardownCollection ? adapter.teardownCollection(collectionName, cb) : (cb && cb());
	};



	//////////////////////////////////////////////////////////////////////
	// DDL
	//////////////////////////////////////////////////////////////////////
	this.define = function(collectionName, definition, cb) {

		// Grab attributes from definition
		var attributes = definition.attributes || {};

		// If id is not defined, add it
		// TODO: Make this check for ANY primary key
		// TODO: Make this disableable in the config
		if(this.config.defaultPK && !attributes.id) {
			attributes.id = {
				type: 'INTEGER',
				autoIncrement: true,
				'default': 'AUTO_INCREMENT',
				constraints: {
					unique: true,
					primaryKey: true
				}
			};
		}

		// If the adapter config allows it, and they aren't already specified,
		// extend definition with updatedAt and createdAt
		var now = {type: 'DATE', 'default': 'NOW'};
		if(this.config.createdAt && !attributes.createdAt) attributes.createdAt = now;
		if(this.config.updatedAt && !attributes.updatedAt) attributes.updatedAt = now;

		// Convert string-defined attributes into fully defined objects
		for(var attr in attributes) {
			if(_.isString(attributes[attr])) {
				attributes[attr] = {
					type: attributes[attr]
				};
			}
		}

		// Verify that collection doesn't already exist
		// and then define it and trigger callback
		this.describe(collectionName, function(err, existingAttributes) {
			if(err) return cb(err, attributes);
			else if(existingAttributes) return cb("Trying to define a collection (" + collectionName + ") which already exists.");
			else return(adapter.define ? adapter.define(collectionName, attributes, cb) : cb());
		});
	};

	this.describe = function(collectionName, cb) {
		adapter.describe ? adapter.describe(collectionName, cb) : cb();
	};
	this.drop = function(collectionName, cb) {
		// TODO: foreach through and delete all of the models for this collection
		adapter.drop ? adapter.drop(collectionName, cb) : cb();
	};
	this.alter = function(collectionName, newAttrs, cb) {
		adapter.alter ? adapter.alter(collectionName, newAttrs, cb) : cb();
	};


	//////////////////////////////////////////////////////////////////////
	// DQL
	//////////////////////////////////////////////////////////////////////
	this.create = function(collectionName, values, cb) {
		var self = this;
		if(!collectionName) return cb("No collectionName specified!");
		if(!adapter.create) return cb("No create() method defined in adapter!");

		// TODO: Populate default values

		// TODO: Validate constraints using Anchor
		
		// Automatically add updatedAt and createdAt (if enabled)
		if (self.config.createdAt) values.createdAt = new Date();
		if (self.config.updatedAt) values.updatedAt = new Date();

		adapter.create ? adapter.create(collectionName, values, cb) : cb();

		// TODO: Return model instance Promise object for joins, etc.
	};
	this.find = function(collectionName, options, cb) {
		if(!adapter.find) return cb("No find() method defined in adapter!");
		options = normalizeCriteria(options);
		adapter.find ? adapter.find(collectionName, options, cb) : cb();

		// TODO: Return model instance Promise object for joins, etc.
	};
	this.update = function(collectionName, criteria, values, cb) {
		if(!adapter.update) return cb("No update() method defined in adapter!");
		criteria = normalizeCriteria(criteria);

		// TODO: Validate constraints using Anchor

		// TODO: Automatically change updatedAt (if enabled)

		adapter.update ? adapter.update(collectionName, criteria, values, cb) : cb();

		// TODO: Return model instance Promise object for joins, etc.
	};
	this.destroy = function(collectionName, criteria, cb) {
		if(!adapter.destroy) return cb("No destroy() method defined in adapter!");
		criteria = normalizeCriteria(criteria);
		adapter.destroy ? adapter.destroy(collectionName, criteria, cb) : cb();

		// TODO: Return model instance Promise object for joins, etc.
	};

	//////////////////////////////////////////////////////////////////////
	// Convenience methods (overwritable in adapters)
	//////////////////////////////////////////////////////////////////////
	this.findOrCreate = function(collectionName, criteria, values, cb) {
		var self = this;
		criteria = normalizeCriteria(criteria);
		if(adapter.findOrCreate) adapter.findOrCreate(collectionName, criteria, values, cb);
		else {
			// TODO: ADD A TRANSACTION LOCK HERE!!
			self.find(collectionName, criteria, function(err, results) {
				if(err) cb(err);
				else if(results && results.length > 0) cb(null, results);
				else self.create(collectionName, values, cb);
			});
		}

		// TODO: Return model instance Promise object for joins, etc.
	};
	this.findAndUpdate = function(collectionName, criteria, values, cb) {
		criteria = normalizeCriteria(criteria);
		if(adapter.findAndUpdate) adapter.findAndUpdate(collectionName, criteria, values, cb);
		else this.update(collectionName, criteria, values, cb);

		// TODO: Return model instance Promise object for joins, etc.
	};
	this.findAndDestroy = function(collectionName, criteria, cb) {
		criteria = normalizeCriteria(criteria);
		if(adapter.findAndDestroy) adapter.findAndDestroy(collectionName, criteria, cb);
		else this.destroy(collectionName, criteria, cb);

		// TODO: Return model instance Promise object for joins, etc.
	};


	// App-level transaction
	this.transaction = function(transactionName, cb) {
		var self = this;

		// Generate unique lock
		var newLock = {
			uuid: uuid.v4(),
			name: transactionName,
			timestamp: epoch(),
			cb: cb
		};
		// console.log("Generating lock "+newLock.uuid+" ("+transactionName+")");
		// write new lock to commit log
		this.transactionCollection.create(newLock, function(err) {
			if(err) return cb(err, function() {
				throw err;
			});

			// Check if lock was written, and is the oldest with the proper name
			self.transactionCollection.findAll(function(err, locks) {
				if(err) return cb(err, function() {
					throw err;
				});

				var conflict = false;
				_.each(locks, function(entry) {

					// If a conflict IS found, respect the oldest
					// (the conflict-causer is responsible for cleaning up his entry-- ignore it!)
					if(entry.name === newLock.name && entry.uuid !== newLock.uuid && true && //entry.timestamp <= newLock.timestamp && 
					entry.id < newLock.id) conflict = entry;
				});

				// If there are no conflicts, the lock is acquired!
				if(!conflict) {
					self.lock(newLock, cb);
				} else {
					// console.log("************ Conflict encountered:: lock already exists for that transaction!!");
					// console.log("MY LOCK:: transaction: "+newLock.name," uuid: "+newLock.uuid, "timestamp: ",newLock.timestamp);
					// console.log("CONFLICTING LOCK:: transaction: "+conflict.name," uuid: "+conflict.uuid, "timestamp: ",conflict.timestamp);
					// console.log("***************");
				}

				// Otherwise, get in line
				// In other words, do nothing-- 
				// unlock() will grant lock request in order it was received
			});
		});
	};

	this.lock = function(newLock, cb) {
		var self = this;
		// console.log("====> Lock acquired "+newLock.uuid+" ("+newLock.name+")");
		var warningTimer = setTimeout(function() {
			console.error("Transaction :: " + newLock.name + " is taking an abnormally long time (> " + self.config.transactionWarningTimer + "ms)");
		}, self.config.transactionWarningTimer);

		cb(null, function unlock(cb) {
			clearTimeout(warningTimer);
			self.unlock(newLock.uuid, newLock.name, cb);
		});
	};


	this.unlock = function(uuid, transactionName, cb) {
		var self = this;
		// console.log("Releasing lock "+uuid+" ("+transactionName+")");
		// Remove current lock
		self.transactionCollection.destroy({
			uuid: uuid
		}, function(err) {
			if(err) return cb && cb(err);
			// console.log("<≠≠≠≠≠ Lock released :: "+uuid+" ("+transactionName+")");
			self.transactionCollection.findAll(function(err, locks) {
				if(err) return cb && cb(err);

				// Determine the next user in line (oldest lock w/ the proper transactionName)
				var nextInLine = getNextLock(locks, transactionName);
				// nextInLine ? console.log("Preparing to hand off lock to "+nextInLine.uuid+" ("+nextInLine.name+")") : console.log("No locks remaining !!!");
				// Trigger unlock's callback if specified
				cb && cb();

				// Now allow the nextInLine lock to be acquired
				// This marks the end of the previous transaction
				nextInLine && self.lock(nextInLine, nextInLine.cb);

			});
		});
	};


	// Find the oldest lock with the same transaction name
	// ************************************************************
	//	this function wouldn't be necessary if we could....
	//	TODO:  call find() with the [currently unfinished] ORDER option
	// ************************************************************

	function getNextLock(locks, transactionName) {
		var nextLock;
		_.each(locks, function(lock) {
			// Ignore locks with different names
			if(lock.name !== transactionName) return;

			// If this is the first one, or this lock is older than the one we have, use it
			if(!nextLock || lock.timestamp < nextLock.timestamp) nextLock = lock;
		});
		return nextLock;
	}

	// If @collectionName and @otherCollectionName are both using this adapter, do a more efficient remote join.
	// (By default, an inner join, but right and left outer joins are also supported.)
	this.join = function(collectionName, otherCollectionName, key, foreignKey, left, right, cb) {
		adapter.join ? adapter.join(collectionName, otherCollectionName, key, foreignKey, left, right, cb) : cb();
	};

	// Sync given collection's schema with the underlying data model
	// Controls whether database is dropped and recreated when app starts,
	// or whether waterline will try and synchronize the schema with the app models.
	this.sync = {

		// Drop and recreate collection
		drop: function(collection, cb) {
			var self = this;
			console.log("DROP");
			this.drop(collection.identity, function(err, data) {
				if(err) cb(err);
				else self.define(collection.identity, collection, cb);
			});
		},

		// Alter schema
		alter: function(collection, cb) {
			var self = this;
			console.log("ALTER");

			// Check that collection exists-- if it doesn't go ahead and add it and get out
			this.describe(collection.identity, function(err, data) {
				if(err) return cb(err);
				else if(!data) return self.define(collection.identity, collection, cb);

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
				// cb();	
			});
		}
	};

	// Always grant access to a few of Adapter's methods to the user adapter instance
	// (things that may or may not be defined by the user adapter)
	adapter.transaction = function(name, cb) {
		return self.transaction(name, cb);
	};

	// adapter.teardown = adapter.teardown || self.teardown;
	// adapter.teardownCollection = adapter.teardownCollection || self.teardownCollection;


	// Bind adapter methods to self
	_.bindAll(adapter);
	_.bindAll(this);
	_.bind(this.sync.drop, this);
	_.bind(this.sync.alter, this);

	// Mark as valid adapter
	this._isWaterlineAdapter = true;
};


/**
 * Run a method on an object -OR- each item in an array and return the result
 * Also handle errors gracefully
 */

function plural(collection, application) {
	if(_.isArray(collection)) {
		return _.map(collection, application);
	} else if(_.isObject(collection)) {
		return application(collection);
	} else {
		throw "Invalid collection passed to plural aggreagator:" + collection;
	}
}

// Normalize the different ways of specifying criteria into a uniform object

function normalizeCriteria(criteria) {
	if(!criteria) return {
		where: null
	};

	// Empty undefined values from criteria object
	_.each(criteria, function(val, key) {
		if(val === undefined) delete criteria[key];
	});

	if((_.isFinite(criteria) || _.isString(criteria)) && +criteria > 0) {
		criteria = {
			id: +criteria
		};
	}
	if(!_.isObject(criteria)) {
		throw 'Invalid criteria, ' + criteria + ' in find()';
	}
	if(!criteria.where && !criteria.limit && !criteria.skip && !criteria.offset && !criteria.order) {
		criteria = {
			where: criteria
		};
	}

	// If any item in criteria is a parsable finite number, use that
	for(var attrName in criteria.where) {
		if(Math.pow(+criteria.where[attrName], 2) > 0) {
			criteria.where[attrName] = +criteria.where[attrName];
		}
	}

	return criteria;
}

// Number of miliseconds since the Unix epoch Jan 1st, 1970

function epoch() {
	return(new Date()).getTime();
}