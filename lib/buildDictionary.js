var _ = require('underscore');
var requireAll = require('require-all');


// buildDictionary ()
// Go through each object, include the code, and determine its identity.
// Tolerates non-existent files/directories by ignoring them.
//
// @dirname		:: the path to the source directory
// @filter		:: the filter regex
// $replaceExpr	:: the replace regex
module.exports = function (dirname,filter,replaceExpr) {
	try {
		var files = requireAll({ 
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

		// Always return at least an empty dictionary
		if (!objects) return {};
		return objects;
	}
	// If an error occurs (likely, dir doesn't exist), just return an empty object
	catch (e) {
		
		// TODO: better error handling here!!!
		// tricky because of how requireAll() handles errors
		// (where's my callback bro?)
		return {};
	}
};