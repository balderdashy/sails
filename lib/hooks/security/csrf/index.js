module.exports = function(sails) {

  /**
   * Module dependencies.
   */

  var csurf = require('csurf');
  var _ = require('@sailshq/lodash');
  var pathToRegexp = require('path-to-regexp');
  var detectVerb = require('../../../util/detect-verb');


  return function initializeCsrf() {

    // Instantiate CSRF middleware
    var csrfMiddleware = csurf();

    // Loop through the configured routes in order, and create a blacklist and a whitelist
    // containing regexes to check routes against.
    var blacklist = [];
    var whitelist = [];
    // Regex to check if the route is...a regex.
    var regExRoute = /^r\|(.*)\|(.*)$/;

    sails.on('router:after', function() {

      var sortedRouteAddresses = sails.router.getSortedRouteAddresses();

      _.each(sortedRouteAddresses, function(address) {

        var routeInfo = detectVerb(address);
        var path = routeInfo.original;
        var verb = routeInfo.verb.toLowerCase();
        var target = sails.router.explicitRoutes[address];

        // Ignore targets that don't have CSRF explicitly set.
        if (target.csrf !== true && target.csrf !== false) {
          return;
        }

        // Ignore targets with GET, HEAD or OPTIONS methods (with warning)
        if (verb === 'get' || verb === 'head' || verb === 'options') {
          sails.log.debug('Ignoring `csrf: ' + target.csrf + '` setting for route `' + verb + ' ' + path + '`.');
          sails.log.debug('CSRF protection does not apply to GET, HEAD or OPTIONS routes.');
          sails.log.debug();
          return;
        }

        // Perform the check
        var matches = path.match(regExRoute);
        var regex;

        // If it *is* a regex, create a RegExp object that Express can bind,
        // pull out the params, and wrap the handler in regexRouteWrapper
        if (matches) {
          regex = new RegExp(matches[1]);
        } else {
          path = path.toLowerCase();
          regex = pathToRegexp(path);
        }


        if (target.csrf === false && sails.config.security.csrf === true) {
          blacklist.push({method: verb || '', regex: regex});
        }

        else if (target.csrf === true && sails.config.security.csrf === false) {
          whitelist.push({method: verb || '', regex: regex});
        }

      });

    });

    sails.on('router:before', function () {

      // Start with a clear res.locals._csrf in every request.
      sails.router.bind('ALL /*', function clearCSRFTokenLocal (req, res, next) {
        res.locals._csrf = '';
        return next();
      });

      // Check CSRF token on relevant requests, and add the CSRF token as res.locals._csrf
      // where applicable.
      sails.router.bind('/*', function(req, res, next) {

        // If global CSRF is disabled check the whitelist.
        if (sails.config.security.csrf === false) {
          // If nothing in the whitelist matches, continue on without checking for a CSRF token.
          if (!_.any(whitelist, function(whitelistedRoute) {
            return req.path.match(whitelistedRoute.regex) && (!whitelistedRoute.method || whitelistedRoute.method === req.method.toLowerCase());
          })) {
            return next();
          }
        }
        // Otherwise check the blacklist
        else {
          // If anything in the blacklist matches, continue on without checking for a CSRF token.
          if (_.any(blacklist, function(blacklistedRoute) {
            return req.path.match(blacklistedRoute.regex) && (!blacklistedRoute.method || blacklistedRoute.method === req.method.toLowerCase());
          })) {
            return next();
          }
        }

        // Handle session being disabled.
        if (!req.session) {
          // For GET, HEAD and OPTIONS requests, continue on.  These aren't covered by CSRF anyway.
          if (_.contains(['get', 'head', 'options'], req.method.toLowerCase())) {
            return next();
          }
          // In development mode, give a more explicit account of what's happening.
          if (process.env.NODE_ENV === 'development') {
            return next(new Error('Route `' + req.method + ' ' + req.path + '` has CSRF enabled, but the session is disabled!'));
          }
          // In production, just return the same CSRF mismatch error you'd get with a bad/missing token in the request.
          else {
            return res.forbidden('CSRF mismatch');
          }
        }

        return csrfMiddleware(req, res, function(err) {
          if (err) {
            // Only attempt to handle invalid csrf tokens
            if (err.code !== 'EBADCSRFTOKEN') {
              return next(err);
            }
            return res.forbidden('CSRF mismatch');
          }
          // If this is not a socket request, provide the CSRF token in res.locals,
          // so it can be bootstrapped into a view.  For purposes of CSRF, we're
          // treating sockets as inherently insecure (note that we disable
          // the grant-csrf-token action for sockets as well).  You can certainly
          // _spend_ CSRF tokens over sockets, you just can't retrieve them.
          if (!req.isSocket) {
            res.locals._csrf = req.csrfToken();
          }
          next();
        });

      }, null, {_middlewareType: 'CSRF HOOK: CSRF'});

    });

    return;

  };

};
