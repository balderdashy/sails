/**
 * Module dependencies
 */


module.exports = function(sails) {


	/**
	 * Module dependencies.
	 */

	var interpret	= require('./interpreter/interpret')(sails),
		_			= require('lodash');



	/**
	 * Fired after a socket is connected
	 */

	return function onConnect (socket) {
		sails.log.verbose('A socket.io client ('+ socket.id + ') connected successfully!');

		// Listen for incoming socket requests on the `message` endpoint
		// (legacy support for 0.8.x sails.io clients)
		// mapRoute('message');

		// Verb events
		// (supports sails.io clients 0.9 and up)
		mapRoute('get');
		mapRoute('post');
		mapRoute('put');
		mapRoute('delete');
		mapRoute('patch');
		mapRoute('options');
		mapRoute('head');


		// Configurable custom onConnect logic runs here:
		////////////////////////////////////////////////////////////////////////

		// (default: do nothing)
		if (sails.config.sockets.onConnect) {
			sails.session.fromSocket(socket, function sessionReady (err, session) {

				// If an error occurred loading the session, log what happened
				if (err) {
					sails.log.error(err);
					return;
				}

				// But continue on to run event handler either way
				sails.config.sockets.onConnect(session, socket);

			});
		}

		// Configurable custom onConnect logic here
		// (default: do nothing)
		if (sails.config.sockets.onDisconnect) {
			socket.on('disconnect', function onSocketDisconnect () {
				sails.session.fromSocket(socket, function sessionReady (err, session) {

					// If an error occurred loading the session, log what happened
					if (err) {
						sails.log.error(err);
						return;
					}

					// But continue on to run event handler either way
					sails.config.sockets.onDisconnect(session, socket);
				});
		  });
		}



		/**
		 * Map a socket message to the router using the request interpreter.
		 *
		 * @param  {String} messageName [name of our socket endpoint]
		 */
		function mapRoute (messageName) {

			socket.on(messageName, function (incomingSailsIOSocketMsg, callback) {
				sails.log.verbose('Routing message over socket: ', incomingSailsIOSocketMsg);

				// ???
				callback = callback || function noCallbackWarning(body, status) {
					sails.log.error('No callback specified!');
				};

				// Translate socket.io message to an Express-looking request
				interpret(incomingSailsIOSocketMsg, callback, socket, messageName, function requestBuilt (err, requestCtx) {

					// If interpretation fails, log the error and do nothing
					if (err) return sails.log.error(err);

					// Otherwise, emit the now-normalized request to the Sails router
					// as a normal runtime request.
					sails.emit('router:request', requestCtx.req, requestCtx.res);
				});

			});
		}



	};

};
