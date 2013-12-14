module.exports = function(sails) {

	/**
	 * Module dependencies.
	 */

	var _			= require('lodash'),
		util		= require('sails-util'),
		CaptainsLog = require('captains-log'),
		buildShipFn	= require('./ship');



	/**
	 * Expose `logger` hook definition
	 */

	return {


		defaults: {
			log: {
				level: 'info',
				maxSize: 10000000,
				maxFiles: 10,
				json: false,
				colorize: true,
				consoleLevel: 'undefined',
				fileLevel: 'undefined'
			}
		},


		configure: function() {

		},


		/**
		 * Initialize is fired when the hook is loaded,
		 * but after waiting for user config.
		 *
		 * @api public
		 */

		initialize: function(cb) {
			
			// Get basic log functions
			var log = new CaptainsLog(sails.config.log);

			// Mix-in some ASCII art
			log.ship = buildShipFn(
				sails.version ?
					('v' + sails.version) :
					'',
				log.info );

			// Expose log on sails object
			sails.log = log;
			cb();
		}
	};
};
