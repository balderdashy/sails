module.exports = function(sails) {

	/**
	 * Module dependencies.
	 */

	var _ = require('lodash'),
		Hook = require('../../index');


	/**
	 * Expose hook definition
	 */

	return {

		routes: {

			before: {
				'/*': function(req, res, next) {
					
					if (sails.config.csrf) {
						var connect = require('express/node_modules/connect');

						return connect.csrf()(req, res, function (err) {
							res.locals._csrf = req.session._csrf;
							next(err);
						});
					}
          
					// Always ok
					res.locals._csrf = null;
					
					next();
				}
			},

			after: {
				'get /csrfToken': function(req, res) {
					return res.json({
						_csrf: res.locals._csrf
					});
				}
			}
		}

	};
};