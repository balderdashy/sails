/**
 * Module dependencies.
 */

var _			= require( 'lodash' ),
	util		= require( '../util'),
	EventEmitter= require('events').EventEmitter,
	async		= require('async'),
	loadSails	= require('./load'),
	initSails	= require('./init');



/**
 * Sails constructor
 *
 * @api private
 */

function Sails () {
	this.util = util;
	_.bindAll(this);
}


/**
 * Extend from EventEmitter to allow hooks to listen to stuff
 *
 * @api private
 */

Sails.prototype = new EventEmitter();
Sails.prototype.constructor = Sails;



/**
 * Load the pieces of a Sails app
 *
 * @api private
 */

Sails.prototype.load = function () {
	return loadSails(this);
};



/**
 * Start the Sails server
 *
 * @api private
 */

Sails.prototype.initialize = initSails;



/**
 * Factory method to generate a sails instance,
 * lift() is also the entry point for the Sails.js runtime
 * Loads the app, then starts the server.
 *
 * @api public
 */

Sails.prototype.lift = function (configOverride, cb) {

	var sails = this;

	// Stow CLI/env override
	this.config = _.clone(configOverride || {});

	async.series([
		
		this.load(sails),

		this.initialize(sails)

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

Sails.prototype.lower = function (cb) {
	sails.express.server.close();
};



/**
 * Run the grunt build task
 *
 * @api public
 */

Sails.prototype.build = function (taskName, cb) {
	sails.spawnGrunt = require('../automation')(taskName, cb);
};




/**
 * Expose a new Sails instance
 */

module.exports = new Sails();
