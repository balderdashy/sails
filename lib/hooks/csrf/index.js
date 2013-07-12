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
						var connect = connect = require('express/node_modules/connect');
						return connect.csrf()(req, res, function() {
							res.locals._csrf = req.session._csrf;
							next();
						});
					}

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
		},

		// Always ready-- doesn't need to do anything asynchronous
		ready: true

	};
};