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
					sails.log.warn('');
					sails.log.warn('Server doesn\'t seem to be starting.');
					sails.log.warn('Perhaps something else is already running on port '+sails.config.port+ ' with hostname ' + sails.explicitHost + '?');
				}, 2500);
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

			// Output server information to console
			sails.log();
			sails.log('Port: ' + sails.config.port);
			sails.explicitHost && sails.log('Host: ' + sails.explicitHost);
			if (sails.config.environment === 'development') {
				var usingSSL = ( ( sails.config.serverOptions && sails.config.serverOptions.key && sails.config.serverOptions.cert ) ||
					( sails.config.express && sails.config.express.serverOptions && sails.config.express.serverOptions.key && sails.config.express.serverOptions.cert ));
				sails.log('( to see your app, visit: ' + ( usingSSL ? 'https' : 'http' ) + '://' + sails.config.host + ':' + sails.config.port + ' )');
			}

			// Announce that express is now listening on a port
			sails.emit('hook:http:listening');

			cb && cb(err);
		});
	};

};
