module.exports = function(sails) {

	/**
	 * Module dependencies.
	 */

	var _ = require('lodash'),
		util = require('../../util'),
		Hook = require('../../index');


	/**
	 * Expose hook definition
	 */

	return {

		routes: {

			before: {
				'/*': function(req, res, next) {

					if (sails.config.csrf && (!req.headers.origin || util.isSameOrigin(req))) {
						var connect = require('express/node_modules/connect');

						return connect.csrf()(req, res, function (err) {
							res.locals._csrf = req.csrfToken();
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