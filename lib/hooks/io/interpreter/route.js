
/**
 * NOTE:
 * This module will be drastically simplified in the new Sails 0.9 router.
 */

 
// Load routes config
var _ = require('lodash');
var Router = require('../../router');

module.exports = route;

// Get auth/access control library
function route (socketReq, fn, socket, messageName) {

	// Parse request as JSON (or just use the object if we have one)
	if (! _.isObject(socketReq)) {
		try {
			socketReq = JSON.parse(socketReq);
		} catch(e) {
			var msg = 'Invalid socket request! The following JSON could not be parsed :: '+socketReq;
			if (fn) return fn(msg);
			else return sails.log.error(msg);
		}
	}

	if (!socketReq.url) {
		var msg = 'No url provided in request: '+socketReq;
		if (fn) return fn(msg);
		else return sails.log.error(msg);
	}


	// Parse url for entity and action using routing table if possible
	var entityAction = Router.fetchRoute(socketReq.url, require('./getVerb')(socketReq, messageName));

	// If url is in routes table, explicitly define mapped route to entityAction
	var handlerFn;
	if(entityAction && _.isObject(entityAction)) {
		socketReq = _.extend(socketReq, entityAction);
		handlerFn = Router.handleRequest(entityAction);
	} else {
		handlerFn = Router.handleRequest();
	}

	// Retrieve session data from store
	var sessionKey = socket.handshake.sessionID;

	require('../../session/get')(sessionKey, function (err, sessionData) {

		// Simulate Express/Connect request context
		var expressContext = require('./interpret')(socketReq, fn, socket, messageName);

		if (err) {
			sails.log.error('Error retrieving session: ' + err);
			return fn('Error retrieving session: ' + err);
		}

		// Create session for first time if necessary
		if (!_.isObject(sessionData)) {
			sessionData = {
				cookie: { path: '/', httpOnly: true, maxAge: null }
			};
			sails.log.verbose('Saving session for first time:');
			// sails.log.error(err);
			// return fn('No session data returned, and an error was encountered saving session data for the first time: ' + err);
		}
		// Otherwise session exists and everything is ok.
		

		// Add method to trigger a save() of the session data
		function SocketIOSession () {
			this.save = function (cb) {
				require('../../session/set')(sessionKey, expressContext.req.session, function (err) {
					if (err) {
						sails.log.error('Error encountered saving session:');
						sails.log.error(err);
					}
					if (cb) cb(err);
				});
			};
		}

		// Instantiate SocketIOSession
		expressContext.req.session = new SocketIOSession();

		// Provide access to session data in req.session
		_.extend(expressContext.req.session, sessionData);

		// Call handler action using the simulated express context
		handlerFn(expressContext.req, expressContext.res, function () {

			// Call next middleware
			_.isFunction(expressContext.next) && expressContext.next();
		});
	});
}
