module.exports = function (sails) {

	
	/**
	 * Module dependencies.
	 */

	var _			= require('lodash'),
		ResStream	= require('./ResStream'),
		Session		= require('../../../session')(sails),
		Qs			= require ('querystring');


	// Interpret an incoming socket.io message to Express semantics
	// Mock request and response objects
	return function interpret (socketReq, socketIOCallback, socket, verb, cb) {

		var msg;

		// If invalid callback function specified, freak out
		if (socketIOCallback && !_.isFunction(socketIOCallback)) {
			msg = 'Invalid socket request! The following JSON could not be parsed :: '+socketReq;
			return sails.log.error(msg);
		}

		// Parse request as JSON (or just use the object if we have one)
		if (! _.isObject(socketReq) && _.isString(socketReq) ) {
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

		if (!_.isString(socketReq.url)) {
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
		var bodyParams = _.extend({}, socketReq.params || {}, socketReq.data || {});

		// Parse out enough information from message to mock an HTTP request
		var path = socketReq.url;

		// Build request object
		var req = {
			
			// TODO: grab actual transports from socket.io
			transport: 'socket.io',

			method	: verb,

			protocol: 'ws',

			port	: sails.config.port,

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
			headers: _.defaults({
				host: sails.config.host
			}, socketReq.headers || {}),

			header: function(attrName,value) {
				return this.headers[attrName];
			},

			// Listen to broadcasts from a room
			listen: function (room) {
				return this.socket.join(room);
			}
		};


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
			}
		}

		// Build response object as stream
		var res = _.extend(new ResStream(), {

			socket: socket,

			// Send response
			send: saveSessionAndThen( function respond (body, status) {
				if (_.isFunction(socketIOCallback)) {
					socketIOCallback(body);
					return;
				}
				sails.log.error('Cannot call res.send(): invalid socket.io callback specified from client!');
			}),

			// Publish some data to a model or collection
			broadcast: function (room, data) {
				req.socket.broadcast.to(room).json.send(data);
			},

			// Send json response
			json: function(obj, status) {
				var body = JSON.stringify(obj);
				this.charset = this.charset || 'utf-8';
				return this.send(body, status);
			},

			// Render a view
			render: function(view, options, fn) {
				// TODO: allow this 
				// (use the `consolidate` within our slave instance of Express)
				return sendError('Sails refusing to render view over socket.  Is that really what you wanted?');
			},

			// Redirect to a different url
			// NOTE: Redirect is NOT prevented if response has already been sent
			// (worth noting, since this this is different than the HTTP version of res.redirect())
			redirect: saveSessionAndThen( function doRedirect (pathOrStatusCode, path) {
				// Do redirect (run proper controller method)
				req.url = path || pathOrStatusCode;
				res.statusCode = !path || +pathOrStatusCode || 302;
				sails.emit('request', req, res);
			}),

			// Scoped variables accesible from views
			viewData: {
				// TODO: do true implementation of view partials
				partial: function () {}
			},
			locals: function(newLocals) {
				res.viewData = _.extend(res.viewData, newLocals);
			},

			local: function(attrName, value) {
				res.viewData[attrName] = value;
			},

			// TODO: Support
			download: todo('download'),
			contentType: todo('contentType'),
			type: todo('type'),
			header: todo('header'),
			set: todo('set'),
			get: todo('get'),
			clearCookie: todo('clearCookie'),
			signedCookie: todo('signedCookie'),
			cookie: todo('cookie'),

			// Will not support:
			attachment: notSupportedError,
			sendfile: notSupportedError
		});

		// Aliases
		req.subscribe = req.listen;
		res.publish = res.broadcast;

		// Retrieve session data from store
		var sessionKey = socket.handshake.sessionID;

		Session.get(sessionKey, function (err, sessionData) {

			if (err) {
				sails.log.error('Error retrieving session: ' + err);
				return cb('Error retrieving session: ' + err);
			}

			// Create session for first time if necessary
			if (!_.isObject(sessionData)) {
				
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
			_.extend(req.session, sessionData);

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
			}
		}

		// Respond with an error message
		function sendError(errmsg) {
			sails.log.warn(errmsg);
			res.json({
				error: errmsg,
				success: false
			});
		}
	};


};