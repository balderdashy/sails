module.exports = function (sails) {

	/**
	 * Module dependencies.
	 */

	var async = require('async'),
			cluster = require('cluster'),
			path = require('path'),
			utils = require('utilities'),
			file = utils.file,
			workerCount = sails.config.workers,
			starter = process.argv[1].split(path.sep).pop(),
			$getServer = cluster._getServer;

	function cycleWorkers() {
		sails.log.debug('Cycling Worker Processes...'.grey);
		Object.keys(cluster.workers).forEach(function(id) {
			cluster.workers[id].kill();
		});
	}

	// patch to correct undefined port property. not yet addressed in node.
	cluster._getServer = function(tcpSelf, address, port, addressType, fd, cb) {
		var $address;
		$address = tcpSelf.address;
		tcpSelf.address = function() {
			address = $address.apply(tcpSelf, arguments);
			if (!address) {
				address = {
					port: port
				};
			}
			return address;
		};
		return $getServer.apply($getServer, arguments);
	};

	return function startServer (cb) {
		// Used to warn about possible issues if starting the server is taking a very long time
		var liftAbortTimer;
		var liftTimeout = sails.config.liftTimeout || 500;
		var i;

		// master process returns after forking the workers
		// we only want to fork if the originator script was sails.js
		// otherwise we would be forking mocha, forever, etc.
		// in instances where the starting script wasn't sails, 
		// we'll skip this block and start as a single-thread app.
		if (cluster.isMaster && starter.split('.')[0] === 'sails' && workerCount > 0) {
			cluster
				.on('exit', function workerExited(worker, code, signal) {
					sails.log.info(('Worker exited (pid: ' + worker.process.pid + ')').grey);
					// fork a replacement worker anytime one exits.
					cluster.fork();
				})
				.on('listening', function workerListening(worker) {
					sails.log.info(('Worker forked (pid: ' + worker.process.pid + ')').grey);
				});

			for (i = workerCount - 1; i >= 0; i--) {
				cluster.fork();
			};

			if(sails.config.environment === 'development') {
				// watch for file changes in the api directory in development environment
				file.watch(path.join(sails.config.appPath, 'api'), function fileChanged(file) {
					sails.log.info(file.grey + ' has changed.'.grey);
					cycleWorkers();
				});
			}
			return cb && cb();
		} else {

			async.auto({

				// Start Express server
				start: function (cb) {

					var explicitHost = sails.config.explicitHost;

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

						// Figure out if this user is on Windows
						var isWin = !!process.platform.match(/^win/);

						// If server isn't starting, provide general troubleshooting information,
						// sharpened with a few simple heuristics:
						console.log('');
						sails.log.error('Server doesn\'t seem to be starting.');
						sails.log.error();
						sails.log.error('Troubleshooting tips:');
						sails.log.error();
						

						// 1. Unauthorized 
						if (sails.config.port < 1024) {
							sails.log.error(
							' -> Do you have permission to use port ' + sails.config.port + ' on this system?',
							// Don't mention `sudo` to Windows users-- I hear you guys get touchy about that sort of thing :)
							(isWin) ? '' : '(you might try `sudo`)'
							);
							
							sails.log.error();
						}

						// 2. Invalid or unauthorized explicitHost configuration.
						if (explicitHost) {
							sails.log.error(
							' -> You might remove your explicit host configuration and try lifting again (you specified',
							'`'+explicitHost+'`',
							'.)');

							sails.log.error();
						}

						// 3. Something else is running on this port
						sails.log.error(
						' -> Is something else already running on port', sails.config.port,
						(explicitHost ? (' with hostname ' + explicitHost) : '') + '?'
						);
						sails.log.error();

						// 4. invalid explicitHost
						if (!explicitHost) {
							sails.log.error(
							' -> Are you deploying on a platform that requires an explicit hostname,',
							'like OpenShift?');
							sails.log.error(
							'    (Try setting the `explicitHost` config to the hostname where the server will be accessible.)'
							);
							sails.log.error(
							'    (e.g. `mydomain.com` or `183.24.244.42`)'
							);
						}
						console.log('');
					}, liftTimeout);
				},

				verify: ['start', function (cb) {
					var explicitHost = sails.config.explicitHost;

					// Check for port conflicts
					// Ignore this check if explicit host is set, since other more complicated things might be going on.
					if( !explicitHost && !sails.hooks.http.server.address() ) {
						var portBusyError = '';
						portBusyError += 'Trying to start server on port ' + sails.config.port + ' but can\'t...';
						portBusyError += 'Something else is probably running on that port!' + '\n';
						portBusyError += 'Please disable the other server, or choose a different port and try again.';
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
		}
	};

};
