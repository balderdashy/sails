module.exports = function(sails) {


	/**
	 * Module dependencies.
	 */

	var _			= require('lodash');



	/**
	 * Expose `Controller` hook definition
	 */

	return {


		// TODO: Pull Express configuration into this hook

		routes: {},


		/**
		 * Initialize is fired first thing when the hook is loaded
		 *
		 * @api public
		 */

		initialize: function(cb) {
			cb();
		}
	};

};