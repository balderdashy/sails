/**
 * Module dependencies.
 */

var _ = require('@sailshq/lodash');
var pathToRegexp = require('path-to-regexp');

/**
 *
 * Since the CORS headers module we're using (adapted from https://github.com/expressjs/cors) allows you to provide
 * options in two ways -- either by passing in a dictionary or by passing in a function that takes the request object and
 * returns the options at runtime.  `setPreflightConfig` prepares a function like that, using a dictionary of information
 * about Sails routes and their CORS preflight configs, that will be bound to `OPTIONS /*`.  That way, when a browser
 * makes a preflight request to (for example) 'PUT /foo', the constructed function will be run, will look up
 * `preflightConfigs['/foo']['put']` or `preflightConfigs['/foo']['default']` and use that dictionary of options
 * (combined with the Sails defaults) to tell the CORS module which headers to send back.
 *
 * setPreflightConfig
 * @param  {Dictionary} preflightConfigs A dictionary mapping route path -> dictionary of CORS configs indexed by method (where 'default' is a valid method)
 * @param  {Dictionary} defaultConfig    The default CORS config for Sails.
 * @return {Function} A function that returns the correct set of CORS options for an OPTIONS request to a given path and verb.
 */
module.exports = function setPreflightConfig(preflightRoutes, defaultConfig) {

  return function (req, cb) {

    // Get the request path.
    var path = req.path;

    // Get the method that the request is pre-flighting for.
    var method = (req.headers['access-control-request-method'] || '').toLowerCase();

    // See if we have a CORS config for this path / preflight method.
    var corsConfig = _.reduce(preflightRoutes, function(memo, preflightRoute) {

      // If we have a preflighted route that matches this path...
      if (path.match(preflightRoute.pathRegex)) {
        // ...and it matches the method, then use it.
        if (preflightRoute.verb === method) {
          return preflightRoute.config;
        }
        // ...and the preflight method is 'all', and we haven't found anything more
        //    specific alright, then use it.
        else if (!memo && preflightRoute.verb === 'all') {
          return preflightRoute.config;
        }
      }
      return memo;
    }, null);

    // If no CORS config is present for this route, set `allowOrigins` to false which
    // will result in the `acess-control-allow-origin` header being unset.
    if (!corsConfig) {
      return cb(null, { allowOrigins: false });
    }

    // Otherwise merge the route CORS config into the default CORS config and use that
    // for the OPTIONS response headers.
    return cb(null, _.extend({}, defaultConfig, corsConfig));

  };

};

