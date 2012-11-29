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
	// or whether Sails will try and synchronize the schema with the app models.
	sync: {

		// Drop and recreate all collections
		drop: function(models, cb) { },

		// Alter schema
		alter: function (models,cb) { }
	},


	// Fetch the definition for a collection
	describe: function(name, cb) { },

	// Define a new collection
	define: function(name, definition, cb) { },

	// Drop an existing collection
	drop: function(name, cb) { },

	// Alter an existing collection
	alter: function (name,newPartialDef,cb) { },


	// Create one or more new models in the data store.
	create: function(name, values, cb) { },

	// Find one or more models from the data store.
	find: function(name, criteria, cb) { },

	// Update one or more models in the data store.
	update: function(name, criteria, values, cb) { },

	// Delete one or more models from the data store.
	destroy: function(name, criteria, cb) { },


	// Begin an atomic transaction
	lock: function (name, criteria, cb) { },

	// Commit and end an atomic transaction
	unlock: function (name, criteria, cb) { }
};
