var async = require('async');
var _ = require('underscore');

// Read global waterline config
var waterlineConfig = require('./config.js');

var normalize = require('./normalize.js');

// Extend adapter definition
// (also pass in access to complete adapter set in case it's necessary)
module.exports = function(adapterDef, cb) {
	var self = this;

	// Pass through defaults from adapterDef
	// (absorbs any properties/methods from definition that are undefined here)
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



	// Mix in schema / DDL methods
	var ddl	= require('./ddl')(adapterDef);
	_.extend(this,ddl);	


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
		// WARNING: Not transactional!  (unless your data adapter is)
		else {
			self.find(collectionName, criteria, function(err, result) {
				if(err) cb(err);
				else if(result) cb(null, result);
				else self.create(collectionName, values, cb);
			});
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
		// WARNING: Not transactional!  (unless your data adapter is)
		else {
			async.forEachSeries(valuesList, function (values,cb) {
				self.create(collectionName, values, cb);
			}, cb);
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



	// stream.write() is used to send data
	// Must call stream.end() to complete stream
	this.stream = function (collectionName, criteria, stream) {
		if(!adapterDef.stream) return stream.end('No stream() method defined in adapter!');
		adapterDef.stream(collectionName, criteria, stream);
	};


	// Mix in transactions
	var transactions = require('./transaction')(adapterDef);
	this.transaction = transactions.transaction;
	this.getAutoIncrementAttribute = transactions.getAutoIncrementAttribute;


	// If @collectionName and @otherCollectionName are both using this adapter, do a more efficient remote join.
	// (By default, an inner join, but right and left outer joins are also supported.)
	this.join = function(collectionName, otherCollectionName, key, foreignKey, left, right, cb) {
		// TODO
		adapterDef.join ? adapterDef.join(collectionName, otherCollectionName, key, foreignKey, left, right, cb) : cb('Join not supported!');
	};

	// Sync given collection's schema with the underlying data model
	// Controls whether database is dropped and recreated when app starts,
	// or whether waterline will try and synchronize the schema with the app models.
	this.sync = require('./sync.js');

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
