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
	connect: function(cb) {

		console.log("connect()");

		db = require('dirty')(adapter.config.outputFile);
		db.on('load', function afterLoad() {
			// Create domain object for storing waterline collection definitions
			adapter.domain = {};
setTimeout(cb,750)
			// cb();
		});
	},

	// Sync data store schema with the app's models
	sync: {
		// Drop and recreate collections
		drop: function(collection,cb) {
			console.log("sync.drop()");
			cb();
			// adapter.drop(collection, function(err) {
			// 	adapter.define(collection._class, collection, cb);
			// });
		},

		// Alter schema
		alter: function(collection, cb) {

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
			cb(err);
		}
	},

	// Fetch the definition for a collection
	describe: function(name, cb) {
		var definition = adapter.domain[name];
		cb(null, definition);
	},

	// Define a new collection
	define: function(name, definition, cb) {

		// If id is not defined, add it
		if(!definition.id) {
			definition.id = {
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
		for(var a in definition) {
			if(_.isString(definition[a])) {
				definition[a] = {
					type: definition[a]
				};
			}
		}

		// Verify that collection doesn't already exist, then create it
		adapter.describe(name, function defineNewCollection(err, existingDefinition) {
			if(existingDefinition) cb('The collection, ' + name + ', already exists.');
			else if(err) cb(err);
			else {
				// Add collection to waterline domain object
				adapter.domain[name] = definition;

				// Save empty collection to database
				db.set(name, [], function(val) {
					cb(null, val);
				});
			}
		});
	},

	// Drop an existing collection
	drop: function(name, cb) {
		db.rm(name, function() {
			// Remove collection from waterline domain object
			delete adapter.domain[name];

			cb();
		});
	},

	// Alter an existing collection
	alter: function(name, newPartialDef, cb) {
		// Update collection in waterline domain object
		adapter.domain[name] = _.extend(adapter.domain[name], newPartialDef);

		// TODO: add default values for existing models where new attrs are undefined
		cb();
	},



	// Create one or more new models in the data store.
	create: function(name, values, cb) {
		var collection = db.get(name);

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
			if(!values.id) {
				values.id = collection.length + 1;
			}
			// Persist new model and build and send back model object
			collection.push(values);
			db.set(name, collection, function() {
				cb(null, buildModel(values) || null);
			});
		}
	},


	// Find one or more models from the data store.
	find: function(name, criteria, cb) {
		var collection = db.get(name);
		criteria = normalizeCriteria(criteria);

		// Look up models
		var resultSet = _.where(collection, criteria);

		// Respond with a list of located models
		cb(null, buildModel(resultSet) || null);
	},


	// Update one or more models in the data store.
	update: function(name, criteria, values, cb) {
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
	lock: function (name, criteria, cb) { },

	// Commit and end an atomic transaction
	unlock: function (name, criteria, cb) { },

	// If @thisModel and @otherModel are both using this adapter, do a more efficient remote join.
	// (By default, an inner join, but right and left outer joins are also supported.)
	join: function(thisModel, otherModel, key, foreignKey, left, right, cb) { }
};



// Dependencies
var db;
var async = require('async');
var _ = require('underscore');

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