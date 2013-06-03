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

// Default logger
var CaptainsLogger = require('../util/logger');

// Templating
var ejs = require('ejs');
var jade = require('jade');

// Sails ecosystem defaults
sails.waterline = require('../waterline');
sails.modules = require('../loader');
sails.util = require('../util');
sails.log = CaptainsLogger();

// Get socket interpreter
var socketInterpreter = require("../router/interpreter");

// Get router
var Router = require('../router');

// Internal dependencies
var configuration = require("../configuration");
var pubsub = require('../pubsub');

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

		initSails: require('./init')

	}, cb);
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