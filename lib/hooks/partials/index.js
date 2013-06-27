module.exports = function(sails) {


	/**
	 * Module dependencies.
	 */

	var _			= require('lodash'),
		engine		= require('ejs-locals');



	/**
	 * Expose `Controller` hook definition
	 */

	return {


		/**
		 * Initialize is fired first thing when the hook is loaded
		 *
		 * @api public
		 */

		initialize: function(cb) {

			// Use ejs-locals for all ejs templates
			sails.express.app.engine('ejs', engine);


			// If express hook is not enabled, complain and respond w/ error
			if (!sails.config.hooks.express) {
				return cb(new Error('Cannot use `partials` hook without Express!'));
			}

			cb();
		}
	};

};