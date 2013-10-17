/**
 * Module dependencies.
 */

var EventEmitter	= require('events').EventEmitter,
	async			= require('async'),
	util			= require('sails/lib/util'),
	loadSails		= require('./load'),
	onTeardown		= require('./teardown'),
	exposeGlobals	= require('./exposeGlobals'),
	runBootstrap	= require('./bootstrap');


/**
 * Expose `Sails` constructor
 */

module.exports = Sails;



/**
 * Sails constructor
 *
 * @api private
 */

function Sails () {



	/**
	 * Keep track of spanwed child processes
	 */

	this.childProcesses = [];



	/**
	 * Expose utilities
	 *
	 * @api private
	 */

	this.util = util;



	/**
	 * Load the pieces of a Sails app
	 *
	 * @api private
	 */

	this.load = loadSails(this);



	/**
	 * Sails.prototype.initialize()
	 *
	 * Start the Sails server
	 * NOTE: sails.load() should be run first.
	 *
	 * @api private
	 */

	this.initialize = function (cb) {

		// Make callback optional
		cb = util.optional(cb);

		var sails = this;

		// Indicate that server is starting
		sails.log.verbose('Starting app at ' + sails.config.appPath + '...');

		// If coffeescript is not installed, ignore silently
		try {
			require('coffee-script');
			sails.log.verbose('Enabling CoffeeScript...');
		} catch (e) {
			sails.log.warn('CoffeeScript not installed.  Run `npm install -g coffeescript` to get it.');
		}

		// Optionally expose services, models, sails, _, async, etc. as globals
		exposeGlobals(sails)();

		// Add beforeShutdown event
		onTeardown(sails)();

		// Run the app bootstrap
		runBootstrap(sails)(function (err) {
			if (err) return cb(err);

			// And fire the `ready` event
			// This is listened to by attached servers, etc.
			sails.emit('ready');
			cb();
		});
	};



	/**
	 * Sails.prototype.lift()
	 *
	 * Loads the app, then starts all attached servers.
	 *
	 * @api public
	 */

	this.lift = function (configOverride, cb) {
		// Make callback optional
		cb = util.optional(cb);
		
		var sails = this;

		var load = this.load;

		async.series([
			
			function (cb) {
				load(configOverride, cb);
				
				// Provide an initial heartbeat to let user know that Sails is working
				// (only relevant on very slow systems) or in bootstrap functions with
				// very complex synchronous code
				util.defer(function maybeLoggerIsReady () {
					sails.log.verbose('Configuring app...');
				}, 1);
			},

			this.initialize

		], function sailsReady (err, results) {
			if (err) return cb(err);

			// Gather app meta-info and log ship, if configured to do so
			if ( !sails.config.log.noShip ) {
				var usingSSL = (
					(
						sails.config.serverOptions && 
						sails.config.serverOptions.key &&
						sails.config.serverOptions.cert
					) || (
						sails.config.express && 
						sails.config.express.serverOptions && 
						sails.config.express.serverOptions.key && 
						sails.config.express.serverOptions.cert 
					)
				);
				var Env = sails.config.environment[0].toUpperCase() + sails.config.environment.slice(1);
				var localAppURL = ( usingSSL ? 'https' : 'http' ) + '://' + sails.config.host + ':' + sails.config.port + '';
				sails.log.ship();

				var log = sails.log;
				sails.log.info('Server lifted in `' + sails.config.appPath + '`');
				sails.log.info('To see your app, visit ' + localAppURL);
				sails.log.info('To shut down Sails, press <CTRL> + C at any time.');
				console.log();
	            log('--------------------------------------------------------');
				log(':: ' + new Date());
				log();
				log('Environment\t: ' + sails.config.environment);
				if (sails.config.hooks.http && sails.config.explicitHost) {
					log('Host\t\t: ' + sails.config.explicitHost);
				}
				log('Port\t\t: ' + sails.config.port);
	            log('--------------------------------------------------------');
			}

			return cb(err, sails);
		});
	};



	/**
	 * Sails.prototype.lower()
	 *
	 * The inverse of `initialize()`, this method
	 * shuts down all attached servers.
	 *
	 * It also unbinds listeners and terminates child processes.
	 *
	 * @api public
	 */

	this.lower = function (cb) {
		var sails = this;
		
		sails.log.verbose('Lowering sails...');
		cb = util.optional(cb);
		sails._exiting = true;

		// Wait until beforeShutdown logic runs
		var beforeShutdown =
				util.isFunction(sails.config.beforeShutdown) ?
				sails.config.beforeShutdown :
				function (cb) { cb(); };

		beforeShutdown(function (err) {
			if (err) sails.log.error(err);

			// Kill all child processes
			util.each(sails.childProcesses, function kill (childProcess) {
				sails.log.verbose('Sent kill signal to child process (' + childProcess.pid + ')...');
				childProcess.kill('SIGHUP');
			});

			// Shut down HTTP server
			// TODO: defer this to the http and sockets hooks-- use sails.emit('lowering')
			// Shut down Socket server
			// wait for all attached servers to stop
			var log = sails.log.verbose;
			async.series([
				function shutdownSockets(cb) {
					if (!sails.config.hooks.sockets) {
						return cb();
					}

					try {
						log('Shutting down socket server...');
						setTimeout(cb, 100);
						sails.io.server.unref();
						sails.io.server.close();
						sails.io.server.on('close', function () {
							log('Socket server shut down successfully.');
							cb();
						});
					}
					catch (e) { cb(); }
				},

				function shutdownHTTP(cb) {
					try {
						log('Shutting down HTTP server...');
						setTimeout(cb, 100);
						sails.hooks.http.server.unref();
						sails.hooks.http.server.close();
						sails.hooks.http.server.on('close', function () {
							log('HTTP server shut down successfully.');
							cb();
						});
					}
					catch (e) { cb(); }
				},

				function removeListeners(cb) {
					// removeAllListeners doesn't work correctly without arguments,
					// so we'll do it manually
					for (var key in sails._events) {
						sails.removeAllListeners(key);
					}
					cb();
				}
			], cb);

		});

	};


	/**
	 * Sails.prototype.after()
	 *
	 * If `evName` has already fired, trigger fn immediately (with no args)
	 * Otherwise wait until it does.
	 */
	this.after = function (evName, fn) {
		if ( this.warmEvents[evName] ) {
			fn();
		}
		else this.once(evName, fn);
	};

	/**
	 * Events which have occurred at least once
	 */
	this.warmEvents = {};


	/**
	 * Override `this.emit`, adding support for `this.after`
	 */
	var self = this;
	var _emit = util.clone(this.emit);
	this.emit = function (evName) {
		var args = Array.prototype.slice.call(arguments, 0);
		self.warmEvents[evName] = true;
		_emit.apply(self, args);
	};


	util.bindAll(this);
}



/**
 * Extend from EventEmitter to allow hooks to listen to stuff
 *
 * @api private
 */

Sails.prototype = new EventEmitter();
Sails.prototype.constructor = Sails;

// Remove memory-leak warning about max listeners
// See: http://nodejs.org/docs/latest/api/events.html#events_emitter_setmaxlisteners_n
Sails.prototype.setMaxListeners(0);

