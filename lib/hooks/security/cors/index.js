module.exports = function(sails) {

  /**
   * Module dependencies.
   */

  var _ = require('@sailshq/lodash');
  var setHeaders = require('./set-headers');
  var setPreflightConfig = require('./set-preflight-config');
  var detectVerb = require('../../../util/detect-verb');
  var flaverr = require('flaverr');
  var pathToRegexp = require('path-to-regexp');

  /**
   * Expose hook definition
   */

  return function initializeCors() {

    // Regex to check if the route is...a regex.
    var regExRoute = /^r\|(.*)\|(.*)$/;

    var configuredRoutes = [];

    // Declare a var to hold the various CORS settings for preflight OPTIONS routes, which we'll build up
    // as we look at the route configs below.
    var optionsRouteConfigs = [];

    // Whenever a route is bound, see if it has CORS settings attached, and if so, add it to the list
    // of `configuredRoutes` that we'll search through in the CORS-header-sending route that we'll
    // bind later.
    sails.on('router:bind', checkForCorsConfig);
    // sails.on('route:typeUnknown', checkForCorsConfig);
    sails.on('router:typeUnknown', checkForCorsConfig);

    function checkForCorsConfig(routeDef) {

      // Get some info about the route, like its path and verb.
      var path = routeDef.path;
      var verb = (routeDef.verb || 'all').toLowerCase();

      var routeCorsConfig = !_.isUndefined(routeDef.options.cors) ? routeDef.options.cors : routeDef.target.cors;
      var headersFn;
      if (_.isUndefined(routeCorsConfig)) {
        return;
      }

      var pathRegex;
      var matches = path.match(regExRoute);

      // If it *is* a regex, create a RegExp object that Express can bind,
      // pull out the params, and wrap the handler in regexRouteWrapper
      if (matches) {
        pathRegex = new RegExp(matches[1]);
      } else {
        pathRegex = pathToRegexp(path);
      }

      // If cors is set to `true`, and we're not doing all routes by default, set
      // the CORS headers for this route using the default origin
      if (routeCorsConfig === true) {
        // Use the default CORS config for this path on an OPTIONS request
        optionsRouteConfigs.push({
          pathRegex: pathRegex,
          verb: verb,
          config: sails.config.security.cors
        });
        if (sails.config.security.cors.allRoutes) {
          return;
        }
        headersFn = setHeaders(sails.config.security.cors);
      }

      // If cors is set to `false`, clear the CORS headers for this route
      else if (routeCorsConfig === false) {
        // Clear headers on an OPTIONS request for this path
        optionsRouteConfigs.push({
          pathRegex: pathRegex,
          verb: verb,
          config: 'clear'
        });
        headersFn = setHeaders({allowOrigins: false});
      }


      // Else if cors is set to a string, use that has the origin
      else if (typeof routeCorsConfig === 'string') {
        optionsRouteConfigs.push({
          pathRegex: pathRegex,
          verb: verb,
          config: _.extend({allowOrigins: [routeCorsConfig]})
        });
        headersFn = setHeaders(_.extend({}, sails.config.security.cors, {allowOrigins: [routeCorsConfig], methods: verb}));
      }

      // Else if cors is an object, use that as the config
      else if (_.isPlainObject(routeCorsConfig)) {

        // Set configuration for the preflight OPTIONS request for this route.
        optionsRouteConfigs.push({
          pathRegex: pathRegex,
          verb: verb,
          config: routeCorsConfig
        });

        // Bind a route that will set CORS headers for this url/path combo.
        headersFn = setHeaders(_.extend({}, routeCorsConfig));
      }

      // Otherwise we don't recognize the CORS config, so throw a warning
      else {
        sails.log.warn('Invalid CORS settings for route '+route);
      }

      configuredRoutes.push({
        pathRegex: pathRegex,
        verb: verb.toLowerCase(),
        headersFn: headersFn
      });

    }

    // Once it's time to bind shadow routes, add a few new global routes.
    sails.on('router:before', function sendCORSHeaders() {
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

      // Now bind a global route that will check to see if the given verb/path combo has CORS config attached,
      // and if so, send the appropriate headers.
      sails.router.bind('/*', function(req, res, next) {

        var verb = req.method.toLowerCase();
        var url = req.originalUrl.replace(/\?$/,'');
        var configuredRoute = _.find(configuredRoutes, function(configuredRoute) {
          return ((configuredRoute.verb === 'all' || configuredRoute.verb === verb) && url.match(configuredRoute.pathRegex));
        });
        if (!configuredRoute) {
          return next();
        }
        return configuredRoute.headersFn(req, res, next);

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
