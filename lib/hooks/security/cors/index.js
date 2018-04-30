module.exports = function(sails) {

  /**
   * Module dependencies.
   */

  var _ = require('@sailshq/lodash');
  var setHeaders = require('./set-headers');
  var setPreflightConfig = require('./set-preflight-config');
  var detectVerb = require('../../../util/detect-verb');

  /**
   * Expose hook definition
   */

  return function initializeCors() {

    // Once it's time to bind shadow routes, get to bindin'.
    sails.on('router:before', function () {
      // (FUTURE: consider changing this ^^ to `sails.after()` for consistency)

      // If we're setting CORS on all routes by default, set up a universal route for it here.
      // CORS can still be turned off for specific routes by setting `cors:false`
      if (sails.config.security.cors.allRoutes === true) {
        sails.router.bind('/*', setHeaders(sails.config.security.cors), 'all', {_middlewareType: 'CORS HOOK: sendHeaders'});
      }
      // Otherwise, default to blocking all cross-origin requests.
      else {
        sails.router.bind('/*', setHeaders({allowOrigins: false}), null, {_middlewareType: 'CORS HOOK: clearHeaders'});
      }

      // Declare a var to hold the various CORS settings for preflight OPTIONS routes, which we'll build up
      // as we look at the route configs below.
      var optionsRouteConfigs = {};

      // Loop through all configured routes, looking for CORS options
      _.each(sails.router.explicitRoutes, function(routeConfig, route) {

        // Get some info about the route, like its path and verb.
        var routeInfo = detectVerb(route);
        var path = routeInfo.original.toLowerCase();
        var verb = routeInfo.verb.toLowerCase();

        // Get a handle to the route CORS config.
        var routeCorsConfig = routeConfig.cors;

        // If this route doesn't have its own CORS config, move on.
        if (_.isUndefined(routeCorsConfig)) { return; }

        // If this route is pointing to the CSRF token route, log a warning.
        if (routeCorsConfig !== false && routeConfig.action === 'security/grant-csrf-token') {
          sails.log.verbose('The `grant-csrf-token` action is not supported for cross-origin requests in situations/browsers where 3rd party cookies are blocked.');
          sails.log.verbose('(You are seeing this message because the route `' + verb + ' ' + path + '` has CORS settings configured.)');
        }

        optionsRouteConfigs[path] = optionsRouteConfigs[path] || {};

        // If cors is set to `true`, and we're not doing all routes by default, set
        // the CORS headers for this route using the default origin
        if (routeCorsConfig === true) {
          if (!sails.config.security.cors.allRoutes) {
            // Use the default CORS config for this path on an OPTIONS request
            optionsRouteConfigs[path][verb || 'default'] = sails.config.security.cors;
            sails.router.bind(route, setHeaders(sails.config.security.cors), null, {_middlewareType: 'CORS HOOK: setHeaders'});
          }
        }

        // If cors is set to `false`, clear the CORS headers for this route
        else if (routeCorsConfig === false) {
          // Clear headers on an OPTIONS request for this path
          optionsRouteConfigs[path][verb || 'default'] = 'clear';
          sails.router.bind(route, setHeaders({allowOrigins: false}), 'all', {_middlewareType: 'CORS HOOK: clearHeaders'});
          return;
        }


        // Else if cors is set to a string, use that has the origin
        else if (typeof routeCorsConfig === 'string') {
          optionsRouteConfigs[path][verb || 'default'] = _.extend({allowOrigins: [routeCorsConfig]});
          sails.router.bind(route, setHeaders(_.extend({}, sails.config.security.cors, {allowOrigins: [routeCorsConfig], methods: verb})), null, {_middlewareType: 'CORS HOOK: setHeaders'});
        }

        // Else if cors is an object, use that as the config
        else if (_.isPlainObject(routeCorsConfig)) {

          // Set configuration for the preflight OPTIONS request for this route.
          optionsRouteConfigs[path][verb || 'default'] = routeCorsConfig;

          // Bind a route that will set CORS headers for this url/path combo.
          sails.router.bind(route, setHeaders(_.extend({}, routeCorsConfig)), null, {_middlewareType: 'CORS HOOK: setHeaders'});
        }

        // Otherwise we don't recognize the CORS config, so throw a warning
        else {
          sails.log.warn('Invalid CORS settings for route '+route);
        }

      });

      // Now that we have `optionsRouteConfigs`, a list of all of the routes that (possibly) need
      // to be preflighted, construct a route that will handle OPTIONS requests for all of those routes.
      // Sending the result of `setPreflightConfig` (a function) into `setHeaders` will cause `setHeaders`
      // to run the function in order to determine the CORS options to use.
      sails.router.bind('options /*', setHeaders(setPreflightConfig(optionsRouteConfigs, sails.config.security.cors)), 'options', {_middlewareType: 'CORS HOOK: preflight'});

    });


    // Continue loading this Sails app.
    return;

  };


};
