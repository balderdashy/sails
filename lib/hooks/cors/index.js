module.exports = function(sails) {

	/**
	 * Module dependencies.
	 */

	var _ = require('lodash'),
		expresstUtils = require('../../../node_modules/express/lib/utils.js');
		Hook = require('../../index');


	/**
	 * Expose hook definition
	 */

	return {

		initialize: function(cb) {

			// If origin is set to '', CORS is off, since it wouldn't allow connections from anywhere.
			if (sails.config.cors.origin === '') {
				return cb();
			}

			sails.on('router:before', function () {

				// Make sure there's a universal OPTIONS route that just send back a 200
				sails.router.bind('options /*', sendHeaders(null, true));

				// If we're setting CORS on all routes by default, set up a universal route for it here.
				// CORS can still be turned off for specific routes by setting "cors:false"
				if (sails.config.cors.allRoutes === true) {
					sails.router.bind('/*', sendHeaders());
				}

				// Loop through all configured routes, looking for CORS options
				_.each(sails.config.routes, function(config, path) {

					if (!_.isUndefined(config.cors)) {

						// If cors is set to "false", clear the CORS headers for this route
						if (config.cors === false) {
							sails.router.bind(path, clearHeaders);
							return;
						}

						// If cors is set to "true", and we're not doing all routes by default, set
						// the CORS headers for this route using the default origin
						else if (config.cors === true && !sails.config.cors.allRoutes) {
							sails.router.bind(path, setHeaders());
						}

						// Else if cors is set to a string, use that has the origin
						else if (typeof config.cors === "string") {
							sails.router.bind(path, setHeaders({origin:config.cors}));	
						}

						// Else if cors is an object, use that as the config
						else if (_.isPlainObject(config.cors)) {
							sails.router.bind(path, setHeaders(config.cors));		
						}

						// Otherwise throw a warning
						else {
							sails.log.warn("Invalid CORS settings for route "+path);
						}

					}

				});
				
			});

			cb();

		}

	};

	function sendHeaders(routeCorsConfig, respond) {

		if (!routeCorsConfig) {
			routeCorsConfig = {};
		}

		return function(req, res, next) {

			// If we can set headers (i.e. it's not a socket request), do so.
			if (res.setHeader) {
				res.setHeader('Access-Control-Allow-Origin', routeCorsConfig.origin || sails.config.cors.origin);
				res.setHeader('Access-Control-Allow-Credentials', routeCorsConfig.credentials || sails.config.cors.credentials);
				res.setHeader('Access-Control-Allow-Methods', routeCorsConfig.methods || sails.config.cors.methods);
				res.setHeader('Access-Control-Allow-Headers', routeCorsConfig.headers || sails.config.cors.headers);
				res.locals._csrf = null;
			}

			if (respond) {
				res.send(200);
			} else {
				next();
			}

		};

	}

	function clearHeaders(req, res, next) {

		// Replace the CSRF token if required
		if (sails.config.csrf) {
			res.locals._csrf = req.session._csrf;
		}

		// If we can set headers (i.e. it's not a socket request), do so.
		if (res.setHeader) {
			res.setHeader('Access-Control-Allow-Origin', '');
			res.setHeader('Access-Control-Allow-Credentials', '');
			res.setHeader('Access-Control-Allow-Methods', '');
			res.setHeader('Access-Control-Allow-Headers', '');
		}

		next();

	}


};