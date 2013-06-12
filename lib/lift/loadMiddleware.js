module.exports = function (sails) {

		
	/**
	 * Module dependencies.
	 */

	var _		= require( 'lodash' ),
		async	= require('async'),
		MiddlewareRegistry = require('../middleware')(sails);



	/**
	 * Expose the middleware registry
	 *
	 * @param {Function} cb
	 * @api private
	 */

	return function load (cb) {

		sails.log.verbose('Building middleware registry...');

		// Instantiate middleware registry for the first time
		sails.middleware = new MiddlewareRegistry();

		// Populate middleware registry
		sails.middleware.flush();

		cb();
	};

};


	// function bind (cb) {

	// 	async.auto({
			
	// 		controllers: function (cb) {
	// 			sails.log.verbose('Loading app controllers...');

	// 			// Load app controllers
	// 			sails.controllers = require('../moduleloader').optional({
	// 				dirname		: sails.config.paths.controllers,
	// 				filter		: /(.+)Controller\.(js|coffee)$/,
	// 				replaceExpr	: /Controller/
	// 			});

	// 			// Get federated controllers where actions are specified each in their own file
	// 			var federatedControllers = require('../moduleloader').optional({
	// 				dirname			: sails.config.paths.controllers,
	// 				pathFilter		: /(.+)\/(.+)\.(js|coffee)$/
	// 			});
	// 			sails.controllers = _.extend(sails.controllers,federatedControllers);

	// 			cb();
	// 		}, 

	// 		policies: function (cb) {
	// 			sails.log.verbose('Loading app policies...');

	// 			// Load policy modules
	// 			sails.policies = require('../moduleloader').optional({
	// 				dirname		: sails.config.paths.policies,
	// 				filter		: /(.+)\.(js|coffee)$/,
	// 				replaceExpr	: null
	// 			});
	// 			cb();
	// 		},

	// 		views: function (cb) {

	// 			// Load views, just so we know whether they exist or not
	// 			sails.views = require('../moduleloader').optional({
	// 				dirname		: sails.config.paths.views,
	// 				filter		: /(.+)\..+$/,
	// 				replaceExpr	: null,
	// 				dontLoad	: true
	// 			});
	// 			cb();
	// 		},

	// 		buildRegistry: ['controllers', 'policies', 'views', function (cb) {
	// 			sails.log.verbose('Building middleware registry...');

	// 			// Instantiate middleware registry for the first time
	// 			sails.middleware = new MiddlewareRegistry();

	// 			// Populate middleware registry
	// 			sails.middleware.flush();

	// 			cb();
	// 		}]

	// 	}, cb);
	// }
