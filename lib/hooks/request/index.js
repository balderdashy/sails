/**
 * Module dependencies.
 */
var _mixinLocals = require('./locals');
var _mixinReqParamsAll = require('./params.all');
var _mixinServerMetadata = require('./metadata');
var _mixinReqQualifiers = require('./qualifiers');
var _mixinReqValidate = require('./validate');



/*
NOTE:

Most of the contents of this file could be eventually migrated into the prototypes of the `req` and `res` objects
we're extending from our Express router (`_privateRouter`).  This would also need to happen separately in the HTTP hook (since
its req and res are distinct), which is why adding the methods via middleware has been a perfectly convenient abstraction
for the time being.

However, this can be rather hard to understand, and as we make an effort to make hooks easier to work with, it may be
wise to abstract these built-in Sails functions in a more declarative way, maybe even outside of hooks altogether.
This is particularly pertinent in the case of errors ( e.g. res.serverError() ).

If you have any ideas, please let me know! (@mikermcneil)
 */

module.exports = function(sails) {


  /**
   * Extend middleware req/res for this route w/ new methods / qualifiers.
   */

  return {


    defaults: {

    },

    // Don't allow sails to lift until ready
    // is explicitly set below
    ready: false,


    /**
     * Bind req/res syntactic sugar before applying any app-level routes
     */

    initialize: function(cb) {


      // Bind an event handler to inject logic before running each middleware
      // within a route/request
      sails.on('router:route', function(requestState) {
        var req = requestState.req;
        var res = requestState.res;
        var next = requestState.next;

        // req.params.all() must be recalculated before matching each route
        // since path params (`req.params`) might have changed.
        _mixinReqParamsAll(req, res);

        // If `req.options.usage` has been specified, validate params accordingly.
        if (req.options.usage) {
          req.validate(req.options.usage);
        }

      });

      cb();
    },


    /**
     * @type {Object}
     */
    routes: {

      before: {
        'all /*': function addMixins (req, res, next) {

          // Run connect-flash middleware to support flash messages
          // TODO: potential optimization-- pull this out so it only runs once
          var flashMiddleware = (require('connect-flash')());
          flashMiddleware(req, res, function(err) {
            if (err) return next(err);

            // Provide access to `sails` object
            req._sails = req._sails || sails;

            // Add a few `res.locals` by default
            _mixinLocals(req, res);

            // Add information about the server to the request context
            _mixinServerMetadata(req, res);

            // Add `req.validate()` method
            _mixinReqValidate(req, res);

            // Only apply HTTP-focused middleware if it makes sense
            // (i.e. if this is an HTTP request)
            if (req.protocol === 'http' || req.protocol === 'https') {
              _mixinReqQualifiers(req, res);
            }

            next();
          });
        }
      }

    }
  };
};
