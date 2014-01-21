/**
 * Module dependencies
 */
var _ = require('lodash'),
	util = require('sails-util');


/**
 * default locals
 *
 * Always share some basic metadata with views.
 * Roughly analogous to `app.locals` in Express.
 * 
 * > Application local variables are provided to all templates rendered
 * > within the application. This is useful for providing helper functions
 * > to templates, as well as app-level data.
 * >
 * > http://expressjs.com/api.html#app.locals
 * 
 * @param {Request} req
 * @param {Response} res
 * @api private
 */

module.exports = function _mixinLocals(req, res) {

	// TODO: actually use app.locals for this logic

	_.extend(res.locals, {
		_: _,
		util: util,
		session: req.session,
		req: req,
		res: res,
		sails: req._sails
	});

	// May be deprecated in an upcoming release:
	res.locals.title = req._sails.config.appName;
	if (req.options.action) {
		' | ' + util.str.capitalize(req.param('action'));
	}
};
