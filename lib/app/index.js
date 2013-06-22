/**
 * Module dependencies.
 */

var _				= require( 'lodash' ),
	EventEmitter	= require('events').EventEmitter,
	async			= require('async'),
	util			= require( '../util'),
	loadSails		= require('./load'),
	exposeGlobals	= require('./exposeGlobals'),
	runBootstrap	= require('./bootstrap'),
	Grunt			= require('../grunt');


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
	 * Start the Sails server
	 *
	 * @api private
	 */

	this.initialize = function (cb) {

		var sails = this;

		// Indicate that server is starting
		sails.log('Starting app at ' + sails.config.appPath + '...');

		// Used to warn about possible issues if starting the server is taking a very long time
		var liftAbortTimer;

		async.auto({

			// Optionally expose services, models, sails, _, async, etc.
			exposeGlobals: exposeGlobals(sails),

			// Run the app bootstrap
			bootstrap: [ 'exposeGlobals' , runBootstrap(sails) ],

			bindBeforeShutdown: function (cb) {

				// Add beforeShutdown event
				var exiting;
				process.on('SIGINT', function() {
					beforeShutdown(process.exit);
				});
				process.on('SIGTERM', function() {
					beforeShutdown(process.exit);
				});
				process.on('exit', function() {
					if (!exiting) beforeShutdown();
				});
				function beforeShutdown(cb) {
					exiting = true;
					if(_.isFunction(sails.config.beforeShutdown)) {
						sails.config.beforeShutdown(cb);
					}
					else cb && cb();
				}

				cb();
			},

			startServer: function (cb) {

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

			verifyServerStartedSuccessfully: ['startServer', function (cb) {

				// Check for port conflicts
				// Ignore this check if explicit host is set
				if(!sails.explicitHost && !sails.express.server.address()) {
					sails.log.error('Trying to start server on port ' + sails.config.port + '...');
					sails.log.error('But something else is already running on that port!');
					sails.log.error('Please disable the other server, or choose a different port, and try again.');
					process.exit(1);
				}

				cb();
			}]

		}, function (err) {
			clearTimeout(liftAbortTimer);
			return cb && cb(err);
		});

	};



	/**
	 * Factory method to generate a sails instance,
	 * lift() is also the entry point for the Sails.js runtime
	 * Loads the app, then starts the server.
	 *
	 * @api public
	 */

	this.lift = function (configOverride, cb) {

		var sails = this;

		// Stow CLI/env override
		this.config = _.clone(configOverride || {});

		async.series([
			
			this.load,

			this.initialize

		], function sailsReady (err, results) {

			sails.log();
			sails.log.ship();
			sails.log('Sails (v'+sails.version +')');
			sails.log('Sails lifted on port ' + sails.config.port + ' in ' + sails.config.environment + ' mode.');

			if (sails.config.environment === 'development') {
				var usingSSL = ( ( sails.config.serverOptions && sails.config.serverOptions.key && sails.config.serverOptions.cert ) ||
					( sails.config.express && sails.config.express.serverOptions && sails.config.express.serverOptions.key && sails.config.express.serverOptions.cert ));

				sails.log();
				sails.log('( to see your app, visit: ' + ( usingSSL ? 'https' : 'http' ) + '://' + sails.config.host + ':' + sails.config.port + ' )');
			}

			return cb && cb(err, sails);
		});
	};



	/**
	 * Kill the server
	 * ( Socket.io server is stopped automatically when Express server is closed )
	 *
	 * @api public
	 */

	this.lower = function (cb) {
		sails.express.server.close();
	};



	/**
	 * Run the grunt build task
	 *
	 * @api public
	 */

	this.build = function (taskName, cb) {
		
		// Default to 'build' task
		taskName = taskName || 'build';
		
		var log = this.log;
		log.info('Building assets into directory...');
		
		// Fire up grunt
		var grunt = Grunt(this);
		grunt(taskName, function (err) {
			if (err) return cb && cb(err);

			log.info('Successfully built \'www\' directory in the application root.');
			cb && cb();
		});
	};

	_.bindAll(this);
}



/**
 * Extend from EventEmitter to allow hooks to listen to stuff
 *
 * @api private
 */

Sails.prototype = new EventEmitter();
Sails.prototype.constructor = Sails;
Sails.prototype.after = function ( id, handler ) {

	// Make sure the object to track handlers exists
	this.__after_bindings = this.__after_bindings || {};

	// If the event handler has already fired, just fire it again
	if (this.__after_bindings[id]) {
		handler.apply(this, this.__after_bindings[id].toArray());
	}

	// Otherwise listen for when the event fires
	else {
		this.on(id, function () {
			
			// Fire the event handler only once
			if (!sails.__after_bindings[id]) {
				handler.apply(this, arguments.toArray());
			}

			// But remember that it's happened, so if after() is called afterwards,
			// the handler will be triggered each time
			else sails.__after_bindings[id] = arguments;
		});
	}
};

