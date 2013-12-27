/**
 * Module dependencies.
 */

var events			= require('events'),
	async			= require('async'),
	util			= require('sails-util'),
	loadSails		= require('./load'),
	onTeardown		= require('./teardown'),
	exposeGlobals	= require('./exposeGlobals'),
	runBootstrap	= require('./bootstrap'),
	argv			= require('optimist').argv,
	Err				= require('../../errors'),
	Logger			= require('captains-log');

// Build logger using command-line config
var log = new Logger(util.getCLIConfig(argv).log);



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
	 * Inherit methods from EventEmitter
	 */
	events.EventEmitter.call(this);


	/**
	 * Remove memory-leak warning about max listeners
	 * See: http://nodejs.org/docs/latest/api/events.html#events_emitter_setmaxlisteners_n
	 */
	this.setMaxListeners(0);



	/**
	 * Enable server-side CoffeeScript support
	 */

	require('coffee-script');



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
			cb(null, sails);
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

		async.series([

			function (cb) {
				sails.load(configOverride, cb);
			},

			this.initialize

		], function sailsReady (err, async_data) {
			if (err) return sails.lower(cb);

			_printSuccessMsg(sails);
			return cb(null, sails);
		});
	};



	/**
	 * Sails.prototype.lower()
	 *
	 * The inverse of `lift()`, this method
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
				try {
					childProcess.kill('SIGINT');
				}
				catch (e) {
					sails.log.warn('Error received killing child process: ', e.message);
				}
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

	// Gather app meta-info and log startup message (the boat).
	// If `config.noShip` is set, skip the startup message.
	function _printSuccessMsg( sails ) {
		if ( ! (sails.config.log && sails.config.log.noShip) ) {
			var usingSSL = sails.config.ssl.key && sails.config.ssl.cert;
			var Env = sails.config.environment[0].toUpperCase() + sails.config.environment.slice(1);
			var localAppURL = ( usingSSL ? 'https' : 'http' ) + '://' + sails.config.host + ':' + sails.config.port + '';
			sails.log.ship();
			var log = sails.log;
			sails.log.info('Server lifted in `' + sails.config.appPath + '`');
			sails.log.info('To see your app, visit ' + localAppURL);
			sails.log.info('To shut down Sails, press <CTRL> + C at any time.');
			log();
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
	}


	/**
	 * Sails.prototype.after()
	 *
	 * If `evName` has already fired, trigger fn immediately (with no args)
	 * Otherwise bind a normal one-time event using `EventEmitter.prototype.once()`.
	 * This is a lot like jQuery's `$(document).ready()`
	 */
	this.after = function (evName, fn) {
		// TODO: support array of evNames
		if ( this.warmEvents[evName] ) {
			fn();
		}
		else this.once(evName, fn);
	};

	/**
	 * { Sails.prototype.warmEvents }
	 *
	 * Events which have occurred at least once
	 * (Required to support `Sails.prototype.after()`)
	 */
	this.warmEvents = {};


	/**
	 * Sails.prototype.emit()
	 *
	 * Override `EventEmitter.prototype.emit`.
	 * (Required to support `Sails.prototype.after()`)
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
 * Static methods
 *
 * e.g. `Sails.foo()`
 */
Sails.isLocalSailsValid = require('./isLocalSailsValid');
Sails.isSailsAppSync = require('./isSailsApp');





/**
 * Extend from EventEmitter to allow hooks to listen to stuff
 *
 * @api private
 */

require('util').inherits(Sails, events.EventEmitter);


