// Dependencies
var db;
var async = require('async');
var _ = require('underscore');

// Shared domain object is used to define schema for the models using this adapter
var domain = {};

/////////////////////////////
// DirtyAdapter.js
/////////////////////////////
//
// This adapter is for development only!
//
// Learn more about this database: https://github.com/felixge/node-dirty
// 
var adapter = {

	// Adapter configuration
	config: {
		// File to write persistent data
		// (if left unspecified, the data will be stored only in-memory and lost when the server is shut down)
		outputFile: '/tmp/sails_dirty.db'
	},


	// Connect to the underlying data model
	initialize: function(cb) {
		var self = this;

		db = require('dirty')(self.config.outputFile);
		db.on('load', function afterLoad() {
			// Create domain object for storing waterline collection definitions
			domain = {};
			cb();
		});
	},


	// Fetch the definition for a collection
	describe: function(name, cb) {
		var self = this;
		var definition = domain[name];
		cb(null, definition);
	},

	// Define a new collection
	define: function(name, definition, cb) {
		var self = this;
		console.log("DEFINING "+name,definition);
		// If id is not defined, add it
		if(!definition.attributes.id) {
			definition.attributes.id = {
				type: 'INTEGER',
				primaryKey: true,
				autoIncrement: true
			};
		}

		// If the config allows it, and they aren't already specified,
		// extend definition with updatedAt and createdAt
		if(sails.config.waterline.createdAt && !definition.createdAt) {
			definition.createdAt = 'DATE';
		}
		if(sails.config.waterline.updatedAt && !definition.updatedAt) {
			definition.updatedAt = 'DATE';
		}

		// Normalize definition
		for(var a in definition.attributes) {
			if(_.isString(definition[a])) {
				definition[a] = {
					type: definition[a]
				};
			}
		}

		// Verify that collection doesn't already exist, then create it
		self.describe(name, function defineNewCollection(err, existingDefinition) {
			if(existingDefinition) cb('The collection, ' + name + ', already exists.');
			else if(err) cb(err);
			else {
				// Add collection to waterline domain object
				domain[name] = definition;

				// No need to save anything right now
				cb();
			}
		});
	},

	// Drop an existing collection
	drop: function(name, cb) {
		var self = this;

		// TODO: foreach through and delete all of the models for this collection

		// Remove schema def from waterline domain object
		delete domain[name];

		cb();
	},

	// Alter an existing collection
	alter: function(name, newPartialDef, cb) {
		var self = this;

		// Update schema in waterline domain object
		domain[name] = _.extend(domain[name], newPartialDef);

		// TODO: add default values for existing models where new attrs are undefined
		cb();
	},



	// Create one or more new models in the data store.
	create: function(collection, values, cb) {
		var self = this;
		var dataCollection = db.get(collection.identity);

		// If a list was specified, create multiple models
		if(_.isArray(values)) {
			return async.forEach(values, doCreate, cb);
		}
		// Otherwise create a single model
		else if(_.isObject(values)) {
			return doCreate(values, cb);
		} else return cb('Invalid values, ' + values + ' in create()');


		// Add a new model to collection
		function doCreate(values, cb) {
			// Add id (auto-increment PK- indexing is 1-based)
			if (!values.id) {
				values.id = dataCollection.length + 1;
			}
			// Persist new model and build and send back model object
			dataCollection.push(values);
			db.set(dataCollection.identity, dataCollection, function() {
				cb(null, buildModel(values) || null);
			});
		}
	},


	// Find one or more models from the data store.
	find: function(name, criteria, cb) {
		var self = this;
		var collection = db.get(name);
		criteria = normalizeCriteria(criteria);

		// Look up models
		var resultSet = _.where(collection, criteria);

		// Respond with a list of located models
		cb(null, buildModel(resultSet) || null);
	},


	// Update one or more models in the data store.
	update: function(name, criteria, values, cb) {
		var self = this;
		var collection = db.get(name);
		criteria = normalizeCriteria(criteria);

		if(_.isObject(values)) {

			// Look up models
			var resultSet = _.where(collection, criteria);

			// Extend collection with updated values
			resultSet = _.map(resultSet, function(model) {
				return _.extend(model, values);
			});
			db.set(name, collection, function() {
				// Respond with a list of updated models
				cb(null, buildModel(resultSet) || null);
			});
		} else return cb('Invalid values, ' + values + ' in update()');
	},


	// Delete one or more models from the data store.
	destroy: function(name, criteria, cb) {
		var self = this;
		var collection = db.get(name);
		criteria = normalizeCriteria(criteria);

		// Look up list of models who don't match the specified criteria
		console.log("******", collection, criteria);
		collection = _.reject(collection, function(model) {
			return _.isEqual(model, collection) ? model : false;
		});
		console.log("******", collection);

		// Persist and respond with a list of models
		db.set(name, collection, function() {
			// Respond with a list of updated models
			cb(null, buildModel(collection) || null);
		});
	},


	// Begin an atomic transaction
	lock: function (name, criteria, cb) { 
		var self = this;
	},

	// Commit and end an atomic transaction
	unlock: function (name, criteria, cb) { 
		var self = this;
	},

	// If @thisModel and @otherModel are both using this adapter, do a more efficient remote join.
	// (By default, an inner join, but right and left outer joins are also supported.)
	join: function(thisModel, otherModel, key, foreignKey, left, right, cb) { 
		var self = this;
	}
};


// Bind each method in adapter to self
adapter = _.bindAll(adapter);

// (sync methods are bound at runtime in waterline)

// Export adapter
module.exports = adapter;


// TODO: build actual model(s)


function buildModel(valuesCollection) {
	var models = valuesCollection;
	return models;
}

// Normalize criteria


function normalizeCriteria(criteria) {
	if((_.isFinite(criteria) || _.isString(criteria)) && +criteria > 0) {
		return criteria = {
			id: +criteria
		};
	}
	if(!_.isObject(criteria)) {
		return 'Invalid criteria, ' + criteria + ' in find()';
	}
}