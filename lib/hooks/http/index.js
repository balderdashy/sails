module.exports = function(sails) {

	////////////////////////////////////////////////////////////////////////////////
	//
	// NOTE:	Not in use yet!!!!
	//
	//			Subsequent 0.9.x release will bundle Express in the http hook.
	//			For now, Express is still tightly linked to the core.
	//
	////////////////////////////////////////////////////////////////////////////////


	/**
	 * Module dependencies.
	 */

	var _			= require('lodash');



	/**
	 * Expose `http` hook definition
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