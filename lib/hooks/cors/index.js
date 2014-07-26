module.exports = function(sails) {

	/**
	 * Module dependencies.
	 */

	var _ = require('lodash'),
		util = require('sails-util'),
		Hook = require('../../index');


	/**
	 * Expose hook definition
	 */

	return {


		defaults: {
			cors: {
				origin: '*',
				credentials: true,
				methods: 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD',
				headers: 'content-type'
			}
		},


		initialize: function(cb) {

			sails.on('router:before', function () {

				// If we're setting CORS on all routes by default, set up a universal route for it here.
				// CORS can still be turned off for specific routes by setting "cors:false"
				if (sails.config.cors.allRoutes === true) {
					sails.router.bind('/*', sendHeaders());
				}

				// Loop through all configured routes, looking for CORS options
				_.each(sails.config.routes, function(config, route) {

					if (!_.isUndefined(config.cors)) {

						// If cors is set to "false", clear the CORS headers for this route
						if (config.cors === false) {
							sails.router.bind(route, clearHeaders, null, {_middlewareType: 'CORS HOOK: clearHeaders'});
							return;
						}

						// If cors is set to "true", and we're not doing all routes by default, set
						// the CORS headers for this route using the default origin
						else if (config.cors === true) {
              if (!sails.config.cors.allRoutes) {
							 sails.router.bind(route, sendHeaders(), null);
              }
						}

						// Else if cors is set to a string, use that has the origin
						else if (typeof config.cors === "string") {
							sails.router.bind(route, sendHeaders({origin:config.cors}), null);
						}

						// Else if cors is an object, use that as the config
						else if (_.isPlainObject(config.cors)) {
							sails.router.bind(route, sendHeaders(config.cors), null);
						}

						// Otherwise throw a warning
						else {
							sails.log.warn("Invalid CORS settings for route "+route);
						}

					}

				});

				// Make sure there's a blanket OPTIONS route that actually sends a response
				// to a preflight request.  Since we'll be making sure that no request from a
        // disallowed origin actually gets processed (see below), we can just always
        // let the preflight request pass.  Preflighting is mainly for servers that
        // don't implement CORS protection themselves.
				sails.router.bind('options /*', function preflight(req, res, next) {
          res.set('Access-Control-Allow-Origin', req.headers.origin);
          req.headers['access-control-request-headers'] && res.set('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
          req.headers['access-control-request-method'] && res.set('Access-Control-Allow-Methods', req.headers['access-control-request-method']);
          res.set('Access-Control-Allow-Credentials', true);
          res.send(200);
        }, null, {_middlewareType: 'CORS HOOK: preflight'});

        // IMPORTANT--don't process requests from disallowed origins
        //
        // We can't just rely on the browser implementing "access-control-allow-origin" correctly;
        // we need to make sure that if a request is made from an origin that isn't whitelisted,
        // that we don't end up processing that request.
        sails.router.bind('/*', function(req, res, next) {

          // If it's a cross-origin request, and the access-control-allow-origin header doesn't match
          // the origin header, then we don't approve of this origin and shouldn't continue
          // with this request.
          if (!sails.util.isSameOrigin(req) && res.get('Access-Control-Allow-Origin') != req.headers.origin) {
            return res.forbidden();
          }
          return next();
        }, null, {_middlewareType: 'CORS HOOK: catchall'});

			});

			cb();

		}

	};

	function sendHeaders(routeCorsConfig) {

		if (!routeCorsConfig) {
			routeCorsConfig = {};
		}
		var _sendHeaders = function(req, res, next) {

      // If we have an origin header...
			if (req.headers && req.headers.origin) {

				// Get the allowed origins
				var origins = (routeCorsConfig.origin || sails.config.cors.origin).split(',');

				// Match the origin of the request against the allowed origins
				var foundOrigin = false;
				_.every(origins, function(origin) {

					origin = origin.trim();
					// If we find a whitelisted origin, send the Access-Control-Allow-Origin header
					// to greenlight the request.
					if (origin == req.headers.origin || origin == "*") {
						res.set('Access-Control-Allow-Origin', req.headers.origin);
						foundOrigin = true;
						return false;
					}
					return true;
				});

				if (!foundOrigin) {
          // For HTTP requests, set the Access-Control-Allow-Origin header to '', which the browser will
          // interpret as, "no way Jose."
					res.set('Access-Control-Allow-Origin', '');
				}

        // Determine whether or not to allow cookies to be passed cross-origin
				res.set('Access-Control-Allow-Credentials', !_.isUndefined(routeCorsConfig.credentials) ? routeCorsConfig.credentials : sails.config.cors.credentials);

        // Handle preflight requests
				if (req.method == "OPTIONS") {
					res.set('Access-Control-Allow-Methods', !_.isUndefined(routeCorsConfig.methods) ? routeCorsConfig.methods : sails.config.cors.methods);
					res.set('Access-Control-Allow-Headers', !_.isUndefined(routeCorsConfig.headers) ? routeCorsConfig.headers : sails.config.cors.headers);
				}

			}

			next();

		};

    _sendHeaders._middlewareType = "CORS HOOK: sendHeaders";
    return _sendHeaders;

	}

	function clearHeaders(req, res, next) {
		// If we can set headers (i.e. it's not a socket request), do so.
		if (res.set) {
			res.set('Access-Control-Allow-Origin', '');
			res.set('Access-Control-Allow-Credentials', '');
			res.set('Access-Control-Allow-Methods', '');
			res.set('Access-Control-Allow-Headers', '');
		}

		next();

	}

};
