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

	// Initialize the underlying data model
	initialize: function(cb) {	
		cb(); 
	},

	// Tear down any remaining connectins to the underlying data model
	teardown: function (cb) {
		cb();
	},



	// Fetch the schema for a collection
	describe: function(collectionName, cb) {
		cb();
	},

	// Create a new collection
	define: function(collectionName, definition, cb) { 
		cb();
	},

	// Drop an existing collection
	drop: function(collectionName, cb) { 
		cb();
	},

	// Extend the schema for an existing collection
	alter: function (collectionName,newAttrs,cb) { 
		cb();
	},




	// Create one or more new models in the collection
	create: function(collection, values, cb) { 
		cb();
	},

	// Find one or more models from the collection
	find: function(collection, criteria, cb) { 
		cb();
	},

	// Update one or more models in the collection
	update: function(collection, criteria, values, cb) { 
		cb();
	},

	// Delete one or more models from the collection
	destroy: function(collection, criteria, cb) { 
		cb();
	},



	// Begin an atomic transaction
	lock: function (collection, criteria, cb) { 
		cb();
	},

	// Commit and end an atomic transaction
	unlock: function (collection, criteria, cb) { 
		cb();
	},



	// If @thisModel and @otherModel are both using this adapter, do a more efficient remote join.
	// (By default, an inner join, but right and left outer joins are also supported.)
	join: function(thisModel, otherModel, key, foreignKey, left, right, cb) { 
		cb();
	}
};


//////////////                 //////////////////////////////////////////
////////////// Private Methods //////////////////////////////////////////
//////////////                 //////////////////////////////////////////

