/*---------------------
	:: User
	-> collection
---------------------*/

var _ = require('underscore');

//////////////////////////////////////////////////
// Testing fns
//
// (these are here purely to make testing easier)
//////////////////////////////////////////////////

exports.testExists = function (exists, cb) {
	return function (err, result) {
		if(err) return cb(new Error(err));
		else if(exists && !result) return cb(new Error('No result was returned, but it should have been.'));
		else if(!exists && result) return cb(new Error('Result(s) returned, but it should NOT have been.'));
		else cb();
	};
};

// find() should return exactly n things
exports.testCount = function (count, cb) {
	return function (err, results) {
		if(err) return cb(new Error(err));
		else if(!results || !_.isArray(results)) return cb(new Error('Results should have been a list, instead it was: '+results+'.'));
		else if(results.length !== count) return cb(new Error(results.length+' results were returned, but there should have been '+count+'.'));
		else cb();
	};
};



// Each CRUD test will set the adapter property to match the adapter being tested
// exports.adapter = 'dirty';

// What synchronization scheme to use: default is 'alter'
// 
// 'drop' => Delete the database and recreate it when the server starts
// 'alter' => Do a best-guess automatic migration from the existing data model to the new one
// 'safe' => Never automatically synchonize-- leave the underlying data alone
exports.migrate = 'drop';

// Attributes for the user data model
exports.attributes = {
	name	: 'string',
	email	: 'string',
	title	: 'string',
	phone	: 'string',
	type	: 'string',
	favoriteFruit	: {
		defaultsTo: 'blueberry',
		type: 'string'
	},
	age		: 'integer',
	status: {
		type: 'boolean',
		defaultsTo: 0
	}
};

// Identity is here to facilitate unit testing
// (this is optional and normally automatically populated based on file name)
exports.identity = 'User';


// For testing purposes, the following adapter configurations are provided:

////////////////////////////////////////////////////////
// development: temporal (in-memory dirtydb)
////////////////////////////////////////////////////////
// exports.adapter = 'sails-dirty';
// exports.inMemory = false;

////////////////////////////////////////////////////////
// mySQL
////////////////////////////////////////////////////////
exports.adapter = 'sails-mysql';
exports.database = 'waterline';
exports.user = 'root';
exports.password = '';

////////////////////////////////////////////////////////
// mongo
////////////////////////////////////////////////////////
// exports.adapter = 'sails-mongo';
// exports.database = 'test';
// exports.host = 'localhost';