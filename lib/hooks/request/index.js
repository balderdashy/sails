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


    /**
     * Bind req/res syntactic sugar before applying any app-level routes
     */

    initialize: function(cb) {


      // Bind an event handler to inject logic before running each individual
      // middleware function within a route/request.
      sails.on('router:route', function(requestState) {
        // *****************************************************************
        // Warning: this is a hot code path!
        // Remember to be sensitive to performance.
        // *****************************************************************
        var req = requestState.req;
        var res = requestState.res;
        var next = requestState.next;

        // req.params.all() must be recalculated before matching each route
        // since path params (`req.params`) might have changed.
        _mixinReqParamsAll(req, res);

        // If `req.options.usage` has been specified, use `req.validate()`
        // to sniff params accordingly.
        //
        ////////////////////////////////////////////////////////////////////////////////////
        // Support for the `usage` option in route targets will change in Sails v1.0.
        // (see related notice about `req.validate()`)
        ////////////////////////////////////////////////////////////////////////////////////
        if (req.options.usage) {
          req.validate(req.options.usage);
        }

      });

      cb();
    },


    routes: {

      before: {
        'all /*': function addMixins (req, res, next) {

          // Run connect-flash middleware to support flash messages
          //
          // Note that built-in support for connect-flash middleware will be removed
          // in Sails v1.0- instead, it should be registered like other middleware
          // in `sails.config.http.middleware`.  For more info, see:
          // http://sailsjs.org/documentation/concepts/middleware
          //
          ////////////////////////////////////////////////////////////////////////////////////
          // Built-in support for flash messages will be deprecated in Sails v1.0.
          // Instead, to use `connect-flash`, your app should register it like any other
          // middleware in `sails.config.http.middleware`.  For more info, see:
          // http://sailsjs.org/documentation/concepts/middleware
          ////////////////////////////////////////////////////////////////////////////////////
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
            // (Warning: this is changing in Sails v1.0!  See impl for more info.)
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
