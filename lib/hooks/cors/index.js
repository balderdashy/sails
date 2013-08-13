module.exports = function(sails) {

	/**
	 * Module dependencies.
	 */

	var _ = require('lodash'),
		expressUtils = require('../../../node_modules/express/lib/utils.js');
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

				// Make sure there's a universal OPTIONS route that just sends back a 200
				// (this comes up for Safari)
				sails.router.bind('options /*', function handleOptionsRequest (req, res, next) {
					setHeaders(req, res, function setCorsHeaders (err) {
						if (err) return next (err);
						res.send(200);
					});
				});

				// If we're setting CORS on all routes by default, set up a universal route for it here.
				// CORS can still be turned off for specific routes by setting 'cors:false'
				sails.router.bind(sails.config.cors.mountPath, setHeaders());

				// Loop through all configured routes, looking for CORS options
				_.each(sails.config.routes, function(routeConfig, path) {

					if (!_.isUndefined(routeConfig.cors)) {

						// Get regexp for matching routes to mount path
						var matchExpression = expressUtils.pathRegexp(
							sails.routeConfig.cors.mountPath.split(' ').reverse()[0], []
						);

						// If route CORS config is set to 'false',
						// clear any CORS headers from the response
						if (routeConfig.cors === false) {
							sails.router.bind(path, clearHeaders);
							return;
						}

						// If cors is set to 'true', and we're not doing the global CORS mount path,
						// set the CORS headers for this route using the default origin
						else if (routeConfig.cors === true && !sails.routeConfig.cors.mountPath) {
							sails.router.bind(path, setHeaders());
						}

						// Else if cors is set to a string, use that as the origin
						else if (typeof routeConfig.cors === 'string') {
							sails.router.bind(path, setHeaders({
								origin: routeConfig.cors
							}));
						}

						// Else if cors is an object, use that as the config
						else if (_.isPlainObject(routeConfig.cors)) {
							sails.router.bind(path, setHeaders(routeConfig.cors));		
						}

						// Otherwise throw a warning
						else {
							sails.log.warn('Invalid `cors` setting for route :: ' + path);
						}

					}

				});
				
			});

			cb();

		}

	};


	/**
	 * @param {Object} cors -> option overrides
	 * @returns express middleware which returns to client
	 */

	function setHeaders (cors) {

		// Sanitize local `cors` config
		if (!cors) {
			cors = {};
		}

		return function corsMiddleware (req, res, next) {

			// If we can set headers (i.e. it's not a socket request), do so.
			if (res.setHeader) {
				res.setHeader('Access-Control-Allow-Origin', cors.origin || sails.config.cors.origin);
				res.setHeader('Access-Control-Allow-Credentials', cors.credentials || sails.config.cors.credentials);
				res.setHeader('Access-Control-Allow-Methods', cors.methods || sails.config.cors.methods);
				res.setHeader('Access-Control-Allow-Headers', cors.headers || sails.config.cors.headers);
				res.locals._csrf = null;
			}

			return next();
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