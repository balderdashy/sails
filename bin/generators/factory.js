/**
 * Module dependencies
 */
var _ = require('lodash');
var util = require('util');
var GenerateModuleHelper = require('../generators/_helpers/module');


// Access fn for module helper which always injects
// the proper `generator` option
module.exports = function (generatorName) {

	var generator;
	var generatorPath = __dirname + '/' + generatorName;

	// Try `generators`
	try {
		generator = require( generatorPath );
	}
	catch(e0) {
		throw new Error(
			'Generator, `'+ util.inspect(generatorName) +'` failed to load' + 
			' ( @ ' + util.inspect(generatorPath) + ')'+'\n'+e0
		);
	}

	
	// Return a working generator
	return function (options, handlers) {

		// If generate function explicitly defined, return it.
		if (generator.generate) {

			// Pass down generator options
			options.logStatusOverrides = generator.logStatusOverrides;

			return generator.generate(options, handlers);
		}

		// Otherwise, by default, use module helper
		return GenerateModuleHelper(_.extend(options,{
			generator: generator
		}), handlers);
	};
};

