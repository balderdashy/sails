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
          origin: ''
        };
      }
      else if (sails.config.csrf === false) {
        sails.config.csrf = {
          grantTokenViaAjax: false,
          protectionEnabled: false,
          origin: ''
        };
      }
      // If user provides ANY object (including empty object), enable all default
      // csrf protection.
      else {
        _.defaults(typeof sails.config.csrf === 'object' ? sails.config.csrf : {}, {
          grantTokenViaAjax: true,
          protectionEnabled: true,
          origin: ''
        });
      }
    },

    initialize: function(cb) {


      // Add res.view() method to compatible middleware
      sails.on('router:before', function () {

        sails.router.bind('/*', function(req, res, next) {
          var allowCrossOriginCSRF = sails.config.csrf.origin.split(',').indexOf(req.headers.origin) > -1;
          if (sails.config.csrf.protectionEnabled) {
            var connect = require('express/node_modules/connect');

            return connect.csrf()(req, res, function(err) {
              if (!req.headers.origin || util.isSameOrigin(req) || allowCrossOriginCSRF) {
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

      cb();

    },

    routes: {


      after: {
        'get /csrfToken': function csrfToken (req, res, next) {

          // Allow this endpoint to be disabled by setting:
          // sails.config.csrf = { grantTokenViaAjax: false }
          if (!sails.config.csrf.grantTokenViaAjax) {
            return next();
          }

          // At this point, the only reason the CSRF token would be null is if
          // this was a CORS request whose origin didn't match one in the
          // sails.config.csrf.origin setting.  So if we have something in
          // res.locals._csrf, we can assume it's okay to send it.  But, no
          // harm in being extra careful, so we'll run the origin check again.
          var allowCrossOriginCSRF = sails.config.csrf.origin.split(',').indexOf(req.headers.origin) > -1;
          if (sails.config.csrf.protectionEnabled && (!req.headers.origin || util.isSameOrigin(req) || allowCrossOriginCSRF)) {
            // If this is a CORS request, make sure we send an access control header
            if (allowCrossOriginCSRF) {
              res.set('Access-Control-Allow-Origin', req.headers.origin);
            }
            return res.json({
              _csrf: res.locals._csrf
            });
          }
          else {
            return res.forbidden();
          }
        }
      }
    }

  };
};
