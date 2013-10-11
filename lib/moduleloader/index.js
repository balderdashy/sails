/**
 * Module dependencies
 */

var buildDictionary = require('./buildDictionary');



/**
 * Module loader
 *
 * Load a module into memory
 */

module.exports = {

	/**
	 * Build a dictionary of named modules
	 * (responds with an error if the container cannot be loaded)
	 * 
	 * @param {Object} options
	 * @param {Function} cb
	 */

	required: function (options, cb) {
		return buildDictionary(options, cb);
	},


	/**
	 * Build a dictionary of named modules
	 * (fails silently-- returns {} if the container cannot be loaded)
	 * 
	 * @param {Object} options
	 * @param {Function} cb
	 */

	optional: function (options, cb) {
		options.optional = true;
		return buildDictionary(options, cb);
	},


	/**
	 * Build a dictionary indicating whether the matched modules exist
	 * (fails silently-- returns {} if the container cannot be loaded)
	 * 
	 * @param {Object} options
	 * @param {Function} cb
	 */

	exists: function (options, cb) {
		options.optional = true;
		options.dontLoad = false;
		return buildDictionary(options, cb);
	},


	/**
	 * Build a single module object by extending {} with the contents of each module
	 * (fail silently-- returns {} if the container cannot be loaded)
	 * 
	 * @param {Object} options
	 * @param {Function} cb
	 */

	aggregate: function (options, cb) {
		options.aggregate = true;
		options.optional = true;
		return buildDictionary(options, cb);
	}
};

