/**
 * Module dependencies
 */

var _			= require('lodash'),
	includeAll	= require('include-all'),
	Err			= require('./errors');



/**
 * buildDictionary
 * 
 * Go through each object, include the code, and determine its identity.
 * Tolerates non-existent files/directories by ignoring them.

	@param {Object} options {
		dirname			:: the path to the source directory

		identity		:: If disabled, (explicitly set to false) don't inject an identity into the module
						   also don't try to use the bundled `identity` property in the module to determine
						   the keyname in the result object
						   default: true

		optional		:: if enabled, fail silently and return {} when source directory does not exist
						   or cannot be read (otherwise, exit w/ an error)
						   default: false

		depth			:: the level of recursion where modules will be included
						   defaults to infinity? (not sure)

		filter			:: only include modules whose FILENAME matches this regex
						   default `undefined`

		pathFilter		:: only include modules whose FULL RELATIVE PATH matches this regex
						   (relative from the entry point directory)
						   default `undefined`

		replaceExpr		:: in identity: use this regex to remove substrings like 'Controller' or 'Service'
						   and replace them with the value of `replaceVal`

		replaceVal		:: see above
						   default value: ''

		dontLoad		:: if `dontLoad` is set to true, don't run the module w/ V8 or load it into memory-- 
						   instead, return a tree representing the directory structure
						   (all extant file leaves are included as keys, with their value = `true`)
	}

	@param {Function} cb
 */

module.exports = function buildDictionary (options, cb) {

	// Defaults
	options.replaceVal = options.replaceVal || '';

	// Deliberately exclude source control directories
	if (!options.excludeDirs) {
		options.excludeDirs = /^\.(git|svn)$/;
	}

	var files = includeAll(options);

	// Start building the module dictionary
	var dictionary = {};

	// Iterate through each module in the set
	_.each(files, function(module, filename) {

		// Build the result object by merging all of the target modules
		// Note: Each module must export an object in order for this to work
		// (e.g. for building a configuration object from a set of config files)
		if (options.aggregate) {

			// Check that source module is a valid object
			if ( !_.isPlainObject(module) ) {
				return cb(Err.invalidModule);
			}

			// Merge module into dictionary
			_.merge(dictionary, module);

			return;
		}

		// Keyname is how the module will be identified in the returned module tree
		var keyName = filename;

		// If a module is found but marked as `undefined`,
		// don't actually include it (since it's probably unusable)
		if (typeof module === 'undefined') {
			return;
		}

		// Unless the `identity` option is explicitly disabled,
		// (or `dontLoad` is set)
		if (!options.dontLoad && options.identity !== false) {

			// If no `identity` property is specified in module, infer it from the filename
			if (!module.identity) {
				if (options.replaceExpr) {
					module.identity = filename.replace(options.replaceExpr, options.replaceVal);
				}
				else module.identity = filename;
			}

			// globalId is the name of the variable for this module 
			// that will be exposed globally in Sails unless configured otherwise
			
			// Generate `globalId` using the original value of module.identity
			module.globalId = module.identity;

			// `identity` is the all-lowercase version
			module.identity = module.identity.toLowerCase();

			// Use the identity for the key name
			keyName = module.identity;
		}

		// Save the module's contents in our dictionary object
		// (this will actually just be `true` if the `dontLoad` option is set)
		dictionary[keyName] = module;
	});

	// Always return at least an empty object
	dictionary = dictionary || {};
	
	return cb(null, dictionary);
};
