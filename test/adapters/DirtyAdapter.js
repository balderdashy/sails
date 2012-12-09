// Dependencies
var async = require('async');
var _ = require('underscore');
var dirty = require('dirty');
var parley = require('parley');

/*---------------------
	:: DirtyAdapter
	-> adapter

	*this refers to the adapter
---------------------*/

// This disk+memory adapter is for development only!
// Learn more: https://github.com/felixge/node-dirty
var adapter = module.exports = {

	config: {
		persistent: true,
		scheme: 'alter',
		dbName: 'sails.db',

		// String to precede key name for schema defininitions
		schemaPrefix: 'sails_schema_',

		// String to precede key name for actual data in collection
		dataPrefix: 'sails_data_',

		// String to precede key name for collection status data
		statusPrefix: 'sails_status_'
	},

	// Initialize the underlying data model
	initialize: function(cb) {
		if(this.config.persistent) this.db = new(dirty.Dirty)(this.config.dbName);
		else this.db = new(dirty.Dirty)();
		this.db.on('load', function() {
			// Trigger callback with no error
			cb();
		});
	},

	// Tear down any remaining connections to the underlying data model
	teardown: function(cb) {
		this.db = null;
		cb && cb();
	},



	// Fetch the schema for a collection
	describe: function(collectionName, cb) {
		this.log("<- Describing "+collectionName,err,schema);
		var schema, err;
		try {
			schema = this.db.get(this.config.schemaPrefix+collectionName);
		}
		catch (e) {
			err = e;
		}
		return cb(err,schema);
	},

	// Create a new collection
	define: function(collectionName, schema, cb) {
		this.log("-> Defining "+collectionName, "as",schema);
		var self = this;

		// Write schema and status objects
		return self.db.set(this.config.schemaPrefix+collectionName,schema,function (err) {
			if (err) return cb(err);
			return self.db.set(self.config.statusPrefix+collectionName,{
				autoIncrement: 1
			},cb);
		});
	},

	// Drop an existing collection
	drop: function(collectionName, cb) {
		var self = this;
		self.log("<*> Dropping "+collectionName);
		return self.db.rm(self.config.dataPrefix+collectionName,function (err) {
			if (err) return cb("Could not drop collection!");
			return self.db.rm(self.config.schemaPrefix+collectionName,cb);
		});
	},

	// Extend the schema for an existing collection
	alter: function(collectionName, newAttrs, cb) {
		this.log("-> Altering "+collectionName);
		this.db.describe(collectionName,function (e0,existingSchema) {
			if (err) return cb(collectionName+" does not exist!");
			var schema = _.extend(existingSchema,newAttrs);
			return this.db.set(this.config.schemaPrefix+collectionName,schema,cb);
		});
	},



	// Create one or more new models in the collection
	create: function(collectionName, values, cb) {
		this.log(" CREATING :: ",collectionName,values);
		var dataKey = this.config.dataPrefix+collectionName;
		var data = this.db.get(dataKey);

		// Lookup this collection's status info
		// if 

		// Create new model
		// (if data collection doesn't exist yet, create it)
		data = data || [];
		data.push(values);

		console.log("new data:",dataKey,data);

		// Replace data collection and go back
		this.db.set(dataKey,data,function (err) {
			cb(err,values);
		});
	},

	// Find one or more models from the collection
	find: function(collectionName, criteria, cb) {
		cb();
	},

	// Update one or more models in the collection
	update: function(collectionName, criteria, values, cb) {
		cb();
	},

	// Delete one or more models from the collection
	destroy: function(collectionName, criteria, cb) {
		cb();
	},


	// Begin an atomic transaction
	// lock models in collection which fit criteria (if criteria is null, lock all)
	lock: function (collectionName, criteria, cb) { 
		cb();
	},

	// Commit and end an atomic transaction
	// unlock models in collection which fit criteria (if criteria is null, unlock all)
	unlock: function (collectionName, criteria, cb) { 
		cb();
	},


	// Get table status (i.e. autoIncrement counter)
	status: function (collectionName, cb) {
		var err, status;
		try { status = this.db.get(this.config.statusPrefix+collectionName); }
		catch (e) { err = e; }
		this.log("<oo Getting status "+collectionName,status);
		return cb(err,status);
	},

	// Look for auto-increment fields, increment counters accordingly, and return refined values
			// TODO: make sure this is atomic
	autoIncrement: function (collectionName, values, cb) {
		var self = this;
		var schema = this.db.get(this.config.schemaPrefix+collectionName);
		// Lookup status so we know the current auto-increment value
		this.status(collectionName,function(err,status) {
			// if this is an autoIncrement field, increment it in values set
			async.forEach(_.keys(_.extend({},schema,values)), function (attrName,cb) {
				if (_.isObject(schema[attrName]) && schema[attrName].autoIncrement) {
					values[attrName] = status.autoIncrement;

					// Then, increment the status db persistently
					status.autoIncrement++;
					self.db.set(self.config.statusPrefix+collectionName,status,cb);
				}
				else cb();
			}, function (err) {
				return cb(err,values);
			});
		});
	},


	// If @thisModel and @otherModel are both using this adapter, do a more efficient remote join.
	// (By default, an inner join, but right and left outer joins are also supported.)
	join: function(collectionName, otherCollectionName, key, foreignKey, left, right, cb) {
		cb();
	},

	// Identity is here to facilitate unit testing
	// (this is optional and normally automatically populated based on filename)
	identity: 'dirty'
};


//////////////                 //////////////////////////////////////////
////////////// Private Methods //////////////////////////////////////////
//////////////                 //////////////////////////////////////////