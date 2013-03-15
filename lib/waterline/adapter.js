var async = require('async');
var _ = require('underscore');
var parley = require('parley');
var uuid = require('node-uuid');


// (for sorting)
var MAX_INTEGER = 4294967295;

// Read global waterline config
var waterlineConfig = require('./config.js');

var normalize = require('./normalize.js');

// Extend adapter definition
// (also pass in access to complete adapter set in case it's necessary)
module.exports = function(adapterDef, cb) {
	var self = this;


	// Absorb any properties/methods from definition that are undefined here

	// this.identity = adapterDef.identity;
	// this.syncable = adapterDef.syncable;

	// Pass through defaults from adapterDef
	// this.defaults = adapterDef.defaults;

	_.defaults(this,adapterDef);


	// Logic to handle the (re)instantiation of collections
	this.registerCollection = function(collection, cb) {
		if (adapterDef.registerCollection) {
			// Assign appropriate "this" context in user-level adapter
			_.bindAll(adapterDef);
			
			adapterDef.registerCollection(collection,cb);
		}
		else cb && cb();
	};

	// Teardown is fired once-per-adapter
	// Should tear down any open connections, etc. for each collection
	// (i.e. tear down any remaining connections to the underlying data model)
	// (i.e. flush data to disk before the adapter shuts down)
	this.teardown = function(cb) {
		if (adapterDef.teardown) adapterDef.teardown.apply(this,arguments);
		else cb && cb();
	}; 



	//////////////////////////////////////////////////////////////////////
	// DDL
	//////////////////////////////////////////////////////////////////////
	this.define = function(collectionName, definition, cb) {

		// Grab attributes from definition
		var attributes = definition.attributes || {};

		// Marshal attributes to a standard format
		definition.attributes = require('./augmentAttributes')(attributes,definition);

		// Verify that collection doesn't already exist
		// and then define it and trigger callback
		this.describe(collectionName, function(err, existingAttributes) {
			if(err) return cb(err, attributes);
			else if(existingAttributes) return cb("Trying to define a collection (" + collectionName + ") which already exists.");
			
			adapterDef.define(collectionName, definition, cb);
		});
	};

	this.describe = function(collectionName, cb) {
		adapterDef.describe(collectionName, cb);
	};
	this.drop = function(collectionName, cb) {
		adapterDef.drop(collectionName, cb);
	};
	this.alter = function(collectionName, attributes, cb) {
		var self = this;

		// If the adapterDef defines alter, use that
		if (adapterDef.alter) {
			adapterDef.alter(collectionName, attributes, cb);
		}
		// If the adapterDef defines column manipulation, use it
		else if (adapterDef.addAttribute && adapterDef.removeAttribute) {
			// Update the data belonging to this attribute to reflect the new properties
			// Realistically, this will mainly be about constraints, and primarily uniquness
			// It'd be good if waterline could enforce all constraints at this time,
			// but there's a trade-off with destroying people's data
			// TODO: Figure this out

			// Alter the schema
			self.describe(collectionName, function afterDescribe (err, originalAttributes) {
				if (err) return done(err);

				// Keep track of previously undefined attributes
				// for use when updating the actual data
				var newAttributes = {};

				// Iterate through each attribute in the new definition
				// If the attribute doesn't exist, mark it as a new attribute
				_.each(attributes, function checkAttribute(attribute,attrName) {
					if (!originalAttributes[attrName]) {
						newAttributes[attrName] = attribute;
					}
				});

				// Keep track of attributes which no longer exist or which need to be changed
				var deprecatedAttributes = {};
				_.each(originalAttributes,function (attribute,attrName) {
					if (! attributes[attrName]) {
						deprecatedAttributes[attrName] = attribute;
					}
					// Remove and recreate the attribute
					if ( !_.isEqual(attributes[attrName],attribute) ) {
						deprecatedAttributes[attrName] = attribute;
						newAttributes[attrName] = attribute;
					}
				});

				// Add and remove attributes using the specified adapterDef
				async.forEachSeries(_.keys(newAttributes), function (attrName, cb) {
					adapterDef.addAttribute(collectionName, attrName, newAttributes[attrName], cb);
				}, function (err) {
					if (err) return cb(err);
					async.forEachSeries(_.keys(deprecatedAttributes), function (attrName, cb) {
						adapterDef.removeAttribute(collectionName, attrName, cb);
					}, cb);
				});
			});
		}
		// Otherwise don't do anything, it's too dangerous 
		// (dropping and reading the data could cause corruption if the user stops the server midway through)
		else cb();
	};


	//////////////////////////////////////////////////////////////////////
	// DQL
	//////////////////////////////////////////////////////////////////////

	this.__save = function (collectionName, values, cb) {
		// TODO: create or update model in adapter, using id to determine the model in question
		// BUT don't include the save() method!

		// TODO: use whatever the primary key is configured to, not just `id`
		var pk = 'id';
		var pkValue = values[pk];

		// TODO: use updateOrCreate()
		this.update(collectionName, pkValue, values, cb);
	};

	this.__destroy = function (collectionName, cb) {
		// TODO: destroy in adapter, using id to determine the model in question
		cb("destroy() NOT SUPPORTED YET!");
	};

	this.create = function(collectionName, values, cb) {

		if(!adapterDef.create) return cb("No create() method defined in adapter!");
		adapterDef.create(collectionName, values, cb);
	};

	// Find a set of models
	this.findAll = function(collectionName, criteria, cb) {

		if(!adapterDef.find) return cb("No find() method defined in adapter!");
		criteria = normalize.criteria(criteria);
		adapterDef.find(collectionName, criteria, cb);
	};

	// Find exactly one model
	this.find = function(collectionName, criteria, cb) {

		// If no criteria specified AT ALL, use first model
		if (!criteria) criteria = {limit: 1};

		this.findAll(collectionName, criteria, function (err, models) {
			if (!models) return cb(err);
			if (models.length < 1) return cb(err);
			else if (models.length > 1) return cb("More than one "+collectionName+" returned!");
			else return cb(null,models[0]);
		});
	};

	this.count = function(collectionName, criteria, cb) {

		var self = this;
		criteria = normalize.criteria(criteria);
		if (!adapterDef.count) {
			self.findAll(collectionName, criteria, function (err,models){
				cb(err,models.length);
			});
		}
		else adapterDef.count(collectionName, criteria, cb);
	};


	this.update = function(collectionName, criteria, values, cb) {

		if (!criteria) return cb('No criteria or id specified!');

		this.updateAll(collectionName, criteria, values, function (err, models) {
			if (!models) return cb(err);
			if (models.length < 1) return cb(err);
			else if (models.length > 1) return cb("More than one "+collectionName+" returned!");
			else return cb(null,models[0]);
		});
	};

	this.updateAll = function (collectionName, criteria, values, cb) {

		if(!adapterDef.update) return cb("No update() method defined in adapter!");
		criteria = normalize.criteria(criteria);
		return adapterDef.update(collectionName, criteria, values, cb);
	};

	this.destroy = function(collectionName, criteria, cb) {

		if(!adapterDef.destroy) return cb("No destroy() method defined in adapter!");
		criteria = normalize.criteria(criteria);
		adapterDef.destroy(collectionName, criteria, cb);
	};

	//////////////////////////////////////////////////////////////////////
	// Compound methods (overwritable in adapters)
	//////////////////////////////////////////////////////////////////////
	this.findOrCreate = function(collectionName, criteria, values, cb) {
		var self = this;

		// If no values were specified, use criteria
		if (!values) values = criteria.where ? criteria.where : criteria;
		criteria = normalize.criteria(criteria);

		if(adapterDef.findOrCreate) {
			adapterDef.findOrCreate(collectionName, criteria, values, cb);
		}
		
		// Default behavior
		// Warning: Inefficient!  App-level tranactions should not be used for built-in compound queries.
		else {
			// Create transaction name based on collection
			// var transactionName = collectionName+'.waterline.default.create';
			// self.transaction(transactionName, function (err,done) {
				self.find(collectionName, criteria, function(err, result) {
					if(err) cb(err);
					else if(result) cb(null, result);
					else self.create(collectionName, values, cb);
				});
			// }, cb);
		}

		// TODO: Return model instance Promise object for joins, etc.
	};


	//////////////////////////////////////////////////////////////////////
	// Aggregate
	//////////////////////////////////////////////////////////////////////

	// If an optimized createEach exists, use it, otherwise use an asynchronous loop with create()
	this.createEach = function (collectionName, valuesList, cb) {
		var self = this;

		// Custom user adapter behavior
		if (adapterDef.createEach) {
			adapterDef.createEach(collectionName, valuesList, cb);
		}
		
		// Default behavior
		else {
			// Create transaction name based on collection
			// self.transaction(collectionName+'.waterline.default.create', function (err,done) {
				async.forEachSeries(valuesList, function (values,cb) {
					self.create(collectionName, values, cb);
				}, cb);
			// },cb);
		}
	};
	// If an optimized findOrCreateEach exists, use it, otherwise use an asynchronous loop with create()
	this.findOrCreateEach = function (collectionName, attributesToCheck, valuesList, cb) {
		var self = this;

		// Clone sensitive data
		attributesToCheck = _.clone(attributesToCheck);
		valuesList = _.clone(valuesList);

		// Custom user adapter behavior
		if (adapterDef.findOrCreateEach) {

			adapterDef.findOrCreateEach(collectionName, attributesToCheck, valuesList, cb);
		}
		
		// Default behavior
		else {
			// Build a list of models
			var models = [];

			async.forEachSeries(valuesList, function (values,cb) {
				if (!_.isObject(values)) return cb('findOrCreateEach: Unexpected value in valuesList.');

				// Check that each of the criteria keys match:
				// build a criteria query
				var criteria = {};
				_.each(attributesToCheck, function (attrName) {
					criteria[attrName] = values[attrName];
				});

				return self.findOrCreate(collectionName, criteria, values, function (err, model) {
					// Add model to list
					if (model) models.push(model);
					return cb(err, model);
				});
			}, function (err) {
				// Pass back found/created models
				cb(err,models);
			});
		}
	};




	//////////////////////////////////////////
	// Streaming
	//////////////////////////////////////////

	// stream.write() is used to send data
	// Must call stream.end() to complete stream
	this.stream = function (collectionName, criteria, stream) {
		if(!adapterDef.stream) return stream.end('No stream() method defined in adapter!');
		adapterDef.stream(collectionName, criteria, stream);
	};



	//////////////////////////////////////////////////////////////////////
	// Concurrency
	//////////////////////////////////////////////////////////////////////
	
	/**
	*	App-level transaction
	*	@transactionName		a unique identifier for this transaction
	*	@atomicLogic		the logic to be run atomically
	*	@afterUnlock (optional)	the function to trigger after unlock() is called
	*/
	this.transaction = function(transactionName, atomicLogic, afterUnlock) {
		var self = this;

		// Use the adapter definition's transaction() if specified
		if (adapterDef.transaction) return adapterDef.transaction(transactionName, atomicLogic, afterUnlock);
		else if (!adapterDef.commitLog) return afterUnlock("Cannot process transaction. Commit log disabled in adapter, and no custom transaction logic is defined.");

		// Generate unique lock
		var newLock = {
			uuid: uuid.v4(),
			name: transactionName,
			atomicLogic: atomicLogic,
			afterUnlock: afterUnlock
		};

		// write new lock to commit log
		if (!this.transactionCollection) {
			console.error("Trying to start transaction ("+transactionName+") in collection:",this.identity);
			console.error("But the transactionCollection is: ",this.transactionCollection);
			return afterUnlock("Transaction collection not defined!");
		}
		this.transactionCollection.create(newLock, function afterCreatingTransaction(err, newLock) {
			if(err) return atomicLogic(err, function() {
				throw err;
			});

			// Check if lock was written, and is the oldest with the proper name
			self.transactionCollection.findAll(function afterLookingUpTransactions(err, locks) {
				if(err) return atomicLogic(err, function() {
					throw err;
				});

				var conflict = false;
				_.each(locks, function eachLock (entry) {

					// If a conflict IS found, respect the oldest
					if(entry.name === newLock.name && 
						entry.uuid !== newLock.uuid && 
						entry.id < newLock.id) conflict = entry;
				});

				// If there are no conflicts, the lock is acquired!
				if(!conflict) acquireLock(newLock);

				// Otherwise, get in line: a lock was acquired before mine, do nothing
				

			});
		});
	};

	/**
	* acquireLock() is run after the lock is acquired, but before passing control to the atomic app logic
	*
	* @newLock					the object representing the lock to acquire
		* @name						name of the lock
		* @atomicLogic				the transactional logic to be run atomically
		* @afterUnlock (optional)	the function to run after the lock is subsequently released
	*/
	var acquireLock = function(newLock) {

		var warningTimer = setTimeout(function() {
			console.error("Transaction :: " + newLock.name + " is taking an abnormally long time (> " + waterlineConfig.transactionWarningTimer + "ms)");
		}, waterlineConfig.transactionWarningTimer);

		newLock.atomicLogic(null, function unlock () {
			clearTimeout(warningTimer);
			releaseLock(newLock,arguments);
		});
	};


	// releaseLock() will grant pending lock requests in the order they were received
	//
	// @currentLock			the lock currently acquired
	// @afterUnlockArgs		the arguments to pass to the afterUnlock function 
	var releaseLock = function(currentLock, afterUnlockArgs) {

		var cb = currentLock.afterUnlock;

		// Get all locks
		self.transactionCollection.findAll(function afterLookingUpTransactions(err, locks) {
			if(err) return cb && cb(err);
			
			// Determine the next user in line
			// (oldest lock that isnt THIS ONE w/ the proper transactionName)
			var nextInLine = getNextLock(locks, currentLock);

			// Remove current lock
			self.transactionCollection.destroy({
				uuid: currentLock.uuid
			}, function afterLockReleased (err) {
				if(err) return cb && cb(err);

				// Trigger unlock's callback if specified
				// > NOTE: do this before triggering the next queued transaction
				// to prevent transactions from monopolizing the event loop
				cb && cb.apply(null, afterUnlockArgs);

				// Now allow the nextInLine lock to be acquired
				// This marks the end of the previous transaction
				nextInLine && acquireLock(nextInLine);
			});
		});
	};


	
	// Find this collection's auto-increment field and return its name
	this.getAutoIncrementAttribute = function (collectionName, cb) {
		this.describe(collectionName, function (err,attributes) {
			var attrName, done=false;
			_.each(attributes, function(attribute, aname) {
				if(!done && _.isObject(attribute) && attribute.autoIncrement) {
					attrName = aname;
					done = true;
				}
			});

			cb(null, attrName);
		});
	};

	// Share this method with the child adapter
	adapterDef.getAutoIncrementAttribute = this.getAutoIncrementAttribute;

	// If @collectionName and @otherCollectionName are both using this adapter, do a more efficient remote join.
	// (By default, an inner join, but right and left outer joins are also supported.)
	this.join = function(collectionName, otherCollectionName, key, foreignKey, left, right, cb) {
		adapterDef.join ? adapterDef.join(collectionName, otherCollectionName, key, foreignKey, left, right, cb) : cb();
	};

	// Sync given collection's schema with the underlying data model
	// Controls whether database is dropped and recreated when app starts,
	// or whether waterline will try and synchronize the schema with the app models.
	this.sync = {

		// Drop and recreate collection
		drop: function(collection, cb) {
			var self = this;
			this.drop(collection.identity, function afterDrop (err, data) {
				if(err) return cb(err);
				else self.define(collection.identity, collection, cb);
			});
		},

		// Alter schema
		alter: function(collection, cb) {
			var self = this;

			// Check that collection exists-- 
			this.describe(collection.identity, function afterDescribe (err, attrs) {
				attrs = _.clone(attrs);
				if(err) return cb(err);

				// if it doesn't go ahead and add it and get out
				else if(!attrs) return self.define(collection.identity, collection, cb);

				// Otherwise, if it *DOES* exist, we'll try and guess what changes need to be made
				else self.alter(collection.identity, collection.attributes, cb);
			});
		}, 

		// Do nothing to the underlying data model
		safe: function (collection,cb) {
			cb();
		}
	};

	// Bind adapter methods to self
	_.bindAll(adapterDef);
	_.bindAll(this);
	_.bind(this.sync.drop, this);
	_.bind(this.sync.alter, this);
	_.bind(this.sync.safe, this);

	// Mark as valid adapter
	this._isWaterlineAdapter = true;


	// Generate commit log collection if commitLog is not disabled
	if (adapterDef.commitLog) {

		// Build commit log definition using defaults and adapter def
		this.commitLog = _.extend({

			// Use sails-dirty by default as adapter
			adapter: 'sails-dirty',

			// Don't mess with it once it's been created
			migrate: 'alter',

			// Never grant global access to the collection
			globalize: false,

			// Always use the auto-incremented primary key, id
			autoPK: true,
			
			// Explicitly disable commit log to prevent recursion
			commitLog: false

		},adapterDef.commitLog);
	}

	return cb && cb(null, self);
};


// Find the oldest lock with the same transaction name
// ************************************************************
//	this function wouldn't be necessary if we could....
//	TODO:  call find() with the SORT option
// ************************************************************
function getNextLock(locks, currentLock) {
	var nextLock;
	_.each(locks, function(lock) {

		// Ignore locks with different transaction names
		if (lock.name !== currentLock.name) return;
		
		// Ignore current lock
		if (lock.uuid === currentLock.uuid) return;

		// Find the lock with the smallest id
		var minId = nextLock ? nextLock.id : MAX_INTEGER;
		if (lock.id < minId) nextLock = lock;
	});
	return nextLock;
}
