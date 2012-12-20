// Dependencies
var _ = require('underscore');
var parley = require('parley');
var assert = require("assert");


describe('adapter', function() {
	describe('#initialize()', function() {
		it('should initialize and sync without an error', function(done) {
			// Grab included adapters and test models
			var adapters = buildDictionary(__dirname + '/../adapters', /(.+Adapter)\.js$/, /Adapter/);
			var models = buildDictionary(__dirname + '/models', /(.+)\.js$/);

			var $ = new parley();
			var outcome = $(require("../waterline.js")) (adapters,models);
			$(done)(outcome);
		});
	});
});


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