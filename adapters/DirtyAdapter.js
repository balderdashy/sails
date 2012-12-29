// Dependencies
var async = require('async');
var _ = require('underscore');
var dirty = require('dirty');
var parley = require('parley');
var uuid = require('node-uuid');

// ******************************************
// Poor man's auto-increment
// ******************************************
// In production, the transaction database should be set to something else 
// with true, database-side auto-increment capabilities
// This in-memory auto-increment will not scale to a multi-instance / cluster setup.
// ******************************************
var statusDb = {};

/*---------------------
	:: DirtyAdapter
	-> adapter

	*this refers to the adapter
---------------------*/

// This disk+memory adapter is for development only!
// Learn more: https://github.com/felixge/node-dirty
var adapter = module.exports = {

	config: {

		// If inMemory is true, all data will be destroyed when the server stops
		inMemory: false,

		// Attributes are case insensitive by default
		// attributesCaseSensitive: false,

		// File path for disk file output (in persistent mode)
		dbFilePath: './.waterline/dirty.db',

		// String to precede key name for schema defininitions
		schemaPrefix: 'waterline_schema_',

		// String to precede key name for actual data in collection
		dataPrefix: 'waterline_data_'
	},

	// Initialize the underlying data model
	initialize: function(cb) {
		var my = this;

		if(! this.config.inMemory) {

			// Check that dbFilePath file exists and build tree as necessary
			require('fs-extra').touch(this.config.dbFilePath, function(err) {
				if(err) return cb(err);
				my.db = new(dirty.Dirty)(my.config.dbFilePath);

				afterwards();
			});
		} else {
			this.db = new(dirty.Dirty)();
			afterwards();
		}

		function afterwards() {

			// Make logger easily accessible
			my.log = my.config.log;

			// Trigger callback with no error
			my.db.on('load', function() {
				cb();
			});
		}
	},

	// Logic to handle flushing collection data to disk before the adapter shuts down
	teardownCollection: function(collectionName, cb) {
		var my = this;
		
		// Always go ahead and write the new auto-increment to disc, even though it will be wrong sometimes
		// (this is done so that the auto-increment counter can be "ressurected" when the adapter is restarted from disk)
		// console.log("******** Wrote to "+collectionName+":: AI => ", statusDb[collectionName].autoIncrement);
		var schema = _.extend(this.db.get(this.config.schemaPrefix + collectionName),{
			autoIncrement: statusDb[collectionName].autoIncrement
		});
		this.db.set(this.config.schemaPrefix + collectionName, schema, function (err) {
			my.db = null;
			cb && cb(err);
		});
	},


	// Fetch the schema for a collection
	// (contains attributes and autoIncrement value)
	describe: function(collectionName, cb) {	
		this.log(" DESCRIBING :: " + collectionName);
		var schema = this.db.get(this.config.schemaPrefix + collectionName);
		var attributes = schema && schema.attributes;
		return cb(null, attributes);
	},

	// Fetch the current auto-increment value
	getAutoIncrement: function (collectionName,cb) {
		var schema = this.db.get(this.config.schemaPrefix + collectionName);
		return cb(err,schema.autoIncrement);
	},

	// Persist the current auto-increment value
	setAutoIncrement: function (collectionName,cb) {
		this.db.set(this.config.schemaPrefix + collectionName, {

		});
		return cb(err,schema.autoIncrement);
	},

	// Create a new collection
	define: function(collectionName, attributes, cb) {
		this.log(" DEFINING " + collectionName, {
			as: schema
		});
		var self = this;

		var schema = {
			attributes: _.clone(attributes),
			autoIncrement: 1
		};

		// Write schema and status objects
		return self.db.set(this.config.schemaPrefix + collectionName, schema, function(err) {
			if(err) return cb(err);

			// Set in-memory schema for this collection
			statusDb[collectionName] = schema;
			cb();
		});
	},

	// Drop an existing collection
	drop: function(collectionName, cb) {
		var self = this;
		self.log(" DROPPING " + collectionName);
		return self.db.rm(self.config.dataPrefix + collectionName, function(err) {
			if(err) return cb("Could not drop collection!");
			return self.db.rm(self.config.schemaPrefix + collectionName, cb);
		});
	},

	// Extend the schema for an existing collection
	alter: function(collectionName, newAttrs, cb) {
		this.log(" ALTERING " + collectionName);
		var schema = this.db.get(this.config.schemaPrefix + collectionName);
		schema = _.extend(schema.attributes, newAttrs);
		return this.db.set(this.config.schemaPrefix + collectionName, schema, cb);
	},



	// Create one or more new models in the collection
	create: function(collectionName, values, cb) {
		this.log(" CREATING :: " + collectionName, values);
		values = values || {};
		var dataKey = this.config.dataPrefix + collectionName;
		var data = this.db.get(dataKey);
		var self = this;


		// Lookup schema & status so we know all of the attribute names and the current auto-increment value
		var schema = this.db.get(this.config.schemaPrefix + collectionName);

		// Auto increment fields that need it
		doAutoIncrement(collectionName, schema.attributes, values, this, function (err, values) {
			if (err) return cb(err);

			self.describe(collectionName, function(err, attributes) {
				if(err) return cb(err);

				// TODO: add other fields with default values
				// Create new model
				// (if data collection doesn't exist yet, create it)
				data = data || [];
				data.push(values);

				// Replace data collection and go back
				self.db.set(dataKey, data, function(err) {
					return cb(err, values);
				});
			});
		});
	},

	// Find one or more models from the collection
	// using where, limit, skip, and order
	// In where: handle `or`, `and`, and `like` queries
	find: function(collectionName, options, cb) {

		var criteria = options.where;

		////////////////////////////////////////////////
		// TODO: Make this shit actually work
		var limit = options.limit;
		var skip = options.skip;
		var order = options.order;
		////////////////////////////////////////////////
		var dataKey = this.config.dataPrefix + collectionName;
		var data = this.db.get(dataKey);

		// Query and return result set using criteria
		cb(null, applyFilter(data, criteria));
	},

	// Update one or more models in the collection
	update: function(collectionName, options, values, cb) {
		this.log(" UPDATING :: " + collectionName, {
			options: options,
			values: values
		});
		var my = this;

		var criteria = options.where;

		////////////////////////////////////////////////
		// TODO: Make this shit actually work
		var limit = options.limit;
		var skip = options.skip;
		var order = options.order;
		////////////////////////////////////////////////
		var dataKey = this.config.dataPrefix + collectionName;
		var data = this.db.get(dataKey);

		// Query result set using criteria
		var resultIndices = [];
		_.each(data, function(row, index) {
			my.log('matching row/index', {
				row: row,
				index: index
			});
			my.log("against", criteria);
			my.log("with outcome", matchSet(row, criteria));

			if(matchSet(row, criteria)) resultIndices.push(index);
		});
		this.log("filtered indices::", resultIndices, 'criteria', criteria);

		// Update value(s)
		_.each(resultIndices, function(index) {
			data[index] = _.extend(data[index], values);
		});

		// Replace data collection and go back
		this.db.set(dataKey, data, function(err) {
			cb(err, values);
		});
	},

	// Delete one or more models from the collection
	destroy: function(collectionName, options, cb) {
		this.log(" DESTROYING :: " + collectionName, options);

		var criteria = options.where;

		////////////////////////////////////////////////
		// TODO: Make this shit actually work
		var limit = options.limit;
		var skip = options.skip;
		var order = options.order;
		////////////////////////////////////////////////
		var dataKey = this.config.dataPrefix + collectionName;
		var data = this.db.get(dataKey);

		// Query result set using criteria
		data = _.reject(data, function(row, index) {
			return matchSet(row, criteria);
		});

		// Replace data collection and go back
		this.db.set(dataKey, data, function(err) {
			cb(err);
		});
	},



	// Identity is here to facilitate unit testing
	// (this is optional and normally automatically populated based on filename)
	identity: 'dirty'
};



//////////////                 //////////////////////////////////////////
////////////// Private Methods //////////////////////////////////////////
//////////////                 //////////////////////////////////////////

// Look for auto-increment field, increment counter accordingly, and return refined value set
function doAutoIncrement (collectionName, attributes, values, ctx, cb) {

	// Determine the attribute names which will be included in the created object
	var attrNames = _.keys(_.extend({}, attributes, values));

	// increment AI fields in values set
	_.each(attrNames, function(attrName) {
		if(_.isObject(attributes[attrName]) && attributes[attrName].autoIncrement) {
			values[attrName] = statusDb[collectionName].autoIncrement;

			// Then, increment the auto-increment counter for this collection
			statusDb[collectionName].autoIncrement++;
		}
	});

	// Return complete values set w/ auto-incremented data
	return cb(null,values);
}


// Run criteria query against data aset
function applyFilter(data, criteria) {
	if(criteria && data) {
		return _.filter(data, function(model) {
			return matchSet(model, criteria);
		});
	} else return data;
}


// Match a model against each criterion in a criteria query

function matchSet(model, criteria) {
	// Null WHERE query always matches everything
	if(!criteria) return true;

	// By default, treat entries as AND
	for(var key in criteria) {
		if(!matchItem(model, key, criteria[key])) return false;
	}
	return true;
}


function matchOr(model, disjuncts) {
	var outcome = false;
	_.each(disjuncts, function(criteria) {
		if(matchSet(model, criteria)) outcome = true;
	});
	return outcome;
}

function matchAnd(model, conjuncts) {
	var outcome = true;
	_.each(conjuncts, function(criteria) {
		if(!matchSet(model, criteria)) outcome = false;
	});
	return outcome;
}

function matchLike(model, criteria) {
	for(var key in criteria) {
		// Make attribute names case insensitive unless overridden in config
		if(!adapter.config.attributesCaseSensitive) key = key.toLowerCase();

		// Check that criterion attribute and is at least similar to the model's value for that attr
		if(!model[key] || (!~model[key].indexOf(criteria[key]))) {
			return false;
		}
	}
	return true;
}

function matchNot(model, criteria) {
	return !matchSet(model, criteria);
}

function matchItem(model, key, criterion) {
	// Make attribute names case insensitive unless overridden in config
	if(!adapter.config.attributesCaseSensitive) key = key.toLowerCase();

	if(key.toLowerCase() === 'or') {
		return matchOr(model, criterion);
	} else if(key.toLowerCase() === 'not') {
		return matchNot(model, criterion);
	} else if(key.toLowerCase() === 'and') {
		return matchAnd(model, criterion);
	} else if(key.toLowerCase() === 'like') {
		return matchLike(model, criterion);
	}
	// Otherwise this is an attribute name: ensure it exists and matches
	else if(!model[key] || (model[key] !== criterion)) {
		return false;
	}
	return true;
}

// Number of miliseconds since the Unix epoch Jan 1st, 1970

function epoch() {
	return(new Date()).getTime();
}

// Return the oldest lock in the collection

function getOldest(locks) {
	var currentLock;
	_.each(locks, function(lock) {
		if(!currentLock) currentLock = lock;
		else if(lock.timestamp < currentLock.timestamp) currentLock = lock;
	});
	return currentLock;
}