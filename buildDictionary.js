var _ = require('underscore');
var requireAll = require('require-all');


// buildDictionary ()
// Go through each object, include the code, and determine its identity
//
// @dirname		:: the path to the source directory
// @filter		:: the filter regex
// $replaceExpr	:: the replace regex
function buildDictionary (dirname,filter,replaceExpr) {
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
	return objects;
}

module.exports = buildDictionary;