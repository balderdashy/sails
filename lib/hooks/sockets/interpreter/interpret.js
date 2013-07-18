module.exports = function (sails) {

	
	/**
	 * Module dependencies.
	 */

	var _			= require('lodash'),
		ResStream	= require('./ResStream'),
		Session		= require('../../../session')(sails);


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
		if (! _.isObject(socketReq)) {
			try {
				socketReq = JSON.parse(socketReq);
			} catch(e) {
				msg = 'Invalid socket request! The following JSON could not be parsed :: '+socketReq;
				if (socketIOCallback) return socketIOCallback(msg);
				
				return sails.log.error(msg);
			}
		}

		if (!socketReq.url) {
			msg = 'No url provided in request: '+socketReq;
			if (socketIOCallback) return socketIOCallback(msg);
			
			return sails.log.error(msg);
		}

		// Parse out enough information from message to mock an HTTP request
		var path = socketReq.url;
		var socketIOData = _.extend({}, socketReq.params || {}, socketReq.data || {});

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

			// Simulate the request body
			body	: socketIOData,

			// Lookup parameter
			param: function(paramName) {
				return	(req.params && req.params[paramName]) ||
						(req.body && req.body[paramName]) || 
						(req.query && req.query[paramsName]);
			},
			headers: {
				// TODO: pass down actual host with socket request
				host: sails.config.host
			},
			header: function(attrName,value) {
				return this.headers[attrName];
			},

			// Listen to broadcasts from a room
			listen: function (room) {
				return this.socket.join(room);
			}
		};


		// Build response object as stream
		var res = _.extend(new ResStream(), {

			socket: socket,

			// Send response
			send: function(body, status) {
				// (session is saved automatically when responding)
				req.session.save(function (err) {
					if (err) {
						sails.log.error('Session could not be persisted:',err);
					}

					if (_.isFunction(socketIOCallback)) {
						socketIOCallback(body);
						return;
					}
					sails.log.error('Cannot call res.send(): invalid socket.io callback specified from client!');
				});
			},

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
				return sendError('Sails refusing to render view over socket.  Is that really what you wanted?');
			},

			// Redirect to a different url
			// NOTE: Redirect is NOT prevented if response has already been sent
			// (worth noting, since this this is different than the HTTP version of res.redirect())
			redirect: function(pathOrStatusCode, path) {
				// (session is saved automatically when redirecting)
				req.session.save(function (err) {

					// Do redirect (run proper controller method)
					req.url = path || pathOrStatusCode;
					res.statusCode = !path || +pathOrStatusCode || 302;
					sails.emit('request', req, res);
				});
			},

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


			contentType: notSupportedError,
			type: notSupportedError,
			header: notSupportedError,
			set: notSupportedError,
			get: notSupportedError,
			clearCookie: notSupportedError,
			signedCookie: notSupportedError,
			cookie: notSupportedError
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
				// sessionData = {
					// cookie: { path: '/', httpOnly: true, maxAge: null }
				// };
				// sails.log.verbose('Saving session for first time:');

				// TODO: rerun authorization strategy here
				
				sails.log.error('No session data returned, and an error was encountered saving session data for the first time: ' + err);
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




		// Respond with a message indicating that the feature is not currently supported
		function notSupportedError() {
			return sendError('That method is not available over socket.io!');
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