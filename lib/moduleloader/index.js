var _ = require('lodash');

// Sails module loader (Cargo)
module.exports = {

	// Build a dictionary of named modules
	// (throw an error if the container cannot be loaded)
	required: function(options) {
		return buildDictionary(options);
	},

	// Build a dictionary of named modules
	// (fail silently if the container cannot be loaded)
	optional: function(options) {
		options.optional = true;
		return buildDictionary(options);
	},

	// Build a dictionary indicating whether the named modules exist
	// (fail silently if the container cannot be loaded)
	exists: function(options) {
		options.optional = true;
		options.dontLoad = false;
		return buildDictionary(options);
	},

	// Build a single module object by extending {} with the contents of each module
	// (fail silently if the container cannot be loaded)
	aggregate: function(options) {
		options.aggregate = true;
		options.optional = true;
		return buildDictionary(options);
	}
};

/**
buildDictionary ()

Go through each object, include the code, and determine its identity.
Tolerates non-existent files/directories by ignoring them.

options {}
	dirname			:: the path to the source directory
	depth			:: the level of recursion where modules will be included
	filter			:: only include modules whose filename matches this regex
	pathFilter		:: only include modules whose full relative path matches this regex (relative from the entry point directory)
	replaceExpr		:: in identity: use this regex to remove things like 'Controller' or 'Service' and replace them with replaceVal
	replaceVal		:: in identity: see above (default value === '')
	optional		:: if optional, don't throw an error if nothing is found
	federated		:: if federated, build the module by grouping submodules by their immediate parent directory name
	dontLoad		:: if dontLoad is set to true, don't load the module into memory--   just return `true`.
*/
function buildDictionary(options) {
	
	// exclude source control directories
	if(!options.excludeDirs) {
		options.excludeDirs = /^\.(git|svn)$/;
	}

	var files = require('include-all')(options);
	var dictionary = {};

	// Iterate through each module in the set
	_.each(files, function(module, filename) {

		// Build a single module, treating each source module as containers pieces of a distributed object
		if (options.aggregate) {
			// Check that source module is a valid object
			if (_.isArray(module) || !_.isObject(module)) {
				throw new Error('Invalid module:' + module);
			}
			else _.extend(dictionary, module);
		}

		// Build the module dictionary
		else {
			var keyName = filename;

			// If a module is found but marked as undefined,
			// don't actually include it in the final dictionary
			if (typeof module === 'undefined') {
				return;
			}

			// Unless the identity is explicitly disabled, or `dontLoad` option is set,
			// If no 'identity' attribute was provided, take a guess based on the (case-insensitive) filename
			if (!options.dontLoad && options.identity !== false) {

				if(!module.identity) {
					module.identity = options.replaceExpr ? filename.replace(options.replaceExpr, options.replaceVal || '') : filename;
					
					module.globalId = module.identity;
					module.identity = module.identity.toLowerCase();
					keyName = module.identity;
				}
				else {
					module.globalId = module.identity;
					module.identity = module.identity.toLowerCase();
					keyName = module.identity;
				}
			}


			// Save the module's contents in our dictionary
			// (this will actually just be `true` if the `dontLoad` option is set)
			dictionary[keyName] = module;
		}
	});		

	if(!dictionary) return {};
	return dictionary;
}
