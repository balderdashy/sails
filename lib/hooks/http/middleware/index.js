/**
 * Module dependencies
 */

var _ = require('lodash')
	, util = require('util');




module.exports = function (sails) {

	// `require('express')` is in here on purpose.
	// (i.e. if we `require` this above w/ everything else, the NODE_ENV might not be set properly yet)
	var express = require('express');



	/**
	 * Build our dictionary of available middleware
	 * @param  {Express.app} app
	 * @return {Object}
	 */
	return function getConfiguredMiddleware (app) {

		return _.defaults(sails.config.express.middleware || {}, {

			// Configure flat file server to serve static files
			// (By default, all explicit+shadow routes take precedence over flat files)
			www: (function () {
				sails.log.verbose('Installing `www` middleware to serve flat files (i.e. express.static)...');
				var flatFileMiddleware = express['static'](sails.config.paths['public'], {
					maxAge: sails.config.cache.maxAge
				});

				// Make some MIME type exceptions for Google fonts
				express['static'].mime.define({
					'application/font-woff': ['woff']
				});

				return flatFileMiddleware;
			})(),

			// If a Connect session store is configured, hook it up to Express
			session: (function () {
				if (sails.config.session && sails.config.session.store) {
					return express.session(sails.config.session);
				}
			})(),

			favicon: express.favicon(),

			startRequestTimer: require('./startRequestTimer'),

			cookieParser: (function () {
				var cookieParser = sails.config.express.cookieParser;
				var sessionSecret = sails.config.session.secret;
				// if (sails.config.environment === 'development') {
				// 	sails.log.silly('Using secret: ' + sessionSecret + ' in cookie parser');
				// }
				return cookieParser(sessionSecret);
			})(),

			bodyParser: (function () {
				// Use body parser, if enabled
				var bodyParser = sails.config.express.bodyParser;
				return _.isFunction(bodyParser) && bodyParser();
			})(),

			handleBodyParserError: function handleBodyParserError(err, req, res, next) {
				// Should be installed immediately after the bodyParser.
				sails.log.error('Unable to parse HTTP body- error occurred:');
				sails.log.error(err);
				return res.send(400, 'Unable to parse HTTP body- error occurred :: ' + util.inspect(err));
			},

			// Allow simulation of PUT and DELETE HTTP methods for user agents
			// which don't support it natively (looks for a `_method` param)
			methodOverride: (function () {
				return sails.config.express.methodOverride && sails.config.express.methodOverride();
			})(),

			// By default, the express router middleware is installed towards the end.
			// This is so that all the built-in core Express/Connect middleware
			// gets called before matching any explicit routes or implicit shadow routes.
			router: app.router,

			// Add powered-by Sails header
			poweredBy: function xPoweredBy (req, res, next) {
				res.header('X-Powered-By', 'Sails <sailsjs.org>');
				next();
			},

			// 404 and 500 middleware should be attached at the very end
			// (after `router`, `www`, and `favicon`)
			404: function handleUnmatchedRequest (req, res, next) {
				
				// Explicitly ignore error arg to avoid inadvertently
				// turning this into an error handler
				sails.emit('router:request:404', req, res);
			},
			500: function handleError (err, req, res, next) {
				sails.emit('router:request:500', err, req, res);
			}
		});
	};
};

