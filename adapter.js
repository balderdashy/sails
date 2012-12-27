var _ = require('underscore');
var parley = require('parley');
var uuid = require('node-uuid');

// Read global config
var config = require('./config.js');

// Extend adapter definition
var Adapter = module.exports = function (adapter) {
	var self = this;

	// Absorb configuration
	this.config = adapter.config = _.extend({

		// Default transaction collection name
		transactionCollection: _.clone(config.transactionCollection)

	},adapter.config || {});


	this.initialize = function(cb) {
		var self = this;

		// When process ends, close all open connections
		process.on('SIGINT', process.exit);
		process.on('SIGTERM', process.exit);
		process.on('exit', function () { self.teardown(); });

		// Set scheme based on `persistent` options
		this.config.scheme = this.config.persistent ? 'alter' : 'drop';

		adapter.initialize ? adapter.initialize(cb) : cb();
	};

	this.teardown = function (cb) {
		adapter.teardown ? adapter.teardown(cb) : (cb && cb());
	};



	//////////////////////////////////////////////////////////////////////
	// DDL
	//////////////////////////////////////////////////////////////////////
	this.define = function(collectionName, definition, cb) { 

		if (!definition.attributes) definition.attributes = {};

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

		// If the adapter config allows it, and they aren't already specified,
		// extend definition with updatedAt and createdAt
		if(this.config.createdAt && !definition.createdAt) definition.createdAt = 'DATE';
		if(this.config.updatedAt && !definition.updatedAt) definition.updatedAt = 'DATE';

		// Convert string-defined attributes into fully defined objects
		for (var attr in definition.attributes) {
			if(_.isString(definition[attr])) {
				definition[attr] = {
					type: definition[attr]
				};
			}
		}

		// Grab schema from definition
		var schema = definition.attributes;

		// Verify that collection doesn't already exist
		// and then define it and trigger callback
		this.describe(collectionName,function (err,existingSchema) {
			if (err) return cb(err,schema);
			else if (existingSchema) return cb("Trying to define a collection ("+collectionName+") which already exists with schema:",existingSchema);
			else return ( adapter.define ? adapter.define(collectionName,schema,cb) : cb() );
		});
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


	//////////////////////////////////////////////////////////////////////
	// DQL
	//////////////////////////////////////////////////////////////////////

	this.create = function(collectionName, values, cb) {
		var self = this;
		if (!collectionName) return cb ("No collectionName specified!");
		if (!adapter.create) return cb("No create() method defined in adapter!");

		adapter.create ? adapter.create(collectionName,values,cb) : cb();

		// TODO: Return model instance Promise object for joins, etc.
	};
	this.find = function(collectionName, options, cb) {
		options = normalizeCriteria(options);
		adapter.find ? adapter.find(collectionName,options,cb) : cb();

		// TODO: Return model instance Promise object for joins, etc.
	};
	this.update = function(collectionName, criteria, values, cb) {
		criteria = normalizeCriteria(criteria);
		adapter.update ? adapter.update(collectionName,criteria,values,cb) : cb();

		// TODO: Return model instance Promise object for joins, etc.
	};
	this.destroy = function(collectionName, criteria, cb) {
		criteria = normalizeCriteria(criteria);
		adapter.destroy ? adapter.destroy(collectionName,criteria,cb) : cb();

		// TODO: Return model instance Promise object for joins, etc.
	};

	//////////////////////////////////////////////////////////////////////
	// Convenience methods (overwritable in adapters)
	//////////////////////////////////////////////////////////////////////
	this.findOrCreate = function (collectionName, criteria, values, cb) {
		var self = this; 
		criteria = normalizeCriteria(criteria);
		if (adapter.findOrCreate) adapter.findOrCreate(collectionName, criteria, values, cb);
		else {
			// TODO: ADD A TRANSACTION LOCK HERE!!
			self.find(collectionName,criteria,function (err,results) {
				if (err) cb(err);
				else if (results.length > 0) cb(null,results);
				else self.create(collectionName, values, cb);
			});
		}

		// TODO: Return model instance Promise object for joins, etc.
	};
	this.findAndUpdate = function (collectionName, criteria, values, cb) { 
		criteria = normalizeCriteria(criteria);
		if (adapter.findAndUpdate) adapter.findAndUpdate(collectionName, criteria, values, cb);
		else this.update(collectionName, criteria, values, cb);

		// TODO: Return model instance Promise object for joins, etc.
	};
	this.findAndDestroy = function (collectionName, criteria, cb) { 
		criteria = normalizeCriteria(criteria);
		if (adapter.findAndDestroy) adapter.findAndDestroy(collectionName, criteria, cb);
		else this.destroy(collectionName, criteria, cb);

		// TODO: Return model instance Promise object for joins, etc.
	};


	// App-level transaction
	this.transaction = function (transactionName, cb) {
		// console.log("Initiating transaction on " + this.identity + "...",transactionName, this.transactionCollection);
		// Generate unique lock and update commit log as if lock was acquired
		var newLock = {
			id: uuid.v4(),
			name: transactionName,
			timestamp: epoch(),
			cb: cb
		};

		var self = this;

		this.transactionCollection.create(newLock,function (err) {
			if (err) return cb(err);

			self.transactionCollection.findAll(function (err,locks) {
				if (err) return cb(err);

				var conflict = false;
				_.each(locks,function (entry) {

					// If a conflict IS found, respect the oldest
					// (the conflict-causer is responsible for cleaning up his entry)
					if (entry.id !== newLock.id && 
						entry.timestamp <= newLock.timestamp) conflict = true;

					// Otherwise, other lock is older-- ignore it
				});

				// Lock acquired!
				if (!conflict) {
					console.log("Acquired lock :: "+newLock.id);
					cb(err, self.unlock);
				}

				// Otherwise, get in line
				// In other words, do nothing-- 
				// unlock() will grant lock request in order it was received
			});
		});
	};


	this.unlock = function (id,transactionName,cb) {
		var self = this;

		self.transactionCollection.findAll(function (err,locks) {

			// Guess current lock by grabbing the oldest
			// (this will only work if unlock() is used inside of a transaction)
			var currentLock = getOldest(locks);
			if (!currentLock) return cb && cb('Trying to unlock, but no lock exists!');

			// Remove current lock
			self.transactionCollection.destroy({id: id},function (err) {

				// Also remove the lock from the in-memory list
				// (TODO: again suck less and do the right thing)
				locks = _.without(locks,currentLock);

				// Trigger unlock's callback if specified
				cb && cb(err);

				// Now allow the next user in line to acquire the lock (trigger the NEW oldest lock's callback)
				// This marks the end of the previous transaction
				var nextInLine = getOldest(locks);
				nextInLine && nextInLine.cb && nextInLine.cb();
			});
		});
	};


	// TODO: make this suck less
	// (use the [currently unfinished] ORDER option)
	function getOldest(locks) {
		var currentLock;
		_.each(locks,function (lock) {
			if (!currentLock) currentLock = lock;
			else if (lock.timestamp < currentLock.timestamp) currentLock = lock;
		});
		return currentLock;
	}

	// HAX
	// this.lock = this.unlock = function (collectionName, criteria, cb) {
	// 	if (_.isFunction(criteria)) {
	// 		cb = criteria;
	// 		criteria = null;
	// 	}
	// 	cb && cb();
	// };


	// // Begin an atomic transaction
	// // lock models in collection which fit criteria (if criteria is null, lock all)
	// this.lock = function (collectionName, criteria, cb) { 

	// 	// Allow criteria argument to be omitted
	// 	if (_.isFunction(criteria)) {
	// 		cb = criteria;
	// 		criteria = null;
	// 	}

	// 	// **************************************
	// 	// NAIVE SOLUTION
	// 	// (only the first roommate to notice gets the milk; the rest wait as soon as they see the note)

	// 	// No need to check the fridge!  Just start writing your note.

	// 	// TODO: Generate identifier for this transaction (use collection name to start with, 
	// 		// but better yet, boil down criteria to essentials to allow for more concurrent access)
		
	// 	// TODO: Create entry in transaction DB (write a note on the fridge and check it)
	// 	// TODO: Check the transaction db (CHECK THE DAMN FRIDGE IN CASE ONE OF YOUR ROOMMATES WROTE THE NOTE WHILE YOU WERE BUSY)

	// 	// TODO: If > 1 entry exists in the transaction db, subscribe to mutex queue to be notified later
	// 	// (if you see a note already on the fridge, get in line to be notified when roommate gets home)

	// 	// TODO: Otherwise, trigger callback!	QA immediately (you're good to go get the milk)

	// 	// **************************************
	// 	// AGRESSIVE SOLUTION
	// 	// (all roommates try to go get the milk, but the first person to get the milk prevents others from putting it in the fridge)

	// 	// TODO: Ask locksmith for model clone
	// 	// TODO: Pass model clone in callback

	// 	adapter.lock ? adapter.lock(collectionName,criteria,cb) : cb();
	// };

	// // Commit and end an atomic transaction
	// // unlock models in collection which fit criteria (if criteria is null, unlock all)
	// this.unlock = function (collectionName, criteria, cb) { 

	// 	// Allow criteria argument to be omitted
	// 	if (_.isFunction(criteria)) {
	// 		cb = criteria;
	// 		criteria = null;
	// 	}

	// 	// **************************************
	// 	// NAIVE SOLUTION
	// 	// (only the first roommate to notice gets the milk; the rest wait as soon as they see the note)

	// 	// TODO: Remove entry from transaction db (Remove your note from fridge)
	// 	// TODO: Callback can be triggered immediately, since you're sure the note will be removed

	// 	adapter.unlock ? adapter.unlock(collectionName,criteria,cb) : cb();
	// };

	// this.status = function (collectionName, cb) {
	// 	adapter.status ? adapter.status(collectionName,cb) : cb();
	// };

	// this.autoIncrement = function (collectionName, values,cb) {
	// 	adapter.autoIncrement ? adapter.autoIncrement(collectionName, values, cb) : cb();
	// };

	// If @collectionName and @otherCollectionName are both using this adapter, do a more efficient remote join.
	// (By default, an inner join, but right and left outer joins are also supported.)
	this.join = function(collectionName, otherCollectionName, key, foreignKey, left, right, cb) {
		adapter.join ? adapter.join(collectionName, otherCollectionName, key, foreignKey, left, right, cb) : cb();
	};

	// Sync given collection's schema with the underlying data model
	// Scheme can be 'drop' or 'alter'
	// Controls whether database is dropped and recreated when app starts,
	// or whether waterline will try and synchronize the schema with the app models.
	this.sync = {

		// Drop and recreate collection
		drop: function(collection,cb) {
			var self = this;
			this.drop(collection.identity,function (err,data) {
				if (err) cb(err);
				else self.define(collection.identity,collection,cb);
			});
		},
		
		// Alter schema
		alter: function(collection, cb) {
			var self = this;

			// Check that collection exists-- if it doesn't go ahead and add it and get out
			this.describe(collection.identity,function (err,data) {
				if (err) return cb(err);
				else if (!data) return self.define(collection.identity,collection,cb);
				
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
				// cb(null);	
			});
		}
	};

	// Always grant access to a few of Adapter's methods to the user adapter instance
	// (things that may or may not be defined by the user adapter)
	adapter.transaction = function (name,cb) {
		return self.transaction(name,cb);
	};

	// console.log("--------- ",adapter.transactionCollection);
	// this.transactionCollection = adapter.transactionCollection;
	// adapter.transactionCollection = this.transactionCollection)
	// this.transactionCollection = adapter.transactionCollection || this.transactionCollection;
	

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
	if (!criteria) return {where: null};

	// Empty undefined values from criteria object
	_.each(criteria,function(val,key) {
		if (val === undefined) delete criteria[key];
	});

	if((_.isFinite(criteria) || _.isString(criteria)) && +criteria > 0) {
		criteria = {
			id: +criteria
		};
	}
	if(!_.isObject(criteria)) {
		throw 'Invalid criteria, ' + criteria + ' in find()';
	}
	if (!criteria.where && !criteria.limit && 
		!criteria.skip && !criteria.offset && 
		!criteria.order) {
		criteria = { where: criteria };
	}

	// If any item in criteria is a parsable finite number, use that
	for (var attrName in criteria.where) {
		if (Math.pow(+criteria.where[attrName],2) > 0) {
			criteria.where[attrName] = +criteria.where[attrName];
		}
	}

	return criteria;
}

// Number of miliseconds since the Unix epoch Jan 1st, 1970
function epoch () {
	return (new Date()).getTime();
}