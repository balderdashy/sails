// Dependencies
var async = require('async');
var _ = require('underscore');


/////////////////////////////
// Adapter.js
/////////////////////////////
//
// This is only a template!
//
// 
//
var adapter = module.exports = {

	// Connect to the underlying data model
	connect: function(cb) {	},

	// Sync schema between the model and the data store
	// Scheme can be 'drop', 'alter', or something custom
	// Controls whether database is dropped and recreated when app starts,
	// or whether waterline will try and synchronize the schema with the app models.
	sync: {

		// Drop and recreate a collection
		drop: function(collection, cb) { },

		// Alter schema for a collection
		alter: function (collection, cb) { }

	},


	// Fetch the schema for a collection
	describe: function(collection, cb) { },

	// Create a new collection
	define: function(collection, definition, cb) { },

	// Drop an existing collection
	drop: function(collection, cb) { },

	// Alter the schema for an existing collection
	alter: function (collection,newAttrs,cb) { },


	// Create one or more new models in the collection
	create: function(collection, values, cb) { },

	// Find one or more models from the collection
	find: function(collection, criteria, cb) { },

	// Update one or more models in the collection
	update: function(collection, criteria, values, cb) { },

	// Delete one or more models from the collection
	destroy: function(collection, criteria, cb) { },


	// Begin an atomic transaction
	lock: function (collection, criteria, cb) { },

	// Commit and end an atomic transaction
	unlock: function (collection, criteria, cb) { },

	// If @thisModel and @otherModel are both using this adapter, do a more efficient remote join.
	// (By default, an inner join, but right and left outer joins are also supported.)
	join: function(thisModel, otherModel, key, foreignKey, left, right, cb) { }
};
