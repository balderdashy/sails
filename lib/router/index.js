/**
 * Module dependencies.
 */

var util = require('util');
var Readable = require('stream').Readable;
var Writable = require('stream').Writable;
var QS = require('querystring');
var _ = require('lodash');
var Express = require('express');
var uuid = require('node-uuid');

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
  this._privateRouter = Express();

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

  // If a session store is configured, hook it up as `req.session` by passing
  // it down to the session middleware
  if (sails.hooks.session) {
    sails.after('hook:session:loaded', function (){
      // if (!sails.config.session || !sails.config.session.store || !sails.config.session.secret) {
      //   return cb(new Error('Consistency violation: expected session store+secret config to exist if the session hook is enabled. Is `sails.config.session` valid?'));
      // }
      sails._privateCpMware = Express.cookieParser(sails.config.session.secret);
      sails._privateSessionMiddleware = Express.session(sails.config.session);
    });
  }

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
 * `sails.router.route(partialReq, partialRes)`
 *
 * Interpret the specified (usually partial) request and response objects into
 * streams with all of the expected methods, then routes the fully-formed request
 * using the built-in private router. Useful for creating virtual request/response
 * streams from non-HTTP sources, like Socket.io or unit tests.
 *
 * This method is not always helpful-- it is not called for HTTP requests, for instance,
 * since the true HTTP req/res streams already exist.  In that case, at lift-time, Sails
 * calls `router:bind`, which loads Sails' routes as normal middleware/routes in the http hook.
 * stack will run as usual.
 *
 * On the other hand, Socket.io needs to use this method (i.e. the `router:request` event)
 * to simulate a connect-style router since it can't bind dynamic routes ahead of time.
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

  // If sails is `_exiting`, ignore the request.
  if (sails._exiting) {
    return;
  }

  // Provide access to `sails` object
  req._sails = req._sails || sails;

  // Use base req and res definitions to ensure the specified
  // objects are at least ducktype-able as standard node HTTP
  // req and req streams.
  //
  // Make sure request and response objects have reasonable defaults
  // (will use the supplied definitions if possible)
  req = buildReq(req, res);
  res = buildRes(req, res);

  // console.log('\n\n\n\n=======================\nReceived request to %s %s\nwith req.body:\n',req.method,req.url, req.body);

  // Deprecation error:
  res._cb = function _cbIsDeprecated(err) {
    throw new Error('As of v0.10, `_cb()` shim is no longer supported in the Sails router.');
  };


  // Run some basic middleware
  sails.log.silly('Handling virtual request :: Running virtual querystring parser...');
  qsParser(req,res, function (err) {
    if (err) {
      return res.send(400, err && err.stack);
    }

    // Parse cookies
    parseCookies(req, res, function(err){
      if (err) {
        return res.send(400, err && err.stack);
      }

      // console.log('Ran cookie parser');
      // console.log('res.writeHead= ',res.writeHead);

      // Load session (if relevant)
      loadSession(req, res, function (err) {
        if (err) {
          return res.send(400, err && err.stack);
        }
        // console.log('res is now:\n',res);
        // console.log('\n\n');
        // console.log('Ran session middleware');
        // console.log('req.sessionID= ',req.sessionID);
        // console.log('The loaded req.session= ',req.session);

        sails.log.silly('Handling virtual request :: Running virtual body parser...');
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
              sails.log.silly('Handling virtual request :: Running final "error" handler...');
              sails.emit('router:request:500', err, req, res);
              return;
            }

            // Or the default not found handler
            sails.log.silly('Handling virtual request :: Running final "not found" handler...');
            sails.emit('router:request:404', req, res);
            return;
          });
        });
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









////////////////////////////////////////////////////////////////////////////////////////////////////
//
// ||     Private functions
// \/
//
////////////////////////////////////////////////////////////////////////////////////////////////////





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
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'DELETE'){
    req.body = _.extend({}, req.body);
    return next();
  }

  // Ensure that `req` is a readable stream at this point
  if ( ! req instanceof Readable ) {
    return next(new Error('Sails Internal Error: `req` should be a Readable stream by the time `route()` is called'));
  }

  req.on('readable', function() {
    var chunk;
    while (null !== (chunk = req.read())) {
      bodyBuffer += chunk;
    }
  });
  req.on('end', function() {

    var parsedBody;
    try {
      parsedBody = JSON.parse(bodyBuffer);
    } catch (e) {}

    req.body = _.merge(req.body, parsedBody);
    next();
  });
}







/**
 * [parseCookies description]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
function parseCookies (req, res, next){

  // req._sails.log.verbose('Parsing cookie:',req.headers.cookie);

  if (req._sails._privateCpMware) {
    // Run the middleware
    return req._sails._privateCpMware(req, res, next);
  }

  // Otherwise don't even worry about it.
  return next();
}



/**
 * [loadSession description]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
function loadSession (req, res, next){

  // If a session store is configured, hook it up as `req.session` by passing
  // it down to the session middleware
  if (req._sails._privateSessionMiddleware) {

    // Access store preconfigured session middleware as a private property on the app instance.
    return req._sails._privateSessionMiddleware(req, res, next);
  }

  // Otherwise don't even worry about it.
  return next();
}
