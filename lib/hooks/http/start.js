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

				// Start Express server (implicitly starts socket.io)
				// If host is explicitly declared, include it in express's listen() call
				if (sails.explicitHost) {
					sails.log.verbose('Restricting access to explicit host: '+sails.explicitHost);
					sails.express.server.listen(sails.config.port, sails.explicitHost, cb);
				}
				else {
					sails.express.server.listen(sails.config.port, cb);
				}

				// Start timer in case this takes suspiciously long...
				liftAbortTimer = setTimeout(function failedToStart() {
					console.log('');
					sails.log.error('Server doesn\'t seem to be starting.');
					sails.log.error('Perhaps something else is already running on port ' + sails.config.port + 
									(sails.explicitHost ? (' with hostname ' + sails.explicitHost) : '') + 
									'?');
				}, 500);
			},

			verify: ['start', function (cb) {

				// Check for port conflicts
				// Ignore this check if explicit host is set
				if(!sails.explicitHost && !sails.express.server.address()) {
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

			// Announce that express is now listening on a port
			sails.emit('hook:http:listening');

			cb && cb(err);
		});
	};

};
