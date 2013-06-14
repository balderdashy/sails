module.exports = function (sails) {

	/**
	 * Module dependencies.
	 */

	var _ = require('lodash'),
		async = require('async'),
		util = require('../../util');


	/**
	 * CRUD find() blueprint
	 *
	 * @api private
	 */

	return function create (req, res, next) {
		res.send('create');
	};

};
