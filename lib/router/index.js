/**
 * Module dependencies.
 */

var util = require('util');
var Readable = require('stream').Readable;
var Writable = require('stream').Writable;
var QS = require('querystring');
var _ = require('lodash');
var Express = require('express');

var buildReq = require('./req');
var buildRes = require('./res');
var defaultHandlers = require('./bindDefaultHandlers');

var parseSignedCookie = require('cookie-parser').signedCookie;
var Cookie = require('express/node_modules/cookie');
var ConnectSession = require('express/node_modules/connect').middleware.session.Session;

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

  console.log('Received request to %s',req.url);

  // Deprecation error:
  res._cb = function noRouteCbSpecified(err) {
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

      // Load session (if relevant)
      loadSession(req, res, function (err) {
        if (err) {
          return res.send(400, err && err.stack);
        }

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

  console.log('ATTEMPTING TO PARSE COOKIE-headers::',req.headers);

  // TODO: this line of code does not need to be run for every request
  var _cookieParser = Express.cookieParser(req._sails && req._sails.config.session && req._sails.config.session.secret);

  // Run the middleware
  return _cookieParser(req, res, next);
}



/**
 * [loadSession description]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
function loadSession (req, res, next){


  // If a Connect session store is configured, hook it up as req.session
  if (req._sails.config.session && req._sails.config.session.store) {

    // TODO: this line of code does not need to be run for every request
    var _sessionMiddleware = Express.session(req._sails.config.session);

    // Run the middleware
    return _sessionMiddleware(req, res, next);
  }

  // Otherwise don't even worry about it.
  return next();
}








// /**
//  * Create a session transaction
//  *
//  * Load data from the session store using the `sessionID` as parsed from the cookie.
//  * Mix-in the session.save() method for persisting the data back to the session store.
//  *
//  * Functionality is roughly equivalent to that of Connect's sessionStore middleware.
//  */

// function loadSession (req, cb) {

//   // If no cookie was provided, we'll give up trying to load the session.
//   // Stub out a fake Session object so that its methods exist, etc.
//   if (!req.headers.cookie) {
//     req._sails.log.verbose('Could not load session for request, because no cookie was provided.');
//     req._sails.log.verbose('This will result in an empty session, i.e. (req.session === {})');
//     req.session = {};
//     return cb();
//   }

//   // If sid doesn't exit in socket, we have to do a little work first to get it
//   // (or generate a new one-- and therefore a new empty session as well)
//   if (!socket.handshake.sessionID && !socket.handshake.headers.cookie) {

//     // If no cookie exists, generate a random one (this will create a new session!)
//     var generatedCookie = req._sails.config.session.key + '=' + uuid.v1();
//     req.headers.cookie = generatedCookie;
//     req._sails.log.verbose('Could not fetch session, since connecting socket (', socket.id, ') has no cookie.');
//     req._sails.log.verbose('Is this a cross-origin socket..?)');
//     req._sails.log.verbose('Generated a one-time-use cookie:', generatedCookie);
//     req._sails.log.verbose('This will result in an empty session, i.e. (req.session === {})');


//     // Convert cookie into `sid` using session secret
//     // Maintain sid in socket so that the session can be queried before processing each incoming message
//     socket.handshake.cookie = cookie.parse(generatedCookie);
//     // Parse and decrypt cookie and save it in the socket.handshake
//     socket.handshake.sessionID = parseSignedCookie(socket.handshake.cookie[sails.config.session.key], sails.config.session.secret);

//     // Generate and persist a new session in the store
//     SessionHook.generate(socket.handshake, function(err, sessionData) {
//       if (err) return cb(err);
//       sails.log.silly('socket.handshake.sessionID is now :: ', socket.handshake.sessionID);

//       // Provide access to adapter-agnostic `.save()`
//       return cb(null, new RawSession({
//         sid: sessionData.id,
//         data: sessionData
//       }));
//     });
//     return;
//   }


//   try {
//     // Convert cookie into `sid` using session secret
//     // Maintain sid in socket so that the session can be queried before processing each incoming message
//     socket.handshake.cookie = cookie.parse(socket.handshake.headers.cookie);
//     // Parse and decrypt cookie and save it in the socket.handshake
//     socket.handshake.sessionID = parseSignedCookie(socket.handshake.cookie[sails.config.session.key], sails.config.session.secret);
//   } catch (e) {
//     sails.log.error('Could not load session for socket #' + socket.id);
//     sails.log.error('The socket\'s cookie could not be parsed into a sessionID.');
//     sails.log.error('Unless you\'re overriding the `authorization` function, make sure ' +
//       'you pass in a valid `' + sails.config.session.key + '` cookie');
//     sails.log.error('(or omit the cookie altogether to have a new session created and an ' +
//       'encrypted cookie sent in the response header to your socket.io upgrade request)');
//     return cb(e);
//   }

//   // If sid DOES exist, it's easy to look up in the socket
//   var sid = socket.handshake.sessionID;

//   // Cache the handshake in case it gets wiped out during the call to SessionHook.get
//   var handshake = socket.handshake;

//   // Retrieve session data from store
//   SessionHook.get(sid, function(err, sessionData) {

//     if (err) {
//       sails.log.error('Error retrieving session from socket.');
//       return cb(err);
//     }

//     // sid is not known-- the session secret probably changed
//     // Or maybe server restarted and it was:
//     // (a) using an auto-generated secret, or
//     // (b) using the session memory store
//     // and so it doesn't recognize the socket's session ID.
//     else if (!sessionData) {
//       sails.log.verbose('A socket (' + socket.id + ') is trying to connect with an invalid or expired session ID (' + sid + ').');
//       sails.log.verbose('Regnerating empty session...');

//       SessionHook.generate(handshake, function(err, sessionData) {
//         if (err) return cb(err);

//         // Provide access to adapter-agnostic `.save()`
//         return cb(null, new RawSession({
//           sid: sessionData.id,
//           data: sessionData
//         }));
//       });
//     }

//     // Otherwise session exists and everything is ok.

//     // Instantiate RawSession (provides .save() method)
//     // And extend it with session data
//     else return cb(null, new RawSession({
//       data: sessionData,
//       sid: sid
//     }));
//   });
// }





// /**
//  * Constructor for the connect session store wrapper used by the sockets hook.
//  * Includes a save() method to persist the session data.
//  */
// function RawSession(options) {
//   var sid = options.sid;
//   var data = options.data;


//   /**
//    * [save description]
//    * @param  {Function} cb [description]
//    * @return {[type]}      [description]
//    */
//   this.save = function(cb) {

//     if (!sid) {
//       return _.isFunction(cb) && cb((function (){
//         var err = new Error('Could not save session');
//         err.code = 'E_SESSION_SAVE';
//         err.details = 'Trying to save session, but could not determine session ID.\n'+
//         'This probably means a requesting socket from socket.io did not send a cookie.\n'+
//         'Usually, this happens when a socket from an old browser tab  tries to reconnect.\n'+
//         '(this can also occur when trying to connect a cross-origin socket.)';
//         return err;
//       })());
//     }

//     // Merge data directly into instance to allow easy access on `req.session` later
//     _.defaults(this, data);

//     // Persist session
//     SessionHook.set(sid, _.cloneDeep(this), function(err) {
//       if (err) {
//         return _.isFunction(cb) && cb((function (){
//           err.code = 'E_SESSION_SAVE';
//           return err;
//         })());
//       }
//       return _.isFunction(cb) && cb();
//     });
//   };

//   // Set the data on this object, since it will be used as req.session
//   util.extend(this, options.data);
// }








// /**
//  * [loadSession description]
//  * @param  {[type]}   req [description]
//  * @param  {Function} cb  [description]
//  * @return {[type]}       [description]
//  */
// function loadSession (req, cb){

//   if (!req._sails || !req._sails.config.session) {
//     req.session = {};
//     (req._sails && req._sails.log && req._sails.log.verbose || console.log)('Skipping session...');
//     return cb();
//   }

//   // Populate req.session using shared session store
//   sails.session.fromSocket(req.socket, function sessionReady (err, session) {
//     if (err) return cb(err);

//     // Provide access to session data as req.session
//     req.session = session || {};

//     return cb();
//   });

//   // console.log('About to try and parse cookie...');

//   // // Decrypt cookie into session id using session secret to get `sessionID`.
//   // //
//   // // (this allows us to query the session before processing each incoming message from this
//   // // socket in the future)
//   // var cookie;
//   // var sessionID;
//   // try {

//   //   if (!req.headers.cookie) {
//   //     return cb((function _buildError(){
//   //       var err = new Error('No cookie sent with request');
//   //       return err;
//   //     })());
//   //   }

//   //   cookie = Cookie.parse(req.headers.cookie);

//   //   if (!req._sails.config.session.key) {
//   //     return cb((function _buildError(){
//   //       var err = new Error('No session key configured (sails.config.session.key)');
//   //       return err;
//   //     })());
//   //   }
//   //   if (!req._sails.config.session.secret) {
//   //     return cb((function _buildError(){
//   //       var err = new Error('No session secret configured (sails.config.session.secret)');
//   //       return err;
//   //     }()));
//   //   }

//   //   sessionID = parseSignedCookie(cookie[req._sails.config.session.key], req._sails.config.session.secret);
//   // } catch (e) {
//   //   return cb((function _buildError(){
//   //     var err = new Error('Cannot load session. Cookie could not be parsed:\n'+util.inspect(e&&e.stack));
//   //     err.code = 'E_PARSE_COOKIE';
//   //     err.status = 400;
//   //     return err;
//   //   })());
//   // }

//   // // Look up this socket's session id in the Connect session store
//   // // and see if we already have a record of 'em.
//   // req._sails.session.get(sessionID, function(err, sessionData) {

//   //   // An error occurred, so refuse the connection
//   //   if (err) {
//   //     return cb('Error loading session during socket connection! \n' + util.inspect(err, false, null));
//   //   }

//   //   // Cookie is present (there is a session id), but it doesn't
//   //   // correspond to a known session in the session store.
//   //   // So generate a new, blank session.
//   //   if (!sessionData) {
//   //     var newSession = new ConnectSession({sessionID: sessionID}, {
//   //       cookie: {
//   //         // Prevent access from client-side javascript
//   //         httpOnly: true
//   //       }
//   //     });
//   //     req._sails.log.verbose("Generated new session for socket....", {sessionID: sessionID});
//   //     req.session = newSession;
//   //     return cb();
//   //   }

//   //   // Parsed cookie matches a known session- onward!
//   //   //
//   //   // Instantiate a session object, passing our just-acquired session handshake
//   //   var existingSession = new ConnectSession({sessionID: sessionID}, sessionData);
//   //   req._sails.log.verbose("Connected socket to existing session....");
//   //   req.session = existingSession;
//   //   cb();
//   // });
// }



// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// When err.code === E_PARSE_COOKIE
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// var TROUBLESHOOTING =
// 'Perhaps you have an old browser tab open?  In that case, you can ignore this warning.' + '\n' +
// 'Otherwise, are you are trying to access your Sails.js ' + '\n' +
// 'server from a socket.io javascript client hosted on a 3rd party domain?  ' + '\n' +
// ' *-> You can override the cookie for a user entirely by setting ?cookie=... in the querystring of ' + '\n' +
// 'your socket.io connection url on the client.' + '\n' +
// ' *-> You can send a JSONP request first from the javascript client on the other domain ' + '\n' +
// 'to the Sails.js server to get the cookie, then connect the socket.' + '\n';
// var socketSpecificMsg =
// 'Unable to parse the cookie that was transmitted for an incoming socket.io connect request.'+
// '\n' + TROUBLESHOOTING + '\n'+
// '';
