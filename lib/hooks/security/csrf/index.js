module.exports = function(sails) {

  /**
   * Module dependencies.
   */

  var _ = require('lodash');
  var util = require('sails-util');
  var pathToRegexp = require('path-to-regexp');

  var grantCsrfToken = require('./grant-csrf-token');

  return function initializeCsrf() {

    // Loop through the configured routes in order, and create a blacklist and a whitelist
    // containing regexes to check routes against.
    var blacklist = [];
    var whitelist = [];
    // Regex to check if the route is...a regex.
    var regExRoute = /^r\|(.*)\|(.*)$/;

    sails.on('router:after', function() {

      var sortedRouteAddresses = sails.router.getSortedRouteAddresses();

      _.each(sortedRouteAddresses, function(address) {

        var routeInfo = sails.util.detectVerb(address);
        var path = routeInfo.original.toLowerCase();
        var verb = routeInfo.verb.toLowerCase();

        // Perform the check
        var matches = path.match(regExRoute);
        var regex;

        // If it *is* a regex, create a RegExp object that Express can bind,
        // pull out the params, and wrap the handler in regexRouteWrapper
        if (matches) {
          regex = new RegExp(matches[1]);
        } else {
          regex =pathToRegexp(path);
        }

        var target = sails.config.routes[address];

        if (target.csrf === false && sails.config.security.csrf === true) {
          blacklist.push({method: verb || '', regex: regex});
        }

        else if (target.csrf === true && sails.config.security.csrf === false) {
          whitelist.push({method: verb || '', regex: regex});
        }

      });

    });

    // Add the csrf-token-granting action (see below for the function definition).
    sails.registerAction(grantCsrfToken, 'security/grant-csrf-token');

    sails.on('router:before', function () {

      // Start with a clear res.locals._csrf in every request.
      sails.router.bind('ALL /*', function clearCSRFTokenLocal (req, res, next) {
        res.locals._csrf = '';
        return next();
      });

      // Check CSRF token on relevant requests, and add the CSRF token as res.locals._csrf
      // where applicable.
      sails.router.bind('/*', function(req, res, next) {
        var method = req.method.toLowerCase();
        // If global CSRF is disabled check the whitelist.
        if (sails.config.security.csrf === false) {
          // If nothing in the whitelist matches, continue on without checking for a CSRF token.
          if (!_.any(whitelist, function(whitelistedRoute) {
            return req.url.match(whitelistedRoute.regex) && (!whitelistedRoute.method || whitelistedRoute.method === req.method.toLowerCase());
          })) {
            return next();
          }
        }
        // Otherwise check the blacklist
        else {
          // If anything in the blacklist matches, continue on without checking for a CSRF token.
          if (_.any(blacklist, function(blacklistedRoute) {
            return req.url.match(blacklistedRoute.regex) && (!blacklistedRoute.method || blacklistedRoute.method === req.method.toLowerCase());
          })) {
            return next();
          }
        }

        // Disable CSRF protection when no session is present
        if (!req.session) {
          sails.log.silly('Disabling CSRF protection for ' + req.url + ' since request has no session.');
          return next();
        }

        var csrf = require('csurf');

        return csrf()(req, res, function(err) {
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
