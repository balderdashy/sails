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
      sails.config.routes = sails.util.extend(csrfRoute, sails.config.routes);
    },

    initialize: function(cb) {

      // Quick trim function--could move this into sails.util at some point
      function trim (str) {return str.trim();}

      // Add res.view() method to compatible middleware
      sails.on('router:before', function () {

        sails.router.bind('/*', function(req, res, next) {

          var allowCrossOriginCSRF = sails.config.csrf.origin.split(',').map(trim).indexOf(req.headers.origin) > -1;

          if (sails.config.csrf.protectionEnabled) {
            var connect = require('express/node_modules/connect');

            try {
              return connect.csrf()(req, res, function() {
                if (util.isSameOrigin(req) || allowCrossOriginCSRF) {
                  res.locals._csrf = req.csrfToken();
                } else {
                  res.locals._csrf = null;
                }

                next();
              });
            } catch(err) {
              // Only attempt to handle invalid csrf tokens
              if (err.message != 'invalid csrf token') throw err;

              var isRouteDisabled  = sails.config.csrf.routesDisabled.split(',').map(trim).indexOf(req.path) > -1;

              if (isRouteDisabled) {
                return next();
              } else {
                // Return an Access-Control-Allow-Origin header in case this is a xdomain request
                if (req.headers.origin) {
                  res.set('Access-Control-Allow-Origin', req.headers.origin);
                  res.set('Access-Control-Allow-Credentials', true);
                }
                return res.forbidden("CSRF mismatch");
              }
            }
          }

          // Always ok
          res.locals._csrf = null;

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
