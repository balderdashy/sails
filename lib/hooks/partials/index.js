module.exports = function(sails) {


	/**
	 * Module dependencies.
	 */

	var _			= require('lodash'),
		partials	= require('express-partials');



	/**
	 * Expose `Controller` hook definition
	 */

	return {

		routes: {
			before: {

				// Use express partials middleware
				'/*': partials()
			}
		},


		/**
		 * Initialize is fired first thing when the hook is loaded
		 *
		 * @api public
		 */

		initialize: function(cb) {

			// If express hook is not enabled, complain and respond w/ error
			if (!sails.config.hooks.express) {
				return cb(new Error('Cannot use `partials` hook without Express!'));
			}
		}
	};

};