/**
 * Module dependencies.
 */

var util = require('sails-util'),
	winston = require('winston');


/**
 * Logger encapsulates winston, a logging library,
 * to manage logging to different adapters.
 */

module.exports = function CaptainsLog ( config ) {
	var self = this;
	config = util.merge({
		level: 'info',
		maxSize: 10000000,
		maxFiles: 10,
		json: false,
		colorize: true
	}, config || {});

	// Available transports
	var transports = [
		new(winston.transports.Console)({
			level: 'debug',
			colorize: config.colorize
		})
	];

	// If filePath option is set, ALSO write log output to a flat file
	if (!util.isUndefined(config.filePath)) {
		transports.push(
			new(winston.transports.File)({
				filename: config.filePath,
				maxsize: config.maxSize,
				maxFiles: config.maxFiles,
				level: 'verbose',
				json: config.json,
				colorize: config.colorize
			}));
	}

	var logLevels = {
		silly: 6,
		verbose: 5,
		info: 4,
		debug: 3,
		warn: 2,
		error: 1,
		silent: 0
	};

	// if adapter option is set, ALSO write log output to an adapter
	if (!util.isUndefined(config.adapters)) {
		util.each(config.adapters, function(val, transport) {
			if (typeof val.module !== 'undefined') {

				// The winston module MUST be exported to a variable of same name
				var module = require(val.module)[transport];

				// Make sure it was exported correctly
				if (module) {
					transports.push(
						new(module)(val)
					);
				}
			}
		});
	}


	// Instantiate winston
	var logger = new(winston.Logger)({
		transports: transports
	});



	// Make sure all supported log methods exist

	// We assume that at least something called
	// `logger.debug` or `logger.log` exists.
	if (!logger.log) {
		throw new Error(
			'Unsupported logger!\n' +
			'(has no `.log()` or `.debug()` method.)'
		);
	}

	// Fill in the gaps where they don't
	logger.debug = logger.debug || logger.log;
	logger.info = logger.info || logger.log;
	logger.warn = logger.warn || logger.error || logger.log;
	logger.error = logger.error || logger.log;
	logger.verbose = logger.verbose || logger.log;
	logger.silly = logger.verbose || logger.log;



	// Now generate the configured logging methods:

	// Supported log methods
	var log = _generateLogFn('debug');
	log.log = _generateLogFn('debug');
	log.error = _generateLogFn('error');
	log.warn = _generateLogFn('warn');
	log.debug = _generateLogFn('debug');
	log.info = _generateLogFn('info');
	log.verbose = _generateLogFn('verbose');
	log.silly = _generateLogFn('silly');

	// Export logger object
	return log;




	/**
	 * @returns a configured-level-aware log function
	 *          at the specified log level
	 */

	function _generateLogFn(level) {
		return function() {

			// Compose `str` of all the arguments
			var pieces = [];
			var str = '';
			util.each(arguments, function(arg) {
				if (typeof arg === 'object') {
					if (arg instanceof Error) {
						pieces.push(arg.stack);
						return;
					}
					pieces.push(util.inspect(arg));
					return;
				}

				if (typeof arg === 'function') {
					pieces.push(arg.valueOf());
					return;
				}

				pieces.push(arg);
			});
			str = pieces.join(' ');


			// Print out output if log level is below configured log level
			if ( logLevels[level] <= logLevels[config.level] ) {
				var fn = logger[level];
				fn(str);
			}
		};
	}
};
