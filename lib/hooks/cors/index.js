module.exports = function(sails) {

	/**
	 * Module dependencies.
	 */

	var _ = require('lodash'),
		util = require('sails-util');

	/**
	 * Expose hook definition
	 */

	return {

    SECURITY_LEVEL_NORMAL: 0,
    SECURITY_LEVEL_HIGH: 1,
    SECURITY_LEVEL_VERYHIGH: 2,

		defaults: {
			cors: {
				origin: '*',
				credentials: true,
				methods: 'GET, POST, PUT, DELETE, OPTIONS, HEAD',
				headers: 'content-type',
        securityLevel: 0,
			}
		},


		initialize: function(cb) {

			sails.on('router:before', function () {

				// If we're setting CORS on all routes by default, set up a universal route for it here.
				// CORS can still be turned off for specific routes by setting "cors:false"
				if (sails.config.cors.allRoutes === true) {
          sails.router.bind('/*', sendHeaders(), 'all', {_middlewareType: 'CORS HOOK: sendHeaders'});
				}
        // Otherwise clear all the headers by default
        else {
          sails.router.bind('/*', clearHeaders, 'all', {_middlewareType: 'CORS HOOK: clearHeaders'});
        }

        var optionsRouteConfigs = {};

				// Loop through all configured routes, looking for CORS options
				_.each(sails.config.routes, function(config, route) {

          var routeInfo = sails.util.detectVerb(route);
          var path = routeInfo.original.toLowerCase();
          var verb = routeInfo.verb.toLowerCase();

					if (!_.isUndefined(config.cors)) {

            optionsRouteConfigs[path] = optionsRouteConfigs[path] || {"default": sails.config.cors};

						// If cors is set to "true", and we're not doing all routes by default, set
						// the CORS headers for this route using the default origin
						if (config.cors === true) {
              // Use the default CORS config for this path on an OPTIONS request
              optionsRouteConfigs[path][verb || "default"] = sails.config.cors;
              if (!sails.config.cors.allRoutes) {
							 sails.router.bind(route, sendHeaders(), null);
              }
						}

            // If cors is set to "false", clear the CORS headers for this route
            else if (config.cors === false) {
              // Clear headers on an OPTIONS request for this path
              optionsRouteConfigs[path][verb || "default"] = "clear";
              sails.router.bind(route, clearHeaders, null, {_middlewareType: 'CORS HOOK: clearHeaders'});
              return;
            }


						// Else if cors is set to a string, use that has the origin
						else if (typeof config.cors === "string") {
              optionsRouteConfigs[path][verb || "default"] = _.extend({origin: config.cors},{methods: verb});
							sails.router.bind(route, sendHeaders({origin:config.cors}), null);
						}

						// Else if cors is an object, use that as the config
						else if (_.isPlainObject(config.cors)) {
              // If the route has a verb, it shouldn't have a "methods" CORS setting
              if (routeInfo.verb && config.cors.methods) {
                sails.log.warn("Ignoring 'methods' CORS setting for route "+route+" because it has a verb specified.");
                config.cors.methods = verb;
              }
              optionsRouteConfigs[path][verb || "default"] = config.cors;
							sails.router.bind(route, sendHeaders(config.cors), null);
						}

						// Otherwise throw a warning
						else {
							sails.log.warn("Invalid CORS settings for route "+route);
						}

					}

				});

        _.each(optionsRouteConfigs, function(config, path) {
          sails.router.bind("options "+path, sendHeaders(config, true), null, {_middlewareType: 'CORS HOOK: preflight'});
        });

        // IF SECURITY_LEVEL > "normal"--don't process requests from disallowed origins
        //
        // We can't just rely on the browser implementing "access-control-allow-origin" correctly;
        // we need to make sure that if a request is made from an origin that isn't whitelisted,
        // that we don't end up processing that request.
        if (sails.config.cors.securityLevel > sails.hooks.cors.SECURITY_LEVEL_NORMAL) {
          sails.router.bind('/*', function(req, res, next) {

            // If it's a cross-origin request, and the access-control-allow-origin header doesn't match
            // the origin header, then we don't approve of this origin and shouldn't continue
            // with this request.
            if (!sails.util.isSameOrigin(req, sails.config.cors.securityLevel == sails.hooks.cors.SECURITY_LEVEL_VERYHIGH) && res.get('Access-Control-Allow-Origin') != req.headers.origin) {
              return res.forbidden();
            }
            return next();
          }, null, {_middlewareType: 'CORS HOOK: catchall'});
        }

			});

			cb();

		}

	};

	function sendHeaders(_routeCorsConfig, isOptionsRoute) {

		if (!_routeCorsConfig) {
			_routeCorsConfig = {};
		}
		var _sendHeaders = function(req, res, next) {
      var routeCorsConfig;
      // If this is an options route handler, pull the config to use based on the method
      // that would be used in the follow-on request
      if (isOptionsRoute) {
        var method = (req.headers['access-control-request-method'] || '').toLowerCase() || "default";
        routeCorsConfig = _routeCorsConfig[method];
        if (routeCorsConfig == 'clear') {
          return clearHeaders(req, res, next);
        }
      }
      // Otherwise just use the config that was passed down
      else {
        routeCorsConfig = _routeCorsConfig;
      }
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
