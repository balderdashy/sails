/**
 * Module dependencies
 */
var _ = require('lodash');



/**
 * _mixinReqParamsAll
 *
 * Mixes in `req.params.all()`, a convenience method to grab all parameters,
 * whether they're in the path (req.params), query string (req.query),
 * or request body (req.body).
 * 
 * Note: this has to be applied per-route, not per request,
 * in order to refer to the proper route/path parameters
 *
 * @param {Request} req
 * @param {Response} res
 * @api private
 */

module.exports = function _mixinReqParamsAll (req, res) {

	////////////////////////////////////////////////////////////////////
	// The check below is deprecatable since action blueprints
	// will no longer automatically receive the :id? param in their route.
	// 
	// // Make sure `id` is omitted if it's undefined
	// // (since action blueprint routes name an optional :id)
	// if (typeof req.param('id') === 'undefined') {
	// 	delete req.params.id;
	// }
	//////////////////////////////////////////////////////////////////

	// Combines parameters from the query string, and encoded request body
	// to compose a monolithic object of named parameters, irrespective of source
	var queryParams = _.clone(req.query) || {};
	var bodyParams = _.clone(req.body) || {};
	var allParams = _.extend({}, queryParams, bodyParams);


	// Mixin route params 
	_.each(Object.keys(req.params), function(paramName) {
		allParams[paramName] = req.params[paramName];
	});

	// Define a new non-enuerable function: req.params.all()
	// (but only if an `:all` route parameter doesn't exist!)
	if (!req.params.all) {
		Object.defineProperty(req.params, 'all', {
			value: function getAllParams() {
				return allParams;
			}
		});
	}
};
