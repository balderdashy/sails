module.exports = function( _UNUSED_ ) {


	/**
	 * Module dependencies.
	 */

	var _ = require('lodash'),
		util = require('./util');


	/**
	 * Expose Logger
	 */

	return Logger;


	/**
	 * Logger encapsulates winston, a logging library,
	 * to manage logging to different adapters
	 */

	function Logger( config ) {

		var self = this;

		// Save config in instance and extend w/ defaults
		this.config = config = _.defaults(config || {}, {
			maxSize: 10000000,
			maxFiles: 10,
			json: false,
			colorize: true,
			level: 'info'
		});

		var winston = require('winston');

		// Available transports
		var transports = [
			new(winston.transports.Console)({
				level: 'debug',
				colorize: config.colorize
			})
		];

		// If filePath option is set, ALSO write log output to a flat file
		if (!_.isUndefined(config.filePath)) {
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
		if (!_.isUndefined(config.adapters)) {
			_.each(config.adapters, function(val, transport) {
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
		if ( ! logger.log ) {
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
		logger.verbose = logger.verbose || logger.loh;
		logger.silly = logger.silly || logger.verbose || logger.log;





		// Now generate the configured logging methods:

		// Supported log methods
		var CaptainsLog		= _generateLogFn('debug');
		CaptainsLog.log		= _generateLogFn('debug');
		CaptainsLog.error	= _generateLogFn('error');
		CaptainsLog.warn	= _generateLogFn('warn');
		CaptainsLog.debug	= _generateLogFn('debug');
		CaptainsLog.info	= _generateLogFn('info');
		CaptainsLog.verbose	= _generateLogFn('verbose');
		CaptainsLog.silly	= _generateLogFn('silly');

		// ASCII art
		CaptainsLog.ship = _drawShip( config.sailsVersion );



		// Export logger object
		return CaptainsLog;



		/**
		 * @returns a configured-level-aware log function
		 *          at the specified log level
		 */

		function _generateLogFn(level) {
			return function() {

				// Compose string of all the arguments
				var str = [];
				_.each(arguments, function(arg) {
					if (typeof arg === 'object') {
						if (arg instanceof Error) {
							str.push(arg.stack);
							return;
						}
						str.push(util.inspect(arg));
						return;
					}

					if (typeof arg === 'function') {
						str.push(arg.valueOf());
						return;
					}

					str.push(arg);
				});

				// Print out output if log level is below configured log level
				if (logLevels[level] <= logLevels[self.config.level]) {
					logger[level](str.join(' '));
				}
			};
		}


		/**
		Draw an ASCII image of a ship
											  I~
											  |\
											 /|.\
											/ || \
										  ,'  |'  \
										.-'.-==|/_--'
										`--'-------' 
		*/
		function _drawShip( sailsVersion ) {

			// Only show version if it's known
			sailsVersion = sailsVersion ? ('v'+sailsVersion) : '';

			// There are 20 characters before the ship's mast on the 2nd line,
			// starting from the 'v' (inclusive)
			var versionStrLen = sailsVersion.length;
			var numSpaces = 19 - versionStrLen;
			for (var i=0;i<numSpaces;i++) { sailsVersion += ' '; }

			return function() {
				CaptainsLog.info('');
				CaptainsLog.info('');
				CaptainsLog.info('   Sails.js           <|');
				CaptainsLog.info('    ' + sailsVersion +'|\\');
				CaptainsLog.info('                      /|.\\');
				CaptainsLog.info('                     / || \\');
				CaptainsLog.info('                   ,\'  |\'  \\');
				CaptainsLog.info('                .-\'.-==|/_--\'');
				CaptainsLog.info('                `--\'-------\' ');
				CaptainsLog.info('   __---___--___---___--___---___--___');
				CaptainsLog.info(' ____---___--___---___--___---___--___-__');
				CaptainsLog.info('');
			};
		}
	}
};
		//         <{
		//        / |\
		//       /  | \
		//      / ( |  \
		//     { ___|___\
		//     _____|____
		//     \__\__ /__/

		// return function() {
		//     log('');
		//     log('');
		//     log('');
		//     log('   Sails.js           <|');
		//     log('   v'+sails.version+'              |\\');
		//     log('                      /|.\\');
		//     log('                     / || \\');
		//     log('                   ,\'  |\'  \\');
		//     log('                .-\'.-==|/_--\'');
		//     log('                `--\'-------\' ');
		//     log('   __---___--___---___--___---___--___');
		//     log(' ____---___--___---___--___---___--___-__');
		//     log('');
		// };

		// return function() {
		//     log('');
		//     log('');
		//     log('');
		//     log('   Sails.js        <|');
		//     log('   v' + sails.version + '           |');
		//     log('                \\\\____//');
		//     log('   __---___--___---___--___---___--___');
		//     log(' ____---___--___---___--___---___--___-__');
		// };


