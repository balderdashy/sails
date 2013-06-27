/**
 * Module dependencies.
 */

// global: sails

var _ = require('lodash'),
  Hook = require('../../index'),
  connect = require('connect');


/**
 * Expose csrfHook constructor
 */

module.exports = function (sails) {
  return {
    /**
     * Other hooks that must be loaded before this one
     */

    dependencies: ['router'],

    routes: {

      before: {
        '*': function (req, res, next) {
          if (sails.config.controllers.csrf) {
            return connect.csrf()(req, res, function () {
              res.locals._csrf = req.session._csrf
              next()
            });
          }

          next();
        }
      },

      after: {
        'get /csrfToken': function (req, res) {
          return res.json({
            _csrf: res.locals._csrf
          });
        }
      }
    }


  }
};