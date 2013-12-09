/**
 * Module dependencies
 */
var _ = require('lodash');
var GenerateModuleHelper = require('../generators/_helpers/module');


// Access fn for module helper which always injects
// the proper `generator` option
module.exports = function (generatorName) {

	var generator;

	// Try `generators`
	try {
		generator = require( __dirname + '/' + generatorName );
	}
	catch(e0) {

		// // Try npm
		// try {
		// 	generator = require( __dirname + '/_helpers/' + generatorName );
		// }
		// catch (e1) {
			throw new Error(
				'Cannot require specified generator, `'+ generatorName +'` ' + 
				' ( @ ' + __dirname + '/' + generatorName + ')'
			);
		// }
	}

	
	// Return a working generator
	return function (options, handlers) {
		return GenerateModuleHelper(_.extend(options,{
			generator: generator
		}), handlers);
	};
};



// /**
//  * @param {String} generatorName
//  * @param {Function} errorHandler
//  *			- Default error handler to use for this generator
//  */
// // module.exports = function ( generatorName, errorHandler ) {

// 	var generator;

// 	// Try `generators`
// 	try {
// 		generator = require( __dirname + '/' + generatorName );
// 	}
// 	catch(e0) {

// 		// // Try npm
// 		// try {
// 		// 	generator = require( __dirname + '/_helpers/' + generatorName );
// 		// }
// 		// catch (e1) {
// 			throw new Error(
// 				'Cannot require specified generator, `'+ generatorName +'` ' + 
// 				' ( @ ' + __dirname + '/' + generatorName + ')'
// 			);
// 		// }
// 	}

// 	// Load module generator helper
	

// 	// Check that generator is valid
// 	if (typeof fn !== 'function') {
// 		return _handlers.error('Invalid generator fn :: '+util.inspect(fn));
// 	}


// // 	// Default "missing handler" callback
// // 	var missingHandlerHandler = function (handlerName) {
// // 		var msg = '`' + handlerName + '` triggered, but no handler was provided.';
// // 		return function (err) {
// // 			if (err) { msg += '\n' + util.inspect(err); }
// // 			throw new Error(msg);
// // 		};
// // 	};


// // 	// Return closure which augments options + handlers
// // 	return function (options, handlers) {

// // 		var _handlers = _.cloneDeep(handlers);

// // 		// Ensure `ok`, `error`, and `invalid` always exist
// // 		// Defaults for when the following handlers are missing:
// // 		_.defaults(_handlers, {
// // 			ok: _handlers.ok || missingHandlerHandler('ok'),
// // 			error: errorHandler || missingHandlerHandler('error'),
// // 			invalid: missingHandlerHandler('invalid')
// // 		});

// // 		// Check that options look valid
// // 		if (typeof options !== 'object') {
// // 			return _handlers.error('Invalid options :: '+util.inspect(options));
// // 		}

// // 		// Trigger generator
// // 		fn(options, _handlers);
// // 	};
// // };
