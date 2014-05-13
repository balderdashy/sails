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
          protectionEnabled: true
        };
      }
      else if (sails.config.csrf === false) {
        sails.config.csrf = {
          grantTokenViaAjax: false,
          protectionEnabled: false
        };
      }
      // If user provides ANY object (including empty object), enable all default
      // csrf protection.
      else {
        _.defaults(typeof sails.config.csrf === 'object' ? sails.config.csrf : {}, {
          grantTokenViaAjax: true,
          protectionEnabled: true
        });
      }
    },


    routes: {

      before: {
        '/*': function(req, res, next) {

          if (sails.config.csrf.protectionEnabled && (!req.headers.origin || util.isSameOrigin(req))) {
            var connect = require('express/node_modules/connect');

            return connect.csrf()(req, res, function(err) {
              res.locals._csrf = req.csrfToken();
              next(err);
            });
          }

          // Always ok
          res.locals._csrf = null;

          next();
        }
      },

      after: {
        'get /csrfToken': function(req, res, next) {

          // Allow this endpoint to be disabled by setting:
          // sails.config.csrf = { grantTokenViaAjax: false }
          if (!sails.config.csrf.grantTokenViaAjax) {
            return next();
          }

          return res.json({
            _csrf: res.locals._csrf
          });
        }
      }
    }

  };
};
