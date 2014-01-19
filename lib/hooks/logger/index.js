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
				level: 'info'

			}
		},


		configure: function() {

		},


		/**
		 * Initialize is fired when the hook is loaded,
		 * but after waiting for user config.
		 */

		initialize: function(cb) {
			
			// Get basic log functions
			var log = CaptainsLog(sails.config.log);

			// Mix in log.ship() method
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
