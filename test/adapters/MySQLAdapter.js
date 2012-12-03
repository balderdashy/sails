// Dependencies
var async = require('async');
var parley = require('parley');
var _ = require('underscore');
var mysql = require('mysql');
var uuid = require("node-uuid");


/*---------------------
	:: MySQLAdapter
	-> adapter
---------------------*/
var adapter = module.exports = {

	config: {
		host: 'localhost',
		user: 'test',
		password: 'test'
	},

	// Initialize the underlying data model
	initialize: function(cb) {	
		var self = this;
		this.pool = [];

		// When process ends, close all open connections
		process.on('SIGINT', process.exit);
		process.on('SIGTERM', process.exit);
		process.on('exit', function () { self.teardown(); });

		cb();
	},

	// Tear down any remaining connectins to the underlying data model
	teardown: function (cb) {
		var self = this;
		async.forEach(this.pool,function (connection,cb) {
			connection.end(cb);
		},function (err) {
			console.log("\nTerminated "+
				self.pool.length + " open connections to mySQL server "+
				"@ "+self.config.host+
			".");
			cb && cb(err);
		});
	},
	

	// Sync schema between the model and the data store
	// Scheme can be 'drop', 'alter', or something custom
	// Controls whether database is dropped and recreated when app starts,
	// or whether waterline will try and synchronize the schema with the app models.
	sync: {

		// Drop and recreate a collection
		drop: function(collection, cb) {
			cb();
		},

		// Alter schema for a collection
		alter: function(collection, cb) {
			cb();
		}
	},

	// Fetch the schema for a collection
	describe: function(collection, cb) {
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

	// Alter the schema for an existing collection
	alter: function(collection, newAttrs, cb) {
		cb();
	},


	// Create one or more new models in the collection
	create: function(collection, values, cb) {
		var $$ = new parley();
		var c = $$(acquireConnection)();
		$$(cb).ifError();


		$$(releaseConnection)(c);
		$$(cb)();
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
	lock: function(collection, criteria, cb) {
		cb();
	},

	// Commit and end an atomic transaction
	unlock: function(collection, criteria, cb) {
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

// Open a connection and add to pool
function acquireConnection (cb) {
	var connection = mysql.createConnection(adapter.config);
	connection._waterlineId = uuid.v1();
	connection.connect(function (err) {
		adapter.pool.push(connection);
		cb(err,connection);
	});
}

// Close an existing connection and remove from pool
function releaseConnection (err,connection,cb) {
	connection.end(function (err) {
		adapter.pool = _.reject(adapter.pool,function (c) {
			return connection._waterlineId === c._waterlineId;
		});
		cb(err,connection);
	});
}

