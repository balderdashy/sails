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

			// err.. figure this out
			// sails.after('express:ready', this.configure);
			this.configure();
			cb();
		},


		/**
		 * When the express server is ready, configure Socket.io
		 *
		 * @api public
		 */

		configure: function() {
			IO.configure();
		}
	};

};