module.exports = function(sails) {

  /**
   * Module dependencies.
   */

  var _ = require('@sailshq/lodash'),
      util = require('sails-util'),
      pathToRegexp = require('path-to-regexp');

  /**
   * Expose hook definition
   */

  return {

    defaults: {

      // CSRF middleware protection, all non-GET requests must send '_csrf' parameter
      // _csrf is a parameter for views, and is also available via GET at /csrfToken
      // TODO: move into csrf hook
      csrf: false
    },

    configure: function () {
      if (sails.config.csrf === true) {
        sails.config.csrf = {
          grantTokenViaAjax: true,
          protectionEnabled: true,
          origin: '-',
          routesDisabled: '-',
          route: '/csrfToken'
        };
      }
      else if (sails.config.csrf === false) {
        sails.config.csrf = {
          grantTokenViaAjax: false,
          protectionEnabled: false,
          origin: '-',
          routesDisabled: '-',
          route: '/csrfToken'
        };
      }
      // If user provides ANY object (including empty object), enable all default
      // csrf protection.
      else {
        _.defaults(typeof sails.config.csrf === 'object' ? sails.config.csrf : {}, {
          grantTokenViaAjax: true,
          protectionEnabled: true,
          origin: '-',
          routesDisabled: '-',
          route: '/csrfToken'
        });
      }
      // Create a route path for getting _csrf parameter
      var csrfRoute = {};
      csrfRoute[sails.config.csrf.route] = {
        target: csrfToken,
        cors: {
          origin: sails.config.csrf.origin,
          credentials: true
        }
      };
      // Add the csrfToken directly to the config'd routes, so that the CORS hook can process it
      sails.config.routes = _.extend(csrfRoute, sails.config.routes);
    },

    initialize: function(cb) {

      // Quick trim function--could move this into sails.util at some point
      function trim (str) {return str.trim();}

      var disabledRoutes;
      if (Array.isArray(sails.config.csrf.routesDisabled)) {
        disabledRoutes = sails.config.csrf.routesDisabled;
      } else if (_.isRegExp(sails.config.csrf.routesDisabled)) {
        disabledRoutes = [sails.config.csrf.routesDisabled];
      } else {
        disabledRoutes = sails.config.csrf.routesDisabled.split(',').map(trim);
      }

      var disabledRouteCheckers = disabledRoutes.map(function(route) {
        var parsedRegexp;
        if (_.isString(route)) {
          parsedRegexp = pathToRegexp(route, []);
          return function(req) { return parsedRegexp.exec(req.path) };
        } else if (_.isRegExp(route)) {
          return function(req) { return route.test(req.path) };
        } else {
          return function() { return false };
        }
      });

      // Add res.view() method to compatible middleware
      sails.on('router:before', function () {

        sails.router.bind('/*', function(req, res, next) {

          var allowCrossOriginCSRF = sails.config.csrf.origin.split(',').map(trim).indexOf(req.headers.origin) > -1;

          var isRouteDisabled = disabledRouteCheckers.some(function(checker) { return checker(req); })

          // Start with a clear _csrf template token
          res.locals._csrf = null;

          // Disable CSRF protection for specified routes
          if (isRouteDisabled) {
            sails.log.silly("Disabling CSRF protection for " + req.url + " since it is explcitly set in sails.config.csrf.routesDisabled.");
            return next();
          }

          // Disable CSRF protection when no session is present
          if (!req.session) {
            sails.log.silly("Disabling CSRF protection for " + req.url + " since request has no session.");
            return next();
          }

          // If CSRF protection is on, run it
          if (sails.config.csrf.protectionEnabled) {
            var csrf = require('csurf');

            return csrf()(req, res, function(err) {
              if (err) {
                // Only attempt to handle invalid csrf tokens
                if (err.code !== 'EBADCSRFTOKEN') {
                  throw err;
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

          }

          // Always ok
          next();
        }, null, {_middlewareType: 'CSRF HOOK: CSRF'});

      });

      sails.on('router:after', function() {
        sails.router.bind(sails.config.csrf.route, csrfToken, 'get', {
          cors: {
            origin: sails.config.csrf.origin,
            credentials: true
          }
        });
      });

      cb();

    }

  };


  function csrfToken (req, res, next) {
    // Allow this endpoint to be disabled by setting:
    // sails.config.csrf = { grantTokenViaAjax: false }
    if (!sails.config.csrf.grantTokenViaAjax) {
      return next();
    }
    return res.json({
        _csrf: res.locals._csrf
    });
  }

};
