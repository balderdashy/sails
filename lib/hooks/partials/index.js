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

			// If `views` and `http` hook is not enabled, complain and respond w/ error
			if (!sails.config.hooks.http || !sails.config.hooks.views) {
				return cb(new Error('Cannot use `partials` hook without `http` and `views` enabled!'));
			}

			// Use ejs-locals for all ejs templates
			if (sails.config.views.engine === 'ejs') {
				sails.express.app.engine('ejs', engine);
			}


			cb();
		},

		// Always ready-- doesn't need to bind any routes
		ready: true
	};

};