/**
 * Module dependencies
 */
var buildReq = require('../../../../router/req');
var buildRes = require('../../../../router/res');


module.exports = function (sails) {


  /**
   * Module dependencies.
   */

  var util    = require('sails-util'),
    ResStream = require('./ResStream'),
    getVerb   = require('./getVerb'),
    saveSessionAndThen = require('./saveSessionAndThen'),
    getSDKMetadata = require('../getSDKMetadata');


  /**
   * Module errors
   */
  var Err = {
    invalidRequestCallback: function (invalidFn) {
      return new Error(
        'Invalid callback specified in socket request :: ' +
        util.inspect(invalidFn)
      );
    },
    invalidRedirect: function (location) {
      return new Error(
        '\n' +
        'res.redirect() :: [socket.io] ::' +
        '\n' +
        'Cannot redirect socket to invalid location :: ' +
        util.inspect(location)
      );
    }
  };


  /**
   * Interpret an incoming socket.io "request"
   * Emulates Express semantics by mocking request (`req`) and response (`res`)
   *
   * @param  {[type]}   socketReq        [incoming sails.io-formatted socket msg]
   * @param  {[type]}   socketIOCallback [an ack callback useful for sending a response back to the client]
   * @param  {[type]}   socket           [the socket that originated this request]
   * @param  {[type]}   messageName      [the name of the message]
   * @param  {Function} cb               [called when request interpretation is complete]
   */

  return function interpretSocketReq (socketReq, socketIOCallback, socket, messageName, cb) {

    var msg;

    // If invalid callback function specified, freak out
    if (socketIOCallback && !util.isFunction(socketIOCallback)) {
      msg = 'Invalid socket request Could not be parse :: '+socketReq;
      return sails.log.error(msg);
    }

    // Parse request as JSON (or just use the object if we have one)
    if (! util.isObject(socketReq) && util.isString(socketReq) ) {
      try {
        socketReq = JSON.parse(socketReq);
      } catch (e) {
        msg = 'Invalid socket request! The following JSON could not be parsed :: '+socketReq;
        return emitError(msg);
      }
    }

    // If no URL specified, error out
    if (!socketReq.url) {
      msg = 'No url provided in request: '+socketReq;
      return emitError(msg);
    }

    if (!util.isString(socketReq.url)) {
      msg = 'Invalid url provided in request: ' + socketReq.url;
      return emitError(msg);
    }


    // Grab the metadata for the SDK
    var sdk = getSDKMetadata(socket.handshake);

    // Attached data becomes simulated HTTP body (`req.body`)
    // Allow `params` or `data` to be specified for backwards/sideways-compatibility.
    var bodyParams = util.extend({}, socketReq.params || {}, socketReq.data || {});

    // Get forwarded ip:port from x-forwarded-for header if IIS
    var forwarded = socket.handshake.headers['x-forwarded-for'];
    forwarded = forwarded && forwarded.split(':') || [];

    // Build request object
    var req = {

      // TODO: grab actual transports from socket.io
      transport: 'socket.io',

      method  : getVerb(socketReq, messageName),

      protocol: 'ws',

      ip      : forwarded[0] || socket.handshake.address && socket.handshake.address.address ,

      port  : forwarded[1] || socket.handshake.address && socket.handshake.address.port ,

      url   : socketReq.url,

      socket  : socket,

      isSocket: true,

      // Request params (`req.params`) are automatically parsed from URL path by the private router
      // query : queryParams || {},
      body  : bodyParams || {},

      // Lookup parameter
      param: function(paramName) {

        var key, params = {};
        for (key in (req.params || {}) ) {
          params[key] = req.params[key];
        }
        for (key in (req.query || {}) ) {
          params[key] = req.query[key];
        }
        for (key in (req.body || {}) ) {
          params[key] = req.body[key];
        }

        // Grab the value of the parameter from the appropriate place
        // and return it
        return params[paramName];
      },

      // Allow optional headers
      headers: util.defaults({
        host: sails.config.host
      }, socketReq.headers || {}),

    };


    /**
     * req.header( headerName, [defaultValue] )
     *
     * Backwards compat. for Express 2.x
     * http://expressjs.com/2x/guide.html#req.header()
     *
     * Looks up value of INCOMING request header called `headerName`
     *
     * @api deprecated
     */
    req.header = function getHeader(headerName, defaultValue) {
      var headerValue = req.headers[headerName];
      return (typeof headerValue === 'undefined') ? defaultValue : headerValue;
    };



    /**
     * socket.join()
     * https://github.com/LearnBoost/socket.io/wiki/Rooms
     *
     * Join the specified room (listen for messages/broadcasts to it)
     * Associates the current socket
     *
     * @api public
     * @alias req.listen()
     * @alias req.subscribe()
     */
    req.join = function (room) {

      // TODO: add support for optional callback (for use w/ redis)
      return this.socket.join(roomName);
    };
    req.subscribe = req.join;
    req.listen = req.join;





    // Build response object as stream
    var res = util.extend(new ResStream(), {

      /**
       * http://nodejs.org/api/http.html#http_response_statuscode
       * Equivalent to Node's status code for HTTP.
       *
       * @api private
       */
      statusCode: null,

      /**
       * http://expressjs.com/api.html#res.charset
       * Assign the charset.
       *
       * @defaultsTo 'utf-8'
       * @api public
       */
      charset: 'utf-8'

    });


    /**
     * Set status code
     *
     * http://expressjs.com/api.html#res.status
     *
     * @chainable
     * @api public
     */
    res.status = function setStatusCode (code) {
      res.statusCode = code;
      return res;
    };


    /**
     * Send a response if a callback was specified
     * if no callback was specified, emit event over socket
     *
     * http://expressjs.com/api.html#res.send
     *
     * @api public
     */
    res.send = saveSessionAndThen(req, sails,
    function sendSimpleResponse ( /* [statusCode|body],[statusCode|body] */ ) {
      var args    = normalizeResArgs(arguments),
        statusCode  = args.statusCode,
        body    = args.other;

      // Don't allow users to respond/redirect more than once per request
      onlyAllowOneResponse(res);

      // Ensure statusCode is set
      // (override `this.statusCode` if `statusCode` argument specified)
      this.statusCode = statusCode || this.statusCode || 200;

      // Ensure charset is set
      this.charset = this.charset || 'utf-8';



      // Modern behavior
      // (builds a complete simulation of an HTTP response.)
      if ( sdk.version === '0.10.0' ) {

        var responseCtx = {
          body: body
        };

        // Allow headers and status code to be disabled to allow for squeezing
        // out a little more performance when relevant (and reducing bandwidth usage).
        // To achieve this, set `sails.config.sockets.sendResponseHeaders=false` and/or
        // `sails.config.sockets.sendStatusCode=false`.
        if ( typeof sails.config.sockets === 'object' ) {
          if (sails.config.sockets.sendResponseHeaders) {
            responseCtx.headers = res.headers;
          }
          if (sails.config.sockets.sendStatusCode) {
            responseCtx.statusCode = res.statusCode;
          }
        }

        // Send down response.
        socketIOCallback(responseCtx);
        return res;
      }

      // Backwards compat. for the 0.9.0 version of the sails.io browser SDK
      // (triggers callback with ONLY the response body)
      else {
        socketIOCallback(body);
        return res;
      }

    });



    /**
     * Redirect to a different url
     *
     * @api public
     */
    res.redirect =
    saveSessionAndThen(req, sails,
    function doRedirect ( /* [location|statusCode], [location|statusCode] */ ) {
      var args    = normalizeResArgs(arguments),
        statusCode  = args.statusCode,
        location  = args.other;

      // Don't allow users to respond/redirect more than once per request
      onlyAllowOneResponse(res);

      // Ensure statusCode is set
      res.statusCode = statusCode || res.statusCode || 302;

      // Prevent redirects to public URLs
      var PUBLIC_URL = /^[^\/].+/;
      if ( location.match( PUBLIC_URL ) ) {
        return emitError( Err.invalidRedirect(location) );
      }

      // Set URL for redirect
      req.url = location;

      // Simulate another request at the new url
      sails.emit('router:request', req, res);
    });



    /**
     * Send json response
     *
     * @api public
     */
    res.json = function sendJSON ( /* [statusCode|obj],[statusCode|obj] */ ) {
      var args    = normalizeResArgs(arguments),
        statusCode  = args.statusCode,
        obj     = args.other;

      // TODO: use configured json replacer
      // TODO: use configured json spaces

      var body = obj;

      // Modern behavior
      // (don't stringify JSON- let socket.io take care of it)
      if ( sdk.version === '0.10.0' ) {
        return this.send(statusCode, body);
      }

      // Backwards compat. for the 0.9.0 version of the sails.io browser SDK
      // (safe-stringifies JSON)
      else {
        body = sails.util.stringify(obj);
        if (!body) {
          return sendError('res.json() :: Error stringifying JSON :: ' + obj, 500);
        }
      }


      // send response
      return this.send(statusCode, body);
    };



    /**
     * There isn't really an equivalent for JSONP over sockets
     * so we can just transparently defer to `res.json()`
     *
     * @api public
     */
    res.jsonp = function sendJSONP ( /* [statusCode|obj],[statusCode|obj] */ ) {
      return this.json.apply(this, arguments);
    };


    /**
     * res.header( headerName [,value] )
     *
     * Backwards compat. for Express 2.x
     * http://expressjs.com/2x/guide.html#res.header()
     *
     * Gets or sets value of OUTGOING response header.
     *
     * @api deprecated
     */
    res.header = function getHeader(headerName, value) {

      // Sets `headerName` to `value`
      if (value) {
        return res.set(headerName, value);
      }

      // `res.header(headerName)`
      // Returns value of `headerName`
      return res.get(headerName);
    };


    /**
     * res.set( headerName, value )
     *
     * @param {[type]} headerName [description]
     * @param {[type]} value   [description]
     */
    res.set = function (headerName, value) {
      res.headers = res.headers || {};
      res.headers[headerName] = value;
      return value;
    };

    /**
     * res.get( headerName )
     *
     * @param  {[type]} headerName [description]
     * @return {[type]}            [description]
     */
    res.get = function (headerName) {
      return res.headers && res.headers[headerName];
    };


    /**
     * http://expressjs.com/api.html#res.render
     * http://expressjs.com/api.html#res.locals
     *
     * TODO: Built-in support for rendering view templates (use `consolidate`)
     * TODO: Built-in support for locals
     * TODO: Built-in support for partials
     * TODO: Built-in support for layouts equivalent to the built-in ejs-locals support for HTTP requests
     *
     * @chainable
     * @api unsupported
     * @todo
     */
    res.render = function renderViewOverSockets (view, options, fn) {
      sendError(
        'You are trying to render a view (' + view + '), ' +
        'but Sails doesn\'t support rendering views over Socket.io... yet!\n' +
        'You might consider serving your HTML view normally, then fetching data with sockets ' +
        'in your client-side JavaScript.\n' +
        'If you didn\'t intend to serve a view here, you might look into content-negotiation\n' +
        'to handle AJAX/socket requests explictly, instead of `res.redirect()`/`res.view()`.'
      );
      return res;
    };


    /**
     * Scoped local variables accesible from views
     * see also: http://expressjs.com/api.html#res.locals
     */
    res.locals = (new function Locals (){
      this.partial = function renderPartial () {
        return sendError('View partials not implemented over socket.io.');
      };
    }());

    /**
     * Get or set the value of a local variable in the view
     *
     * Backwards compat. for Express 2.x
     * http://expressjs.com/2x/guide.html#res.local()
     *
     * @chainable
     * @api deprecated
     */
    res.local = function setLocal (localName, value) {
      // `res.local(localName)`
      // Sets `localName` to `value`
      if (value) {
        res.locals[localName] = value;
        return value;
      }

      // `res.local(localName)`
      // Returns value of `localName`
      return res.locals[localName];
    };


    /**
     * http://expressjs.com/api.html#res.format
     *
     * Performs content-negotiation on the request Accept header field when present.
     * This method uses req.accepted, an array of acceptable types ordered by their quality values,
     * otherwise the first callback is invoked. When no match is performed the server responds with
     * 406 "Not Acceptable", or invokes the default callback.
     *
     * The Content-Type is set for you when a callback is selected, however you may alter this within
     * the callback using res.set() or res.type() etc.
     *
     * @chainable
     * @api unsupported
     */
    res.format = todo('format');


    /**
     * http://expressjs.com/api.html#res.download
     * http://expressjs.com/api.html#res.attachment
     * http://expressjs.com/api.html#res.sendfile
     *
     * Serving files is not part of the short-term roadmap for the socket interpreter.
     *
     * @chainable
     * @api unsupported
     */
    res.download = todo('download');
    res.sendfile = todo('sendfile');
    res.attachment = todo('attachment');


    // TODO: Implement support for other `res.*` methods from Express
    res.contentType = todo('contentType');
    res.type = todo('type');
    res.links = todo('links');
    // res.header = todo('header');
    res.clearCookie = todo('clearCookie');
    res.signedCookie = todo('signedCookie');
    res.cookie = todo('cookie');




    /**
     * Access to underlying socket
     *
     * @api public
     */
    res.socket = socket;


    /**
     * Publish some data to a room
     *
     * @param {String} room
     * @param {Object} data
     *
     * @api public
     */
    res.broadcast = function broadcastMessage (room, data) {
      req.socket.broadcast.to(room).json.send(data);
      return res;
    };


    // Populate req.session using shared session store
    sails.session.fromSocket(req.socket, function sessionReady (err, session) {
      if (err) return cb(err);

      // Provide access to session data as req.session
      req.session = session;

      // Now streamify the things
      req = buildReq(req,res);
      res = buildRes(req,res);

      // Pipe response back to the socket.io callback
      // TODO

      // Set request/response timeout
      // TODO

      // Send newly constructed req and res objects back to router
      cb(null, {
        req: req,
        res: res
      });

      // Pump client request body to the IncomingMessage stream (req)
      // Req stream ends automatically if this is a GET or HEAD or DELETE request
      // (since there is no request body in that case)
      if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'DELETE') {
        // Only write the body if there IS a body.
        if (req.body) {
          req.write(req.body);
        }
        req.end();
      }

    });




    // Respond with a message indicating that the feature is not compatible with sockets
    function notSupportedError() {
      return sendError('Trying to invoke unsupported response method (`res.foo`) in response to a request from socket.io!');
    }

    // Return function which responds with a message indicating that the method
    // is not yet implemented
    function todo (method) {
      return function () {
        return sendError(
          'res.' + method + '() is not yet supported over socket.io.  '+
          'If you need this functionality, please don\'t hesitate to get involved!'
        );
      };
    }

    // Respond with an error message
    function sendError(errmsg, statusCode) {
      sails.log.warn(errmsg);
      res.json( statusCode || 500, {
        error: errmsg
      });
    }

    /**
     * Send a low-level error back over the socket
     * (useful in cases where basic interpreter plumbing is not working)
     *
     * Request callback function will NOT be triggered!
     * Instead, an error message will be emitted.
     */
    function emitError (error) {

      // TODO: implement best practice for socket.io error reporting

      // TODO: something like this..?
      // e.g.
      // socket.emit('sails__500', 'error');

      // ********************************************************
      // WARNING
      //
      // This is a breaking change!!
      // Do not implement until next minor release (0.10.0)
      //
      // Will require documentation of clear steps in changelog
      // and some changes in bundled client-side SDK, i.e.
      // assets/js/sails.io.js
      // -AND-
      // assets/linker/js/sails.io.js
      // ********************************************************

      ////////////////////////////////////
      // But for now:
      ////////////////////////////////////

      // Log error
      sails.log.error(error);

      // If callback is invalid or non-existent:
      if ( !util.isFunction(socketIOCallback) ) {
        // do nothing...
        return;
      }

      // Otherwise just send the error directly to the callback...
      socketIOCallback(error);
    }


    /**
     * NOTE: ALL RESPONSES (INCLUDING REDIRECTS) ARE PREVENTED ONCE THE RESPONSE HAS BEEN SENT!!
     * Even though this is not strictly required with sockets, since res.redirect()
     * is an HTTP-oriented method from Express, it's important to maintain consistency.
     *
     * @api private
     */
    function onlyAllowOneResponse () {
      // TODO
      return;
    }

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
      var isTraditionalUsage =
        'number' !== typeof args[0] &&
        ( !args[1] || 'number' === typeof args[1] );

      if ( isTraditionalUsage ) {
        return {
          statusCode: args[1],
          other: args[0]
        };
      }

      // Explicit usage, i.e. Express 3:
      // `method( statusCode [,other] )`
      return {
        statusCode: args[0],
        other: args[1]
      };
    }
  };


};
