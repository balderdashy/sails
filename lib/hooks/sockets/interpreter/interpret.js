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
		invalidRequestCallback: function (cb) {
			new Error(
				'Invalid callback specified in socket request :: ' +
				util.inspect(cb)
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
				if (socketIOCallback) return socketIOCallback(msg);
				return sails.log.error(msg);
			}
		}

		// If no URL specified, error out
		if (!socketReq.url) {
			msg = 'No url provided in request: '+socketReq;
			if (socketIOCallback) return socketIOCallback(msg);
			return sails.log.error(msg);
		}

		if (!util.isString(socketReq.url)) {
			msg = 'Invalid url provided in request: ' + socketReq.url;
			if (socketIOCallback) return socketIOCallback(msg);
			return sails.log.error(msg);
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
		 * req.header( headerName [,value] )
		 * Backwards compat. for Express 2.x
		 * Gets or sets value of a header.
		 *
		 * @api deprecated
		 */
		req.header = function getHeader(headerName, value) {
			// `req.header(headerName, value)` sets `headerName` to `value`
			if (value) {
				req.headers[headerName] = value;
				return value;
			}

			// `req.header(headerName)` returns value of `headerName`
			return this.headers[headerName];
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
			return this.socket.join(room);
		};
		req.subscribe = req.join;
		req.listen = req.join;


		// Returns function which saves session, then triggers callback.
		//
		// Session is saved automatically when:
		//	+ res.send() or res.json() is called
		//	+ res.redirect() is called
		//	+ TODO: res receives an 'end' event from a stream piped into it
		function saveSessionAndThen(cb) {
			return function () {
				var ctx = this, args = arguments;
				req.session.save(function (err) {
					if (err) {
						sails.log.error('Session could not be persisted:',err);
					}
					cb.apply(ctx,args);
				});
			};
		}


		// Build response object as stream
		var res = util.extend(new ResStream(), {


			/**
			 * http://expressjs.com/api.html#res.status
			 *
			 * Equivalent to HTTP's status code
			 *
			 * @api public
			 */
			statusCode: 200,


			/**
			 * http://expressjs.com/api.html#res.status
			 *
			 * @chainable
			 * @api public
			 */
			status: function (code) {
				res.statusCode = code;
				return res;
			},


			/**
			 * res.send
			 *
			 * @chainable
			 * @api public
			 */
			send:
			saveSessionAndThen(
			function sendResponse (	/* [statusCode|body],[statusCode|body] */ ) {
				var args		= normalizeResArgs(arguments),
					statusCode	= args.statusCode,
					body		= args.other;

				// Use statusCode override if specified,
				// or use the one already set on the response
				// or default to 200
				this.statusCode = statusCode || this.statusCode || 200;

				// If callback is invalid or non-existent
				// Log error and emit an emergency error message to the socket instead
				if ( !util.isFunction(socketIOCallback) ) {
					
					
					sails.log.error();
					emitError();
					return res;
				}

				// Trigger callback with response body
				// TODO: and headers
				// TODO: and status code
				socketIOCallback(body);
				return res;
			}),


			/**
			 * Send json response
			 *
			 * @chainable
			 * @api public
			 */
			json: function sendJSONResponse( /* [statusCode|obj],[statusCode|obj] */ ) {
				var args		= normalizeResArgs(arguments),
					statusCode	= args.statusCode,
					obj			= args.other;

				// Override statusCode if specified
				this.statusCode = statusCode || this.statusCode;

				// Stringify JSON and send response
				var body;
				try {
					body = JSON.stringify(obj);
				}
				catch (e) {
					return sendError('res.json() :: Error stringifying JSON!\n' + e, 500);
				}

				// Ensure charset is set
				this.charset = this.charset || 'utf-8';

				return this.send(body, statusCode);
			},



			/**
			 * There isn't really an equivalent for JSONP over sockets
			 * so we can just transparently defer to `res.json()`
			 *
			 * @chainable
			 * @api public
			 */
			jsonp: function ( /* [statusCode|obj],[statusCode|obj] */ ) {
				return this.json.apply(this, arguments);
			},
			


			/**
			 * Redirect to a different url
			 * NOTE: Redirect is NOT prevented if response has already been sent
			 * (worth noting, since this this is different than the HTTP version of res.redirect())
			 */

			redirect: saveSessionAndThen( function doRedirect ( /* [location|statusCode], [location|statusCode] */ ) {
				
				// Do redirect (run proper controller method)
				req.url = location || pathOrStatusCode;
				res.statusCode = !location || +pathOrStatusCode || 302;

				// TODO:	handle redirects to extra-domain URLs
				//			btw: "handle" here should probably actually mean returning an error
				//			saying something like: 'Unable redirect to another domain (foo.com) via sockets'
				if (location) {}

				// Simulate another request at the new url
				sails.emit('router:request', req, res);
			}),


			// TODO: Implement support for these `res.*` methods from Express
			contentType: todo('contentType'),
			type: todo('type'),
			links: todo('links'),
			header: todo('header'),
			set: todo('set'),
			get: todo('get'),
			clearCookie: todo('clearCookie'),
			signedCookie: todo('signedCookie'),
			cookie: todo('cookie')

		});



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
		 * Set the value of a local variable in the view
		 * (no longer officially in Express docs but included for backwards compatiblity)
		 *
		 * @chainable
		 * @api deprecated
		 */
		res.local = function setLocal (attrName, value) {
			res.locals[attrName] = value;
			return res;
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
				
				return socketIOCallback && socketIOCallback('No session data returned, and an error was encountered saving session data for the first time: ' + err);
				
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
		 * As long as one of them is a number (i.e. a status code),
		 * allows a 2-nary method to be called with flip-flopped arguments:
		 *		method( [statusCode|other], [statusCode|other] )
		 *
		 * This avoids confusing errors & provides Express 2.x backwards compat.
		 *
		 * E.g. usage in res.send():
		 *		var args		= normalizeResArgs.apply(this,arguments),
		 *			body		= args.other,
		 *			statusCode	= args.statusCode;
		 * 
		 * @api private
		 */
		function normalizeResArgs() {
			var statusCode, other;
			if ('number' !== typeof other && 'number' === typeof arguments[1]) {
				statusCode = arguments[1];
				other = arguments[0];
			}
			else {
				statusCode = arguments[0];
				other = arguments[1];
			}
			return { statusCode: statusCode, other: other };
		}
	};


};