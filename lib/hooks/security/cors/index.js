module.exports = function(sails) {

  /**
   * Module dependencies.
   */

  var _ = require('lodash');
  var setHeaders = require('./set-headers');
  var setPreflightConfig = require('./set-preflight-config');


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
    if (sails.config.security.cors.allRoutes === true && globalCorsHeaderSettings.origin === '*' && globalCorsHeaderSettings.credentials === true) {
      if (sails.config.security.cors.allowAnyOriginWithCredentialsUnsafe !== true) {
        throw new Error('Invalid global CORS settings: if `allowOrigins` is \'*\', `credentials` cannot be `true` unless `allowAnyOriginWithCredentialsUnsafe` is also true.');
      }
      globalCorsHeaderSettings.origin = true;
    }

    // By default, `set-headers` returns a 204 status from OPTIONS requests, but older browsers
    // expect it to be 200 so we'll set that here.
    globalCorsHeaderSettings.optionsSuccessStatus = 200;

    // Once it's time to bind shadow routes, get to bindin'.
    sails.on('router:before', function () {
      // (TODO: consider changing this ^^ to `sails.after()` for consistency)

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
        var routeInfo = sails.util.detectVerb(route);
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
            sails.log.error('`cors.origin` configuration is deprecated; please use `cors.allowOrigins` instead.');
            if (!config.cors.allowOrigins) {
              routeCorsHeaderSettings.origin = config.cors.origin;
            }
          }

          // Deprecate `headers` in favor of `allowRequestHeaders`.
          if (config.cors.headers) {
            sails.log.error('`cors.headers` configuration is deprecated; please use `cors.allowRequestHeaders` instead.');
            if (!config.cors.allowRequestHeaders) {
              routeCorsHeaderSettings.headers = config.cors.headers;
            }
          }

          // Deprecate `methods` in favor of `allowRequestMethods`.
          if (config.cors.methods) {
            sails.log.error('`cors.methods` configuration is deprecated; please use `cors.allowRequestMethods` instead.');
            if (!config.cors.allowRequestMethods) {
              routeCorsHeaderSettings.methods = config.cors.methods;
            }
          }

          // Deprecate `exposeHeaders` in favor of `allowResponseHeaders`.
          if (config.cors.exposeHeaders) {
            sails.log.error('`cors.headers` configuration is deprecated; please use `cors.allowResponseHeaders` instead.');
            if (!config.cors.allowResponseHeaders) {
              routeCorsHeaderSettings.exposedHeaders = config.cors.exposeHeaders;
            }
          }

          // Deprecate `credentials` in favor of `allowCredentials`.
          if (config.cors.credentials) {
            sails.log.error('`cors.credentials` configuration is deprecated; please use `cors.allowCredentials` instead.');
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
            sails.log.warn('Ignoring `methods` CORS setting for route '+route+' because it has a verb specified.');
            routeCorsHeaderSettings.methods = verb;
          }

          // If the origin is a string, turn it into an array by splitting on `,`.
          // This is important to do even when the origin is a single domain, because the
          // default behavior of the `cors` module in that situation is to expose the
          // configured origin, which is weird (the exception is when origin is '*').
          if (_.isString(routeCorsHeaderSettings.origin) && routeCorsHeaderSettings.origin !== '*') {
            routeCorsHeaderSettings.origin = _.map(routeCorsHeaderSettings.origin.split(','), function(origin){ return origin.trim(); });
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
