module.exports = function(sails) {

  /**
   * Module dependencies.
   */

  var _ = require('lodash'),
    util = require('sails-util'),
    Hook = require('../../index');


  /**
   * Expose hook definition
   */

  return {

    defaults: {

      // CSRF middleware protection, all non-GET requests must send '_csrf' parmeter
      // _csrf is a parameter for views, and is also available via GET at /csrfToken
      // TODO: move into csrf hook
      csrf: false
    },

    configure: function () {
      if (sails.config.csrf === true) {
        sails.config.csrf = {
          grantTokenViaAjax: true,
          protectionEnabled: true,
          origin: '-'
        };
      }
      else if (sails.config.csrf === false) {
        sails.config.csrf = {
          grantTokenViaAjax: false,
          protectionEnabled: false,
          origin: '-'
        };
      }
      // If user provides ANY object (including empty object), enable all default
      // csrf protection.
      else {
        _.defaults(typeof sails.config.csrf === 'object' ? sails.config.csrf : {}, {
          grantTokenViaAjax: true,
          protectionEnabled: true,
          origin: '-'
        });
      }
      // Add the csrfToken directly to the config'd routes, so that the CORS hook can process it
      sails.config.routes["/csrfToken"] = {target: csrfToken, cors: {origin: sails.config.csrf.origin, credentials:true}};
    },

    initialize: function(cb) {


      // Add res.view() method to compatible middleware
      sails.on('router:before', function () {

        sails.router.bind('/*', function(req, res, next) {
          var allowCrossOriginCSRF = sails.config.csrf.origin.split(',').indexOf(req.headers.origin) > -1;
          if (sails.config.csrf.protectionEnabled) {
            var connect = require('express/node_modules/connect');

            return connect.csrf()(req, res, function(err) {
              if (util.isSameOrigin(req) || allowCrossOriginCSRF) {
                res.locals._csrf = req.csrfToken();
              } else {
                res.locals._csrf = null;
              }
              if (err) {
                return res.forbidden();
              } else {
                return next();
              }
            });
          }

          // Always ok
          res.locals._csrf = null;

          next();
        }, null, {_middlewareType: 'CSRF HOOK: CSRF'});

      });

      sails.on('router:after', function() {
        sails.router.bind('/csrfToken', csrfToken, 'get', {cors: {origin: sails.config.csrf.origin, credentials: true}});
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
