/**
 * Module dependencies.
 */

var _ = require('lodash');
var util = require('util');
_.defaults = require('merge-defaults');
var express = require('express');
var Writable = require('stream').Writable;

var defaultHandlers = require('./bindDefaultHandlers');


/**
 * Expose new instance of `Router`
 *
 * @api private
 */
module.exports = function(sails) {
  return new Router({sails: sails});
};



/**
 * Initialize a new `Router`
 *
 * @param {Object} options
 * @api private
 */

function Router(options) {

  options = options || {};
  this.sails = options.sails;
  this.defaultHandlers = defaultHandlers(this.sails);

  // Expose router on `sails` object
  this.sails.router = this;

  // Required for dynamic NODE_ENV setting via command line args
  this._privateRouter = express();

  // Bind the context of all instance methods
  this.load = _.bind(this.load, this);
  this.bind = _.bind(this.bind, this);
  this.unbind = _.bind(this.unbind, this);
  this.reset = _.bind(this.reset, this);
  this.flush = _.bind(this.flush, this);
  this.route = _.bind(this.route, this);
}


/**
 * _privateRouter
 *
 * This internal "private" instance of an Express app object
 * is used only for routing. (i.e. it will not be used for
 * listening to actual HTTP requests; instead, one or more
 * delegate servers can be attached- see the `http` or
 * `sockets` hooks for examples of attaching a server to
 * Sails)
 *
 * NOTE: Requires calling `load()` before use in order to
 * provide access to the proper NODE_ENV, since Express
 * uses that to determine its environment (development vs.
 * production.)
 */

// Router.prototype._privateRouter;



/**
 * `sails.router.load()`
 *
 * Expose the router, create the Express private router,
 * then call flush(), which will bind configured routes
 * and emit the appropriate events.
 *
 * @api public
 */

Router.prototype.load = function(cb) {
  var sails = this.sails;

  sails.log.verbose('Loading router...');

  // Maintain a reference to the static route config
  this.explicitRoutes = sails.config.routes;

  // Save reference to sails logger
  this.log = sails.log;

  // Wipe any existing routes and bind them anew
  this.flush();

  // Listen for requests
  sails.on('router:request', this.route);

  // Listen for unhandled errors and unmatched routes
  sails.on('router:request:500', this.defaultHandlers[500]);
  sails.on('router:request:404', this.defaultHandlers[404]);

  cb();
};



/**
 * `sails.router.route(req, res, next)`
 *
 * Routes the specified request using the built-in router.
 *
 * NOTE: this should only be used if the request handler does not have its own router.
 * (this approach also dramatically simplifies unit testing!)
 *
 * The optimal behavior for Express, for instance, is to listen to `router:bind`
 * and use the built-in router at lift-time, whereas Socket.io needs to use the
 * `router:request` event to simulate a connect-style router since it
 * can't bind dynamic routes ahead of time.
 *
 * By default, params and IO methods like res.send() are noops that should be overridden.
 *
 * Keep in mind that, if `route` is not used, the implementing server is responsible
 * for routing to Sails' default `next(foo)` handler.
 *
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next [optional callback- used to populate default res.send() behavior]
 * @api private
 */

Router.prototype.route = function(req, res, next) {
  var sails = this.sails;

  // Use base req and res definitions to ensure the specified
  // objects are at least ducktype-able as standard node HTTP
  // req and req objects.
  req = req || {};
  _.defaults(req, { headers: {} });
  res = res || {};
  _.defaults(res, { locals: {} });

  // Bundle raw callback function
  res._cb = function noRouteCbSpecified(err) {
    throw new Error('As of v0.10, `_cb()` shim is no longer supported in the Sails router.');
  };

  // Track request start time
  req._startTime = new Date();

  // Make sure request and response objects have reasonable defaults
  // (will use the supplied definitions if possible)
  req = reasonableDefaultRequest(req);
  res = reasonableDefaultResponse(req, res);

  // Use our private router to route the request
  this._privateRouter.router(req, res, function handleUnmatchedNext(err) {

    //
    // In the event of an unmatched `next()`, `next('foo')`,
    // or `next('foo', errorCode)`...
    //

    // Use the default server error handler
    if (err) {
      sails.emit('router:request:500', err, req, res);
      return;
    }

    // Or the default not found handler
    sails.emit('router:request:404', req, res);
    return;
  });

};



/**
 * `sails.router.bind()`
 *
 * Bind new route(s)
 *
 * @param {String|RegExp} path
 * @param {String|Object|Array|Function} bindTo
 * @param {String} verb
 * @api private
 */

Router.prototype.bind = require('./bind');



/**
 * `sails.router.unbind()`
 *
 * Unbind existing route
 *
 * @param {Object} route
 * @api private
 */

Router.prototype.unbind = function(route) {

  var sails = this.sails;

  // Inform attached servers that route should be unbound
  sails.emit('router:unbind', route);

  // Remove route in internal router
  var newRoutes = [];
  _.each(this._privateRouter.routes[route.method], function(expressRoute) {
    if (expressRoute.path != route.path) {
      newRoutes.push(expressRoute);
    }
  });
  this._privateRouter.routes[route.method] = newRoutes;

};



/**
 * `sails.router.reset()`
 *
 * Unbind all routes currently attached to the router
 *
 * @api private
 */

Router.prototype.reset = function() {
  var sails = this.sails;

  // Unbind everything
  _.each(this._privateRouter.routes, function(routes, httpMethod) {

    // Unbind each route for the specified HTTP verb
    var routesToUnbind = this._privateRouter.routes[httpMethod] || [];
    _.each(routesToUnbind, this.unbind, this);

  }, this);


  // Emit reset event to allow attached servers to
  // unbind all of their routes as well
  sails.emit('router:reset');

};



/**
 * `sails.router.flush()`
 *
 * Unbind all current routes, then re-bind everything, re-emitting the routing
 * lifecycle events (e.g. `router:before` and `router:after`)
 *
 * @param {Object} routes - (optional)
 *  If specified, replaces `this.explicitRoutes` before flushing.
 *
 * @api private
 */

Router.prototype.flush = function(routes) {
  var sails = this.sails;

  // Wipe routes
  this.reset();

  // Fired before static routes are bound
  sails.emit('router:before');

  // If specified, replace `this.explicitRoutes`
  if (routes) {
    this.explicitRoutes = routes;
  }

  // Use specified path to bind static routes
  _.each(this.explicitRoutes, function(target, path) {
    this.bind(path, target);
  }, this);


  // Fired after static routes are bound
  sails.emit('router:after');
};





//
// TODO:
// replace w/ req.js and res.js:
//

/**
 * Ensure that request object has a minimum set of reasonable defaults.
 * Used primarily as a test fixture.
 *
 * @api private
 */

function FakeSession() {}

function reasonableDefaultRequest(req) {
  // if (req.params && req.method) {
  //   return req;
  // }
  // else {
    return _.defaults(req || {}, {
      params: {},
      session: new FakeSession(),
      query: {},
      body: {},
      param: function(paramName) {

        var key, params = {};
        for (key in (req.params || {}) ) {
          params[key] = params[key] || req.params[key];
        }
        for (key in (req.query || {}) ) {
          params[key] = params[key] || req.query[key];
        }
        for (key in (req.body || {}) ) {
          params[key] = params[key] || req.body[key];
        }

        // Grab the value of the parameter from the appropriate place
        // and return it
        return params[paramName];
      },
      wantsJSON: true,
      method: 'GET'
    });
  // }
}


/**
 * Ensure that response object has a minimum set of reasonable defaults
 * Used primarily as a test fixture.
 *
 * @api private
 */

function reasonableDefaultResponse(req, res) {
  if (typeof res !== 'object') {
    res = new Writable();
  }

  res.send = res.send || function send_shim () {
    var args = normalizeResArgs(arguments);

    if (!res.end || !res.write) {
      return res._cb();
    }
    else {
      res.statusCode = args.statusCode;

      if (args.other) {
        res.write(args.other);
      }
      res.end();
    }
  };

  res.json = res.json || function json_shim () {
    var args = normalizeResArgs(arguments);

    try {
      var json = JSON.stringify(args.other);
      return res.send(json, args.statusCode || 200);
    }
    catch(e) {
      var failedStringify = new Error(
        'Failed to stringify specified JSON response body :: ' + util.inspect(args.other) +
        '\nError:\n' + util.inspect(e)
      );
      return res.send(failedStringify.stack, 500);
    }
  };

  res.render = res.render || function render_shim (relativeViewPath, locals, cb) {
    if (_.isFunction(arguments[1])) {
      cb = arguments[1];
      locals = {};
    }
    // console.log('\n\n\nRENDER\n\n', locals);//_.defaults(locals || {}, res.locals));
    if (!req._sails.renderView) return res.send('Cannot call res.render() - `views` hook is not enabled', 500);
    return res.send('Not implemented in core yet');
    // return sails.renderView(relativeViewPath, _.defaults(locals || {}, res.locals), cb);
  };


  return res;


  /**
   * As long as one of them is a number (i.e. a status code),
   * allows a 2-nary method to be called with flip-flopped arguments:
   *    method( [statusCode|other], [statusCode|other] )
   *
   * This avoids confusing errors & provides Express 2.x backwards compat.
   *
   * E.g. usage in res.send():
   *    var args    = normalizeResArgs.apply(this, arguments),
   *      body    = args.other,
   *      statusCode  = args.statusCode;
   *
   * @api private
   */
  function normalizeResArgs( args ) {

    // Traditional usage:
    // `method( other [,statusCode] )`
    var isNumeric = function (x) {
      return (+x === x);
    };
    if (isNumeric(args[0])) {
      return {
        statusCode: args[0] || 200,
        other: args[1]
      };
    }
    else return {
      statusCode: args[1] || 200,
      other: args[0]
    };
  }
}
