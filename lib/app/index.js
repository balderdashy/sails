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

		// Optionally expose services, models, sails, _, async, etc. as globals
		exposeGlobals(sails)();

		// Add beforeShutdown event
		process.on('SIGINT', function() {
			beforeShutdown(process.exit);
		});
		process.on('SIGTERM', function() {
			beforeShutdown(process.exit);
		});
		process.on('exit', function() {
			if (!sails._exiting) beforeShutdown();
		});
		function beforeShutdown(cb) {
			sails._exiting = true;
			if(_.isFunction(sails.config.beforeShutdown)) {
				sails.config.beforeShutdown(cb);
			}
			else cb && cb();
		}

		// Run the app bootstrap
		runBootstrap(sails)(function (err) {
			if (err) return cb(err);

			// And fire the `ready` event
			// This is listened to by attached servers, etc.
			sails.emit('ready');

			cb && cb();
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
		this.config = configOverride || {};

		async.series([
			
			this.load,

			this.initialize

		], function sailsReady (err, results) {

			sails.log();
			sails.log.ship();
			sails.log('Sails (v'+sails.version +') lifted in ' + sails.config.environment + ' mode.');
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
		sails.express.server.close(cb);
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

// Remove memory-leak warning about max listeners
// See: http://nodejs.org/docs/latest/api/events.html#events_emitter_setmaxlisteners_n
Sails.prototype.setMaxListeners(0);


/**
 * Probably can be removed:
 *
 * @api private
 */

// Sails.prototype.after = function ( id, handler ) {

// 	// Make sure the object to track handlers exists
// 	this.__after_bindings = this.__after_bindings || {};

// 	// If the event handler has already fired, just fire it again
// 	if (this.__after_bindings[id]) {
// 		handler.apply(this, this.__after_bindings[id].toArray());
// 	}

// 	// Otherwise listen for when the event fires
// 	else {
// 		this.on(id, function () {
			
// 			// Fire the event handler only once
// 			if (!sails.__after_bindings[id]) {
// 				handler.apply(this, arguments.toArray());
// 			}

// 			// But remember that it's happened, so if after() is called afterwards,
// 			// the handler will be triggered each time
// 			else sails.__after_bindings[id] = arguments;
// 		});
// 	}
// };

