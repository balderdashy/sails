module.exports = function (sails) {

	
	/**
	 * Module dependencies.
	 */

	var util		= require('../../../util'),
		ResStream	= require('./ResStream'),
		Session		= require('../../../session')(sails),
		Qs			= require ('querystring');


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
	 * Emulates to Express semantics by mocking request (`req`) and response (`res`)
	 */
	return function interpretSocketReq (socketReq, socketIOCallback, socket, verb, cb) {

		var msg;

		// If invalid callback function specified, freak out
		if (socketIOCallback && !util.isFunction(socketIOCallback)) {
			msg = 'Invalid socket request! The following JSON could not be parsed :: '+socketReq;
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

		// Parse query string (`req.query`)
		var queryStringPos = socketReq.url.indexOf('?');
		var queryParams =	( queryStringPos === -1 ) ? 
							{} : 
							Qs.parse( socketReq.url.substr(queryStringPos + 1) );

		// Attached data becomes simulated HTTP body (`req.body`)
		var bodyParams = util.extend({}, socketReq.params || {}, socketReq.data || {});

		// Parse out enough information from message to mock an HTTP request
		var path = socketReq.url;

		// Build request object
		var req = {
			
			// TODO: grab actual transports from socket.io
			transport: 'socket.io',

			method	: verb,

			protocol: 'ws',

			ip      : socket.handshake.address.address ,

			port	: socket.handshake.address.port ,

			url		: socketReq.url,

			socket	: socket,

			// Backwards compatibility for isSocket qualifier
			isSocket: true,

			// Request params (`req.params`) are automatically parsed from URL path by slave router
			query	: queryParams || {},
			body	: bodyParams || {},

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
		req.join = function (roomName) {

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
		res.send =
		saveSessionAndThen(
		function sendSimpleResponse (	/* [statusCode|body],[statusCode|body] */ ) {
			var args		= normalizeResArgs(arguments),
				statusCode	= args.statusCode,
				body		= args.other;

			// Don't allow users to respond/redirect more than once per request
			onlyAllowOneResponse(res);

			// Ensure statusCode is set
			// (override `this.statusCode` if `statusCode` argument specified)
			this.statusCode = statusCode || this.statusCode || 200;

			// Ensure charset is set
			this.charset = this.charset || 'utf-8';

			// Trigger callback with response body
			// TODO: and headers
			// TODO: and status code
			socketIOCallback(body);
			return res;
		});
		


		/**
		 * Redirect to a different url
		 *
		 * @api public
		 */
		res.redirect =
		saveSessionAndThen(
		function doRedirect ( /* [location|statusCode], [location|statusCode] */ ) {
			var args		= normalizeResArgs(arguments),
				statusCode	= args.statusCode,
				location	= args.other;

			// Don't allow users to respond/redirect more than once per request
			onlyAllowOneResponse(res);

			// Ensure statusCode is set
			res.statusCode = statusCode || res.statusCode || 302;

			// Prevent redirects to public URLs
			var PUBLIC_URL = /^[^\/].+/;
			if ( location.match( PUBLIC_URL ) ) {
				return emitError( Err.invalidRedirectLocation(location) );
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
			var args		= normalizeResArgs(arguments),
				statusCode	= args.statusCode,
				obj			= args.other;

			// Stringify JSON and send response
			var body;
			try { body = JSON.stringify(obj); }
			catch (e) {
				return sendError('res.json() :: Error stringifying JSON!\n' + e, 500);
			}

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
			// `res.header(headerName, value)` 
			// Sets `headerName` to `value`
			if (value) {
				res.headers[headerName] = value;
				return value;
			}

			// `res.header(headerName)`
			// Returns value of `headerName`
			return res.headers[headerName];
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
				'You are trying to render a view (' + view + ') over sockets, ' +
				'but Sails doesn\'t support rendering views over Socket.io... yet!\n' +
				'You might consider serving your HTML view normally, then fetching data with sockets ' +
				'in your client-side JavaScript.'
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
		 * Serving files is not part of the short-term roadmap for the socket interpreter.
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
		res.header = todo('header');
		res.set = todo('set');
		res.get = todo('get');
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
		 * @api public
		 * @alias
		 * @alias res.publish()
		 */
		res.broadcast = function broadcastMessage (room, data) {
			req.socket.broadcast.to(room).json.send(data);
			return res;
		};
		res.publish = res.broadcast;






		// Retrieve session data from store
		var sessionKey = socket.handshake.sessionID;

		Session.get(sessionKey, function (err, sessionData) {

			if (err) {
				sails.log.error('Error retrieving session: ' + err);
				return cb('Error retrieving session: ' + err);
			}

			// Create session for first time if necessary
			if (!util.isObject(sessionData)) {
				
				// sails.log.error('No session data returned, and an error was encountered saving session data for the first time: ' + err);
				
				// If you're here, you're authorized, so no need to do that again
				// Instead, create a new session
				sessionData = {
					cookie: { path: '/', httpOnly: true, maxAge: null }
				};
				
				return emitError('No session data returned, and an error was encountered saving session data for the first time: ' + err);
				
			}
			// Otherwise session exists and everything is ok.
			

			// Add method to trigger a save() of the session data
			function SocketIOSession () {
				this.save = function (cb) {
					Session.set(sessionKey, req.session, function (err) {
						if (err) {
							sails.log.error('Error encountered saving session:');
							sails.log.error(err);
						}
						if (cb) cb(err);
					});
				};
			}

			// Instantiate SocketIOSession
			req.session = new SocketIOSession();

			// Provide access to session data in req.session
			util.extend(req.session, sessionData);

			return cb(null, {
				req: req,
				res: res
			});
			
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
		function sendError(errmsg) {
			sails.log.warn(errmsg);
			res.json({
				error: errmsg,
				success: false
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
		 *		method( [statusCode|other], [statusCode|other] )
		 *
		 * This avoids confusing errors & provides Express 2.x backwards compat.
		 *
		 * E.g. usage in res.send():
		 *		var args		= normalizeResArgs.apply(this, arguments),
		 *			body		= args.other,
		 *			statusCode	= args.statusCode;
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

		// Returns function which saves session, then triggers callback.
		//
		// Session is saved automatically when:
		//	+ res.send() or res.json() is called
		//	+ res.redirect() is called
		//	+ TODO: res receives an 'end' event from a stream piped into it
		function saveSessionAndThen(cb) {
			return function saveSession () {
				var ctx = this,
					args = Array.prototype.slice.call(arguments);

				req.session.save(function (err) {
					if (err) {
						sails.log.error('Session could not be persisted:',err);
					}
					cb.apply(ctx,args);
				});
			};
		}
	};


};
