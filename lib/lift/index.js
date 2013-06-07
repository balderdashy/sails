// sails.js
// --------------------
//
// Entry point for Sails core

// Globalize Sails
var sails = global['sails'] ? global['sails'] : global['sails'] = {};

// Utility libs
var _ = require('lodash');
var async = require('async');
sails.util = require('../util');

module.exports = {

	// Stop the server
	lower	: lowerSails,

	// Start the server
	lift	: liftSails,

	// Direct access to load and initialize, for testing
	load	: require('./load'),
	initialize	: require('./init'),

	// Export sails object
	sails	: sails,

	build	: build
};

/**
 * Load and initialize the app
 */
function liftSails(configOverride, cb) {

	// Stow CLI/env override in sails.config
	sails.config = _.clone(configOverride || {});

	// Load various pieces of framework
	async.auto({

		loadSails: require('./load'),

		initSails: ['loadSails', require('./init')]

	}, function (err) {

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
}

/**
 * Kill the http and socket.io servers
 */
function lowerSails(cb) {
	// Socket.io server is stopped automatically when express server is killed
	sails.express.server.close();
}

/**
 * Run the grunt build task
 */
function build (taskName, cb) {
	sails.spawnGrunt = require('../automation')(taskName, cb);
}