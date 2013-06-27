module.exports = function(sails) {


	/**
	 * Module dependencies.
	 */

	var _ = require('lodash'),
		async = require('async'),
		IO = {
			configure: require('./configure')(sails)
		};



	/**
	 * Expose `Controller` hook definition
	 */

	return {

		routes: {
			after: {}
		},


		/**
		 * Initialize is fired first thing when the hook is loaded
		 *
		 * @api public
		 */

		initialize: function(cb) {

			if (sails.config.hooks.express) {

				// TODO: if express hook is enabled, wait until the http server is configured
				// this.configure(cb);
				
				// TODO: After http server starts, start socket.io
				
			}
			else {

				// If not, configure immediately
				this.configure(cb);

				// TODO: Start socket.io solo as soon as sails is ready
			}

		},


		/**
		 * Configure Socket.io
		 *
		 * @api public
		 */

		configure: function(cb) {
			IO.configure(cb);
		}
	};

};