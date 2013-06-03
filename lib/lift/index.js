// sails.js
// --------------------
//
// Entry point for Sails core

// Define app and configuration object
var sails = {
	config: {}
};

// Utility libs
var _ = require('lodash');
_.str = require('underscore.string');
var async = require('async');

// Globalize Sails
global['sails'] = sails;

// Node.js dependencies
var fs = require('fs');
var path = require('path');

// Routing and HTTP server
var express = require('express');

// Socket.io server (WebSockets+polyfill to support Flash sockets, AJAX long polling, etc.)
var socketio = require('socket.io');

// Sails ecosystem defaults
sails.waterline = require('../waterline');
sails.modules = require('../loader');
sails.util = require('../util');


// EXPERIMENTAL connect v2 support
// see https://github.com/senchalabs/connect/issues/588
//var connect = require('connect');
//var connectCookie = require('cookie');
//var cookieSecret = "k3yboard_kat";
//parseCookie = function(cookie) {
//	return connect.utils.parseSignedCookies(connectCookie.parse(decodeURIComponent(cookie)),cookieSecret);
//}
var connect = require('connect');
parseCookie = connect.utils.parseCookie;
ConnectSession = connect.middleware.session.Session;

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

	// Load various pieces of framework
	async.auto({

		loadSails: function (cb) {
			require('./load')(configOverride, cb);
		},

		initSails: function (cb) {
			require('./init')(cb);
		}

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

		return cb && cb(err);
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