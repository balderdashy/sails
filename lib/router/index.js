/**
 * Module dependencies.
 */

var Writable = require('stream').Writable;
var QS = require('querystring');
var util = require('util');
var _ = require('lodash');
var express = require('express');

var buildReq = require('./req');
var buildRes = require('./res');
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
  // TODO:
  // instead, use: https://www.npmjs.org/package/path-to-regexp
  // (or: https://www.npmjs.org/package/path-match)
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
 * @api private
 */

Router.prototype.route = function(req, res) {
  var sails = this.sails;
  var _privateRouter = this._privateRouter;


  // Use base req and res definitions to ensure the specified
  // objects are at least ducktype-able as standard node HTTP
  // req and req objects.
  //
  // Make sure request and response objects have reasonable defaults
  // (will use the supplied definitions if possible)
  req = buildReq(req, res);
  res = buildRes(req, res);

  // Provide access to `sails` object
  req._sails = req._sails || sails;

  // Deprecation error:
  res._cb = function noRouteCbSpecified(err) {
    throw new Error('As of v0.10, `_cb()` shim is no longer supported in the Sails router.');
  };

  // Track request start time
  req._startTime = new Date();


  // Run some basic middleware
  qsParser(req,res, function (err) {
    if (err) {
      return res.send(400, err && err.stack);
    }

    bodyParser(req,res, function (err) {
      if (err) {
        return res.send(400, err && err.stack);
      }

      // Use our private router to route the request
      _privateRouter.router(req, res, function handleUnmatchedNext(err) {
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
    });
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



// Extremely simple query string parser (`req.query`)
function qsParser(req,res,next) {
  var queryStringPos = req.url.indexOf('?');
  if (queryStringPos !== -1) {
    req.query = _.merge(req.query, QS.parse(req.url.substr(queryStringPos + 1)));
  }
  else {
    req.query = req.query || {};
  }
  next();
}
// Extremely simple body parser (`req.body`)
function bodyParser (req, res, next) {
  var bodyBuffer='';
  var parsedBody={};
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'DELETE'){
    req.body = _.merge(req.body, parsedBody);
    return next();
  }

  req.on('readable', function() {
    var chunk;
    while (null !== (chunk = req.read())) {
      bodyBuffer += chunk;
    }
  });
  req.on('end', function() {
    try {
      parsedBody = JSON.parse(bodyBuffer);
    } catch (e) {}

    req.body = _.merge(req.body, parsedBody);
    next();
  });
}
