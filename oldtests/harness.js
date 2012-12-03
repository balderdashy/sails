// Dependencies
var async = require('async');
var _ = require('underscore');
_.str = require('underscore.string');
var parley = require('parley');
var waterline = require('./../waterline.js');




// Grab included adapters and test models
var adapters = buildDictionary(__dirname + '/../adapters', /(.+Adapter)\.js$/, /Adapter/);
var models = buildDictionary(__dirname + '/models', /(.+)\.js$/);


var $$ = new parley();
var out = $$(waterline) (adapters,models);
// $$.log(out);

// Do some sample operations
$$(function (err,data,cb) {
	var $$ = new parley();
	var User = data.collections.user;
	console.log("DO SOEM THINGS");

	$$.log("Creating user...");
	var user = $$(User).create({
		name: "TEST"
	});
	// $$.log(user);

}) (out);


// buildDictionary ()
// Go through each object, include the code, and determine its identity
//
// @dirname		:: the path to the source directory
// @filter		:: the filter regex
// $replaceExpr	:: the replace regex
function buildDictionary (dirname,filter,replaceExpr) {
	var files = require('require-all')({ 
		dirname: dirname,
		filter: filter
	});
	var objects = {};
	_.each(files,function (object, filename) {
		// If no 'identity' attribute was provided, 
		// take a guess based on the filename
		if (!object.identity) {
			if (!replaceExpr) object.identity = filename.toLowerCase();
			else object.identity = filename.replace(replaceExpr, "").toLowerCase();
		}
		objects[object.identity] = object;
	});
	return objects;
}


// Extend collection and adapter definition
// var User = new waterline.Collection(require('../models/User.js'));
// _.bindAll(User.adapter);
// var newAdapter = new waterline.Adapter(User.adapter);





// TODO: instead of saving empty list to dirty-db, use an entry for each model

/*
i.e. for model:
{
	collection: 'User',
	data: {
		name: 'Mike',
		email: 'mike@balderdash.co'
	}
}
*/


// TODO: also explore:

/*

$(SomeModel).find(4);

where $(SomeModel) is just SomeModel, but every attribute that is a function (like find())
automatically gets a callback function provided by parley.  

Then the parley queue can be activated later (at the end of the controller perhaps).

// Examples:
$(User).join(FacebookUser, { name: fullName });

If a parley object is passed into a view, queries to adapter will be deferred until the view is rendered

// IN controller
res.view({
	users: User.where({id:'>4'}).join(FacebookUser, { name: fullName })
})

// Then in view
module.exports = function() {
	return {
		name: this.users.name,
		dateOfBirth: this.users.dateOfBirth
	};
};


// Because the promise passed down to the view contained more than one model, 
// the view will automatically understand that and let you create the api view
// for just one single model, then use that as a template.

*/

// // Create flow control object
// var $$$ = new parley();

// // Connect to adapters
// $$$ ( User.adapter.connect ) ();


// // Sync adapter schemas (if necessary)
// $$$ ( User.adapter['sync'+_.str.capitalize(User.scheme)] ) (User);


