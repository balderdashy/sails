module.exports = function(sails) {

  /**
   * Module dependencies.
   */

  var _ = require('@sailshq/lodash');
  var setHeaders = require('./set-headers');
  var setPreflightConfig = require('./set-preflight-config');
  var detectVerb = require('../../../util/detect-verb');
  var checkOriginUrl = require('../../../util/check-origin-url');
  var flaverr = require('flaverr');

  /**
   * Expose hook definition
   */

  return function initializeCors() {

    // The global values of these headers are determined by sails.config.security.cors.
    // We transform the properties here to those expected by the setHeaders function,
    // because we may at some point go back to using the Express CORS module, if
    // https://github.com/expressjs/cors/issues/90 is answered.
    var globalCorsHeaderSettings = {
      origin: sails.config.security.cors.allowOrigins,
      credentials: sails.config.security.cors.allowCredentials,
      methods: sails.config.security.cors.allowRequestMethods,
      headers: sails.config.security.cors.allowRequestHeaders,
      exposedHeaders: sails.config.security.cors.allowResponseHeaders
    };

    // If the app attempts to set `origin: '*'` and `credentials: true`, log a warning
    // and set `credentials` to `false`.
    if (globalCorsHeaderSettings.origin === '*' && globalCorsHeaderSettings.credentials === true) {
      if (sails.config.security.cors.allowAnyOriginWithCredentialsUnsafe !== true) {
        throw new Error('Invalid global CORS settings: if `allowOrigins` is \'*\', `allowCredentials` cannot also be `true` (unless you enable the `allowAnyOriginWithCredentialsUnsafe` flag).  For more info, see http://sailsjs.com/config/security.');
      }
      globalCorsHeaderSettings.origin = true;
    }

    // By default, `set-headers` returns a 204 status from OPTIONS requests, but older browsers
    // expect it to be 200 so we'll set that here.
    globalCorsHeaderSettings.optionsSuccessStatus = 200;

    // Loop through all of the explicitly-configured routes and look for fatal config issues.
    _.each(sails.config.routes, function(config, address) {

      var allowOrigins, allowCredentials;

      // If this route doesn't have a CORS config, continue.
      if (!_.isPlainObject(config.cors)) { return; }

      // Use the custom CORS config values for allowOrigins and allowCredentials,
      // or default to the global settings.
      allowOrigins = config.cors.allowOrigins || globalCorsHeaderSettings.origin;
      allowCredentials = config.cors.allowCredentials || globalCorsHeaderSettings.credentials;

      // Bail if `allowOrigins` is `*`, `allowCredentials` is `true` and `allowAnyOriginWithCredentialsUnsafe` is not true.
      if (allowOrigins === '*' && allowCredentials === true && config.cors.allowAnyOriginWithCredentialsUnsafe !== true) {
        throw flaverr('E_UNSAFE', new Error('Route `' + address + '` has invalid CORS settings: if `allowOrigins` is \'*\', `credentials` cannot be `true` unless `allowAnyOriginWithCredentialsUnsafe` is also true.'));
      }

      // Split up non-* strings into an array.
      // We'll complain about this later when we actually act on the route's CORS config
      // rather than just validating it.
      if (_.isString(config.cors.allowOrigins) && config.cors.allowOrigins !== '*') {
        allowOrigins = _.map(config.cors.allowOrigins.split(','), function(origin){ return origin.trim(); });
      }
      // If `allowOrigins` is not `*` and not an array at this point, bail.
      else if (config.cors.allowOrigins && config.cors.allowOrigins !== '*' && !_.isArray(config.cors.allowOrigins)) {
        throw flaverr('E_BAD_ORIGIN_CONFIG', new Error('Route `' + address + '` has invalid CORS settings: if `allowOrigins` is specified, it must be \'*\' or an array of strings.'));
      }

      // If `allowOrigins` is an array, loop through and validate each origin.
      if (_.isArray(allowOrigins)) {
        try {
          _.each(allowOrigins, function(origin) {
            checkOriginUrl(origin);
          });
        }
        // If an error occurred validating an origin, forward it up the chain.
        catch (e) {
          // If it's an actual origin validation error, gussy it up first.
          if (e.code === 'E_INVALID') {
            throw flaverr('E_INVALID_ORIGIN', new Error('Route `' + address + '` has invalid CORS `allowOrigins` setting: ' + e.message));
          }
          // Otherwise just throw whatever error we got.
          throw e;
        }
      }

    });

    // Once it's time to bind shadow routes, get to bindin'.
    sails.on('router:before', function () {
      // (FUTURE: consider changing this ^^ to `sails.after()` for consistency)

      // If we're setting CORS on all routes by default, set up a universal route for it here.
      // CORS can still be turned off for specific routes by setting `cors:false`
      if (sails.config.security.cors.allRoutes === true) {
        sails.router.bind('/*', setHeaders(globalCorsHeaderSettings), 'all', {_middlewareType: 'CORS HOOK: sendHeaders'});
      }
      // Otherwise, default to blocking all cross-origin requests.
      else {
        sails.router.bind('/*', setHeaders({origin: false}), null, {_middlewareType: 'CORS HOOK: clearHeaders'});
      }

      // Declare a var to hold the various CORS settings for preflight OPTIONS routes, which we'll build up
      // as we look at the route configs below.
      var optionsRouteConfigs = {};

      // Loop through all configured routes, looking for CORS options
      _.each(sails.config.routes, function(config, route) {

        // Get some info about the route, like its path and verb.
        var routeInfo = detectVerb(route);
        var path = routeInfo.original.toLowerCase();
        var verb = routeInfo.verb.toLowerCase();

        // If this route doesn't have its own CORS config, move on.
        if (_.isUndefined(config.cors)) { return; }

        optionsRouteConfigs[path] = optionsRouteConfigs[path] || {};

        // If cors is set to `true`, and we're not doing all routes by default, set
        // the CORS headers for this route using the default origin
        if (config.cors === true) {
          if (!sails.config.security.cors.allRoutes) {
            // Use the default CORS config for this path on an OPTIONS request
            optionsRouteConfigs[path][verb || 'default'] = sails.config.security.cors;
            sails.router.bind(route, setHeaders(globalCorsHeaderSettings), null, {_middlewareType: 'CORS HOOK: setHeaders'});
          }
        }

        // If cors is set to `false`, clear the CORS headers for this route
        else if (config.cors === false) {
          // Clear headers on an OPTIONS request for this path
          optionsRouteConfigs[path][verb || 'default'] = 'clear';
          sails.router.bind(route, setHeaders({origin: false}), 'all', {_middlewareType: 'CORS HOOK: clearHeaders'});
          return;
        }


        // Else if cors is set to a string, use that has the origin
        else if (typeof config.cors === 'string') {
          optionsRouteConfigs[path][verb || 'default'] = _.extend({origin: config.cors});
          sails.router.bind(route, setHeaders(_.extend({}, globalCorsHeaderSettings, {origin:config.cors, methods: verb})), null, {_middlewareType: 'CORS HOOK: setHeaders'});
        }

        // Else if cors is an object, use that as the config
        else if (_.isPlainObject(config.cors)) {

          // Get CORS header settings for this route, using the global settings as defaults,
          // and transform the properties into those expected by the setHeaders function.
          var routeCorsHeaderSettings = _.defaults({
            origin: config.cors.allowOrigins,
            credentials: config.cors.allowCredentials,
            methods: config.cors.allowRequestMethods,
            headers: config.cors.allowRequestHeaders,
            exposedHeaders: config.cors.allowResponseHeaders
          }, globalCorsHeaderSettings);

          // Deprecate `origin` in favor of `allowOrigins`.
          if (config.cors.origin) {
            sails.log.error('The `cors.origin` config has been deprecated.');
            sails.log.error('Please use `cors.allowOrigins` instead.\n');
            if (!config.cors.allowOrigins) {
              routeCorsHeaderSettings.origin = config.cors.origin;
            }
          }

          // Deprecate declaring `allowOrigins` as a string (except for '*').
          if (_.isString(routeCorsHeaderSettings.origin) && routeCorsHeaderSettings.origin !== '*') {
            sails.log.warn('In route `' + ((verb ? (verb + ' ') : '') + path) + '`: ');
            sails.log.warn('When specifying multiple origins, the `cors.allowOrigins` route setting');
            sails.log.warn('should be an array of strings. We\'ll split it up for you this time...\n');
            routeCorsHeaderSettings.origin = _.map(routeCorsHeaderSettings.origin.split(','), function(origin){ return origin.trim(); });
          }

          if (routeCorsHeaderSettings.origin !== '*') {
            _.each(routeCorsHeaderSettings.origin, function(origin) {
              try {
                checkOriginUrl(origin);
              } catch (e) {
                if (e.code === 'E_INVALID') {
                  throw new Error('Route `' + (verb ? (verb + ' ') : '') + path + '` has invalid CORS setting for `allowOrigins`: ' + e.message);
                } else {
                  throw e;
                }
              }
            });
          }


          // Deprecate `headers` in favor of `allowRequestHeaders`.
          if (config.cors.headers) {
            sails.log.error('The `cors.headers` config has been deprecated.');
            sails.log.error('Please use `cors.allowRequestHeaders` instead.\n');
            if (!config.cors.allowRequestHeaders) {
              routeCorsHeaderSettings.headers = config.cors.headers;
            }
          }

          // Deprecate `methods` in favor of `allowRequestMethods`.
          if (config.cors.methods) {
            sails.log.error('The `cors.methods` config has been deprecated.');
            sails.log.error('Please use `cors.allowRequestMethods` instead.\n');
            if (!config.cors.allowRequestMethods) {
              routeCorsHeaderSettings.methods = config.cors.methods;
            }
          }

          // Deprecate `exposeHeaders` in favor of `allowResponseHeaders`.
          if (config.cors.exposeHeaders) {
            sails.log.error('The `cors.headers` config has been deprecated.');
            sails.log.error('Please use `cors.allowResponseHeaders` instead.\n');
            if (!config.cors.allowResponseHeaders) {
              routeCorsHeaderSettings.exposedHeaders = config.cors.exposeHeaders;
            }
          }

          // Deprecate `credentials` in favor of `allowCredentials`.
          if (config.cors.credentials) {
            sails.log.error('The `cors.credentials` config has been deprecated.');
            sails.log.error('Please use `cors.allowCredentials` instead.\n');
            if (!config.cors.allowCredentials) {
              routeCorsHeaderSettings.credentials = config.cors.credentials;
            }
          }

          // Don't allow origin '*' and credentials `true` without allowAnyOriginWithCredentialsUnsafe `true`.
          if (routeCorsHeaderSettings.origin === '*' && routeCorsHeaderSettings.credentials === true) {
            if (config.cors.allowAnyOriginWithCredentialsUnsafe !== true) {
              throw new Error('Route `' + (verb ? (verb + ' ') : '') + path + '` has invalid CORS settings: if `allowOrigins` is \'*\', `credentials` cannot be `true` unless `allowAnyOriginWithCredentialsUnsafe` is also true.');
            }
            routeCorsHeaderSettings.origin = true;
          }

          // If the route has a verb, it shouldn't have a `methods` CORS setting
          if (routeInfo.verb && config.cors.methods) {
            sails.log.warn('Ignoring `methods` CORS setting for route `'+route+'`');
            sails.log.warn('because it has a verb specified.\n');
            routeCorsHeaderSettings.methods = verb;
          }

          // Set configuration for the preflight OPTIONS request for this route.
          optionsRouteConfigs[path][verb || 'default'] = routeCorsHeaderSettings;

          // Bind a route that will set CORS headers for this url/path combo.
          sails.router.bind(route, setHeaders(_.extend({}, globalCorsHeaderSettings, routeCorsHeaderSettings)), null, {_middlewareType: 'CORS HOOK: setHeaders'});
        }

        // Otherwise we don't recognize the CORS config, so throw a warning
        else {
          sails.log.warn('Invalid CORS settings for route '+route);
        }

      });

      // Now that we have a list of all of the routes that (possibly) need to be preflighted,
      // construct a route that will handle OPTIONS requests for all of those routes.
      sails.router.bind('options /*', setHeaders(setPreflightConfig(optionsRouteConfigs, globalCorsHeaderSettings)), 'options', {_middlewareType: 'CORS HOOK: preflight'});

    });


    // Continue loading this Sails app.
    return;

  };


};
