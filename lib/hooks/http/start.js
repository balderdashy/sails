module.exports = function (sails) {

	/**
	 * Module dependencies.
	 */

	var async			= require('async');


	return function startServer (cb) {

		// Used to warn about possible issues if starting the server is taking a very long time
		var liftAbortTimer;

		async.auto({

			start: function (cb) {

				var explicitHost = sails.config.explicitHost;

				// Start Express server (implicitly starts socket.io)
				// If host is explicitly declared, include it in express's listen() call
				if (explicitHost) {
					sails.log.verbose('Restricting access to explicit host: '+explicitHost);
					sails.hooks.http.server.listen(sails.config.port, explicitHost, cb);
				}
				else {
					sails.hooks.http.server.listen(sails.config.port, cb);
				}

				// Start timer in case this takes suspiciously long...
				liftAbortTimer = setTimeout(function failedToStart() {
					console.log('');
					sails.log.error('Server doesn\'t seem to be starting.');
					sails.log.error('Perhaps something else is already running on port ' + sails.config.port + 
									(explicitHost ? (' with hostname ' + explicitHost) : '') + 
									'?');
				}, 500);
			},

			verify: ['start', function (cb) {
				var explicitHost = sails.config.explicitHost;

				// Check for port conflicts
				// Ignore this check if explicit host is set, since other more complicated things might be going on.
				if( !explicitHost && !sails.hooks.http.server.address() ) {
					var portBusyError = '';
					portBusyError += 'Trying to start server on port ' + sails.config.port + '...';
					portBusyError += 'But something else is already running on that port!';
					portBusyError += 'Please disable the other server, or choose a different port, and try again.';
					sails.log.error(portBusyError);
					throw new Error(portBusyError);
				}

				cb();
			}]

		}, function expressListening (err) {
			clearTimeout(liftAbortTimer);
			
			if (err) return cb(err);

			// Announce that express is now listening on a port
			sails.emit('hook:http:listening');

			cb && cb(err);
		});
	};

};
