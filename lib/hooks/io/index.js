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
			sails.on('express:ready', this.configure);
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