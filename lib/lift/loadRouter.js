module.exports = function (sails) {


	/**
	 * Module dependencies.
	 */

	var _				= require('lodash'),
	async				= require('async'),
	Router				= require('../router')(sails);



	/**
	 * Expose a new Router
	 * 
	 * Link Express HTTP requests to a function which handles them
	 *
	 * @api public
	 */

	return function (cb) {

		sails.log.verbose('Loading router...');

		// Instantiate router for the first time
		sails.router = new Router();

		// Wipe any existing routes and bind them anew
		sails.router.flush();

		cb();
	};

};