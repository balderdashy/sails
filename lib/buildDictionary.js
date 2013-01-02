var _ = require('underscore');


module.exports = {
	required: function(options) {
		return buildDictionary(options);
	},

	optional: function(options) {
		options.optional = true;
		return buildDictionary(options);
	}
};

// buildDictionary ()
// Go through each object, include the code, and determine its identity.
// Tolerates non-existent files/directories by ignoring them.
//
// @dirname		:: the path to the source directory
// @filter		:: the filter regex
// $replaceExpr	:: the replace regex
// @optional	:: if optional, don't throw an error if nothing is found
function buildDictionary(options) {
	
	var files = require('include-all')({
		dirname: options.dirname,
		filter: options.filter,
		optional: options.optional
	});

	var objects = {};
	_.each(files, function(object, filename) {
		// If no 'identity' attribute was provided, 
		// take a guess based on the (case-insensitive) filename
		if(!object.identity) {
			object.identity = options.replaceExpr ? filename.replace(options.replaceExpr, "") : filename;
			object.identity = object.identity.toLowerCase();
		}
		objects[object.identity] = object;
	});	
	if(!objects) return {};
	return objects;
}