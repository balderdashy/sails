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

	var _			= require('lodash'),
		load		= require('./load')(sails);



	/**
	 * Expose `http` hook definition
	 */

	return {


		/**
		 * Initialize is fired first thing when the hook is loaded
		 * but after waiting for user config (if applicable)
		 *
		 * @api public
		 */

		initialize: function(cb) {
			return load(cb);
		}
	};

};