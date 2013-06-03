var async = require('async');
var _ = require('lodash');

// Used to warn about possible issues if lift() is taking a very long time
var liftAbortTimer;

// Initialize the app
module.exports = function initSails(cb) {

	// Indicate that server is starting
	sails.log("Starting app at " + sails.config.appPath + "...");

	async.auto({

		bindBeforeShutdown: function (cb) {
			// Add beforeShutdown event
			var exiting;
			process.on('SIGINT', function() {
				beforeShutdown();
			});
			process.on('SIGTERM', function() {
				beforeShutdown();
			});
			process.on('exit', function() {
				if (!exiting) beforeShutdown();
			});
			function beforeShutdown() {
				exiting = true;
				if(_.isFunction(sails.config.beforeShutdown)) {
					sails.config.beforeShutdown();
				}
			}
			cb();
		},

		startServer: function (cb) {

			// Start Express server (implicitly starts socket.io)
			// If host is explicitly declared, include it in express's listen() call
			if (sails.explicitHost) {
				sails.log.verbose("Restricting access to explicit host: "+sails.explicitHost);
				sails.express.server.listen(sails.config.port, sails.explicitHost, cb);
			}
			else {
				sails.express.server.listen(sails.config.port, cb);
			}

			// Start timer in case this takes suspiciously long...
			liftAbortTimer = setTimeout(function failedToStart(){
				sails.log.warn("");
				sails.log.warn("Server doesn't seem to be starting.");
				sails.log.warn("Perhaps something else is already running on port "+sails.config.port+ " with hostname " + sails.explicitHost + "?");
			}, 2500);
		},

		verifyServerStartedSuccessfully: function (cb) {

			// Check for port conflicts
			// Ignore this check if explicit host is set
			if(!sails.explicitHost && !sails.express.server.address()) {
				sails.log.error('Trying to start server on port ' + sails.config.port + '...');
				sails.log.error('But something else is already running on that port!');
				sails.log.error('Please disable the other server, or choose a different port, and try again.');
				process.exit(1);
			}

			cb();
		}

	}, function (err) {
		clearTimeout(liftAbortTimer);
		return cb && cb(err);
	});

};

