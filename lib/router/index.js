/**
 * Module dependencies.
 */

var Readable = require('stream').Readable;
var QS = require('querystring');
var _ = require('@sailshq/lodash');
var router = require('router');
var flaverr = require('flaverr');
var sortRouteAddresses = require('sort-route-addresses');
var buildReq = require('./req');
var buildRes = require('./res');
var defaultHandlers = require('./bindDefaultHandlers');
var detectVerb = require('../util/detect-verb');

// Private var to hold sorted route addresses
var sortedRouteAddresses = [];

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

  // Instantiate the private router as an instance of `router.
  this._privateRouter = router();

  // Return the array of sorted route addresses, cloned for our protection.
  this.getSortedRouteAddresses = function() { return _.clone(sortedRouteAddresses); };

  // Bind the context of all instance methods
  this.load = _.bind(this.load, this);
  this.bind = _.bind(this.bind, this);
  this.unbind = _.bind(this.unbind, this);
  this.reset = _.bind(this.reset, this);
  this.flush = _.bind(this.flush, this);
  this.route = _.bind(this.route, this);
  this.getActionIdentityForTarget = _.bind(this.getActionIdentityForTarget, this);
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
 * Note the `results, cb` signature, which is necessary
 * because this function is called from an async.auto()
 * where it has dependencies.
 *
 * @api public
 */

Router.prototype.load = function(results, cb) {
  var sails = this.sails;

  sails.log.silly('Loading router...');

  // Maintain a reference to the static route config
  this.explicitRoutes = sails.config.routes;

  // Save reference to sails logger
  this.log = sails.log;

  var sessionSecret = sails.config.session && sails.config.session.secret;
  // If a session store is configured, hook it up as `req.session` by passing
  // it down to the session middleware
  if (!sails.hooks.session) {
    // If available, Sails uses the configured session secret for signing cookies.
    if (sessionSecret) {
      // Ensure secret is a string.  This check happens in the session hook as well,
      // but sails.config.session.secret may still be provided even if the session hook
      // is turned off, so to be extra anal we'll check here as well.
      if (!_.isString(sessionSecret)) {
        return cb(new Error('If provided, sails.config.session.secret should be a string.'));
      }
    }
  }
  if (sessionSecret) {
    sails._privateCpMware = require('cookie-parser')(sessionSecret);
  } else {
    sails._privateCpMware = require('cookie-parser')();
  }

  // Wipe any existing routes and bind them anew
  try {
    this.flush();
  }
  // Catch any errors thrown by code handling the router:before and router:after events.
  catch(e) {
    return cb(e);
  }

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

  // Provide access to SailsApp instance as `req._sails`.
  req._sails = req._sails || sails;

  // Note that, at this point, `req` and `res` are just dictionaries containing
  // the properties of each object that have been built up _so far_.
  //
  // Use base req and res definitions to ensure the specified
  // objects are at least ducktype-able as standard node HTTP
  // req and req streams.
  //
  // Make sure request and response objects have reasonable defaults
  // (will use the supplied definitions if possible)
  req = buildReq(req);
  res = buildRes(req, res);

  // Default to 200 status code for OPTIONS requests.
  // The built-in Express OPTIONS handler just calls `res.end()` (rather
  // than `res.send()`), so no status code gets set and our mock res.writeHead
  // method complains.
  if (req.method === 'OPTIONS' && !res.statusCode) {
    res.status(200);
  }

  // console.log('\n\n\n\n=======================\nReceived request to %s %s\nwith req.body:\n',req.method,req.url, req.body);

  // Run some basic middleware
  sails.log.silly('Handling virtual request :: Running virtual querystring parser...');
  qsParser(req,res, function (err) {
    if (err) {
      return res.status(400).send(err && err.stack);
    }

    // Parse cookies
    parseCookies(req, res, function(err){
      if (err) {
        return res.status(400).send(err && err.stack);
      }

      // console.log('Ran cookie parser');
      // console.log('res.writeHead= ',res.writeHead);

      // Load session (if relevant)
      loadSession(req, res, function (err) {
        if (err) {
          return res.status(400).send(err && err.stack);
        }
        // console.log('res is now:\n',res);
        // console.log('\n\n');
        // console.log('Ran session middleware');
        // console.log('req.sessionID= ',req.sessionID);
        // console.log('The loaded req.session= ',req.session);

        sails.log.silly('Handling virtual request :: Running virtual body parser...');
        bodyParser(req,res, function (err) {
          if (err) {
            return res.status(400).send(err && err.stack);
          }

          // Use our private router to route the request
          _privateRouter(req, res, function handleUnmatchedNext(err) {
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

Router.prototype.unbind = function(routeToRemove) {

  var sails = this.sails;

  // Inform attached servers that route should be unbound
  sails.emit('router:unbind', routeToRemove);

  // Remove any route which matches the path and verb of the argument
  _.remove(this._privateRouter.stack, function(layer) {
    return (layer.route.path === routeToRemove.path && layer.route.methods[routeToRemove.verb] === true);
  });

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

  // Make sure that all the routes are deleted
  this._privateRouter.stack = [];

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

  var self = this;
  var sails = this.sails;

  // Wipe routes
  this.reset();

  // Fired before static routes are bound
  sails.emit('router:before');

  // If specified, replace `this.explicitRoutes`
  if (routes) {
    this.explicitRoutes = routes;
  }

  // Updated the sorted route address cache
  sortedRouteAddresses = sortRouteAddresses(_.keys(this.explicitRoutes));

  // Iterate over each address and bind the route that the address is for.
  _.each(sortedRouteAddresses, function(address) {
    var target = self.explicitRoutes[address];
    var verb = detectVerb(address).verb;

    // If the route address ends in a pattern var (e.g. /:id) or a wildcard (i.e. /*)
    // and it declares a method that could be used to request an asset, and the route
    // doesn't explicitly declare `skipAssets` true or false, then it should!
    var shouldDeclareSkipAssets = (
      _.isUndefined(target.skipAssets) &&
      (address.match(/\/\*\/?$/) || address.match(/^r\|/)) &&
      (!verb || _.contains(['all', 'get', 'head', 'options'], verb))
    );
    if (shouldDeclareSkipAssets) {
      sails.log.warn('Warning: route `' + address + '` should explicitly declare `skipAssets: true` or `skipAssets: false` to ensure correct handling of assets!');
      sails.log.warn('See http://sailsjs.com/docs/concepts/routes/url-slugs for more info.');
      console.log();
    }

    self.bind(address, target);
  });

  // Fired after static routes are bound
  sails.emit('router:after');
};


/**
 * Given a route target configuration, return an action identity for that target.
 * @param  {Dictionary|String} target The route target to get an action identity for
 * @return {String}        An action identity like `user/find`
 */
Router.prototype.getActionIdentityForTarget = function getActionIdentityForTarget(target) {

  var actionIdentity;

  // Unwrap { target: '...' } targets.
  if (target && target.target) {
    target = target.target;
  }

  // Handle dictionary targets:
  // {controller: 'UserController', action: 'create'}
  // - or -
  // {action: 'user.create'}
  if (_.isObject(target) && !_.isArray(target) && !_.isFunction(target)) {

    // Attempt to handle `{controller: 'UserController', action: 'create'}` target.
    if (target.controller) {
      if (!target.action) {
        throw flaverr({name: 'userError', code: 'E_NOT_ACTION_TARGET'}, new Error('If `controller` is specified, `action` must be also!'));
      }

      actionIdentity = target.controller.replace('Controller', '') + '/' + target.action;
    }
    // Attempt to handle `{action: 'user.create'}` target.
    else if (target.action) {
      // Get the action identity by lowercasing the value of the `action` property.
      actionIdentity = target.action;
    }

    else {
      throw flaverr({name: 'userError', code: 'E_NOT_ACTION_TARGET'}, new Error('If target is a dictionary, it must contain an `action` property!'));
    }

    // Bail if the action contains characters other than letters, numbers, dashes and forward slashes.
    if (!actionIdentity.match(/^[a-zA-Z_\$]+[a-zA-Z0-9_\/\-\$]*$/)) {
      // If the action didn't contain weird characters, make a suggestion by removing "Controller" and
      // replacing dots with slashes.
      var didYouMean = '';
      var RX_DOESNT_HAVE_ANY_WEIRD_CHARS = /[^a-zA-Z0-9.\/\-\$]/;
      if (!actionIdentity.match(RX_DOESNT_HAVE_ANY_WEIRD_CHARS)) {
        didYouMean = ' Did you mean `' + actionIdentity.replace('Controller', '').replace(/\./g,'/') + '`?';
      }
      throw flaverr({name: 'userError', code: 'E_NOT_ACTION_TARGET'}, new Error(
        '\nCould not parse invalid action `' + actionIdentity + '`.' + didYouMean + '\n\n' +
        'See http://sailsjs.com/docs/concepts/routes/custom-routes#?controller-action-target-syntax\n'+
        'for more info on controller/action and standalone action route syntax.\n'

      ));
    }

  }

  // Handle string targets:
  // 'UserController.create'
  // - or -
  // 'user.create'
  // - or -
  // 'user/create'
  else if (_.isString(target)) {

    // Normalize the action identity by removing `Controller` and replacing `.` with `/`
    actionIdentity = target.replace(/Controller/,'').replace(/\./g,'/');

    // If the result contains anything other than letters, numbers, dashes, underscores or forward-slashes, bail.
    if (!actionIdentity.match(/^[a-zA-Z_\$]+[a-zA-Z0-9_\/\-\$]*$/)) {
      throw flaverr({name: 'userError', code: 'E_NOT_ACTION_TARGET'}, new Error(
        '\nCould not parse invalid action `' + target + '`.\n'+
        'See http://sailsjs.com/docs/concepts/routes/custom-routes#?controller-action-target-syntax\n'+
        'for more info on controller/action and standalone action route syntax.\n'
      ));
    }

  }

  else if (_.isArray(target)) {

    actionIdentity = (function(){
      var actionTarget = _.find(target, function(targetComponent) {
        return targetComponent.action;
      });
      if (actionTarget) {
        return getActionIdentityForTarget(actionTarget);
      }
      throw flaverr({name: 'userError', code: 'E_NOT_ACTION_TARGET'}, new Error('Target was an array without any items containing an action!'));
    })();

  }

  else {
    throw flaverr({name: 'userError', code: 'E_NOT_ACTION_TARGET'}, new Error('Target must be a dictionary or string!'));
  }

  // Replace all dots with slashes, and ensure lowercase.
  actionIdentity = actionIdentity.replace(/\./g, '/').toLowerCase();

  return actionIdentity;
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

  // Set up a mock `req.file()` clarifying that req.file() is not available
  // outside of the context of Skipper (i.e. in this case, most commonly from
  // socket.io virtual requests).
  req.file = function fileUploadsNotAvailable(){
    return res.status(500).send('Streaming file uploads via `req.file()` are only available over HTTP with Skipper.');
  };

  var bodyBuffer='';
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'DELETE'){
    req.body = _.extend({}, req.body);
    return next();
  }

  // Ensure that `req` is a readable stream at this point
  if ( !(req instanceof Readable) ) {
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
    } catch (unusedErr) {}

    // TODO -- replace _.merge() with a call to merge-dictionaries module?
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

  // If a session store is configured, and we haven't deliberately disabled
  // session support for this request by setting the "nosession" header,
  // hook up the store up as `req.session` by passing it down to the
  // session middleware.
  if (req._sails._privateSessionMiddleware && !req.headers.nosession) {

    // Access store preconfigured session middleware as a private property on the app instance.
    return req._sails._privateSessionMiddleware(req, res, next);
  }

  // Otherwise don't even worry about it.
  return next();
}


