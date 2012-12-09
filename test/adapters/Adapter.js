// Dependencies
var async = require('async');
var _ = require('underscore');


/////////////////////////////
// Adapter.js
/////////////////////////////
//
// This is only a template!
//
// ** this ** refers to the adapter
// 
//
var adapter = module.exports = {

	// Initialize the underlying data model
	initialize: function(cb) {	
		cb(); 
	},

	// Tear down any remaining connectins to the underlying data model
	teardown: function (cb) {
		cb && cb();
	},



	// Fetch the schema for a collection
	describe: function(collectionName, cb) {
		cb();
	},

	// Create a new 
	define: function(collectionName, schema, cb) { 
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




	// Create one or more new models in the collectionName
	create: function(collectionName, values, cb) { 
		cb();
	},

	// Find one or more models from the collectionName
	find: function(collectionName, criteria, cb) { 
		cb();
	},

	// Update one or more models in the collectionName
	update: function(collectionName, criteria, values, cb) { 
		cb();
	},

	// Delete one or more models from the collectionName
	// ** this ** refers to the collectionName
	destroy: function(collectionName, criteria, cb) { 
		cb();
	},



	// Begin an atomic transaction
	// lock models in collectionName which fit criteria (if criteria is null, lock all)
	lock: function (collectionName, criteria, cb) { 
		cb();
	},

	// Commit and end an atomic transaction
	// unlock models in collectionName which fit criteria (if criteria is null, unlock all)
	unlock: function (collectionName, criteria, cb) { 
		cb();
	},



	// Get table status (i.e. auto_increment counter)
	status: function (collectionName, cb) {
		cb(null,{
			autoIncrement: 1
		});
	},



	// If @collectionName and @otherCollectionName are both using this adapter, do a more efficient remote join.
	// (By default, an inner join, but right and left outer joins are also supported.)
	join: function(collectionName, otherCollectionName, key, foreignKey, left, right, cb) { 
		cb();
	}
};


//////////////                 //////////////////////////////////////////
////////////// Private Methods //////////////////////////////////////////
//////////////                 //////////////////////////////////////////

