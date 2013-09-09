/**
 * Module dependencies
 */

var buildDictionary = require('./buildDictionary');



/**
 * Module loader (aka Cargo)
 *
 * Load a module into memory
 */

module.exports = {

	// Build a dictionary of named modules
	// (throws an error if the container cannot be loaded)
	required: function(options) {
		return buildDictionary(options);
	},

	// Build a dictionary of named modules
	// (fails silently-- returns {} if the container cannot be loaded)
	optional: function(options) {
		options.optional = true;
		return buildDictionary(options);
	},

	// Build a dictionary indicating whether the matched modules exist
	// (fails silently-- returns {} if the container cannot be loaded)
	exists: function(options) {
		options.optional = true;
		options.dontLoad = false;
		return buildDictionary(options);
	},

	// Build a single module object by extending {} with the contents of each module
	// (fail silently-- returns {} if the container cannot be loaded)
	aggregate: function(options) {
		options.aggregate = true;
		options.optional = true;
		return buildDictionary(options);
	}
};