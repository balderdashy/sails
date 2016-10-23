module.exports = function(sails) {

  /**
   * Module dependencies.
   */

  var _ = require('lodash'),
      util = require('sails-util'),
      pathToRegexp = require('path-to-regexp');

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
          regex =pathToRegexp(address);
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

    // Add the csrf token action
    sails.registerAction(csrfToken, 'security/grantcsrftoken');

    sails.on('router:before', function () {

      sails.router.bind('/*', function(req, res, next) {

        var method = req.method.toLowerCase();
        // If global CSRF is disabled check the whitelist.
        if (sails.config.security.csrf === false) {
          // If nothing in the whitelist matches, continue on without checking for a CSRF token.
          if (!_.any(whitelist, function(whitelistedRoute) {
            return req.url.match(whitelistedRoute.regex) && (!whitelistedRoute.method || whitelistedRoute.method === req.method.toLowerCase());
          })) {
            res.locals._csrf = null;
            return next();
          }
        }
        // Otherwise check the blacklist
        else {
          // If anything in the blacklist matches, continue on without checking for a CSRF token.
          if (_.any(blacklist, function(blacklistedRoute) {
            return req.url.match(blacklistedRoute.regex) && (!blacklistedRoute.method || blacklistedRoute.method === req.method.toLowerCase());
          })) {
            res.locals._csrf = null;
            return next();
          }
        }

        // Start with a clear _csrf template token
        res.locals._csrf = null;

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
            // Return an Access-Control-Allow-Origin header in case this is a xdomain request
            if (req.headers.origin) {
              res.set('Access-Control-Allow-Origin', req.headers.origin);
              res.set('Access-Control-Allow-Credentials', true);
            }
            return res.forbidden('CSRF mismatch');
          }

          if (util.isSameOrigin(req) || allowCrossOriginCSRF) {
            res.locals._csrf = req.csrfToken();
          } else {
            res.locals._csrf = null;
          }

          next();
        });

      }, null, {_middlewareType: 'CSRF HOOK: CSRF'});

    });

    return;

  };


  function csrfToken (req, res, next) {
    return res.json({
        _csrf: res.locals._csrf
    });
  }

};
