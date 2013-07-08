module.exports = function(sails) {


	/**
	 * Module dependencies.
	 */

	var _ = require('lodash'),
		util = require('../util'),
		EventEmitter = require('events').EventEmitter;
		express = require('express');


	/**
	 * Expose new instance of `Router`
	 *
	 * @api private
	 */

	return new Router();


	/**
	 * Initialize a new `Router`
	 *
	 * @param {Object} options
	 * @api private
	 */

	function Router(options) {

		/**
		 * Instantiate a Express app just to get some of that sweet, sweet routing goodness
		 * (this Express app instance will not be used for listening for HTTP requests;
		 * instead, one or more delegate servers can be attached)
		 *
		 */

		var expressApp = express();



		/**
		 * Expose a new Router
		 *
		 * Link Express HTTP requests to a function which handles them
		 *
		 * @api public
		 */

		Router.prototype.load = function(cb) {

			sails.log.verbose('Loading router...');

			// Maintain a reference to the static route config
			this.staticRoutes = sails.config.routes;

			// Save reference to sails logger
			this.log = sails.log;

			// Save self-reference in sails
			sails.router = this;

			// Make slave router accesible
			sails.router.app = expressApp;

			// Wipe any existing routes and bind them anew
			this.flush();

			// Listen for requests
			sails.on('request', this.route);

			cb();
		};



		/*
		 * Set up a `request` listener which can be used to trigger routes
		 * NOTE: this should only be used if the request handler does not have its own router.
		 * (this approach also dramatically simplifies unit testing!)
		 *
		 * The optimal behavior for Express, for instance, is to listen to `router:route` and use the built-in router,
		 * whereas Socket.io needs to use the `request` event to simulate a connect-style router since it
		 * can't bind dynamic routes ahead of time
		 *
		 * By default, params and IO methods like res.send() are noops that should be overridden
		 *
		 * @param {Object} req
		 * @param {Object} res
		 * @param {Function} callback [optional- used to populate default res.send() behavior]
		 * @api private
		 */

		Router.prototype.route = function(req, res, callback) {


			// Make sure request and response objects have reasonable defaults
			// (will use the supplied definitions if possible)
			req = _.defaults(req || {}, {
				params: {},
				param: function(paramName) {
					return req.params[paramName];
				},
				method: 'get'
			});
			res = _.defaults(res || {}, {
				send: function(body, status) {
					if (callback) {
						callback(body, status);
					}
				},
				json: function(body, status) {
					var json;

					try {
						json = JSON.stringify(body);
					} catch (e) {
						return res.send(e, 500);
					}

					res.send(json, status);
				}
			});


			// Use our slave router to route the request
			expressApp.router( req, res, function noMatch(err) {

				if (err) {
					sails.log.warn('Unmatched error route reached core-level 500 handler.');
					res.send('Server error.', 500);
					return;
				}
				
				sails.log.warn('Unmatched route reached core-level 404 handler.');
				res.send('Not found.', 404);
				return;
				
			});
		};



		/**
		 * Bind new route(s)
		 *
		 * @param {String|RegExp} path
		 * @param {String|Object|Array|Function} bindTo
		 * @param {String} verb
		 * @api private
		 */

		Router.prototype.bind = require('./bind')(sails);



		/**
		 * Unbind existing route
		 *
		 * @param {Object} route
		 * @param {Integer} index
		 * @api private
		 */

		Router.prototype.unbind = function(route, index) {
			
			// Inform servers that route should be ignored
			sails.emit('router:unbind', route);

			// Remove route in internal router
			var newRoutes = [];
			_.each(expressApp.routes[route.method], function(expressRoute) {
				if (expressRoute.path != route.path) {
					newRoutes.push(expressRoute);
				}
			});
			expressApp.routes[route.method] = newRoutes;

		};



		/**
		 * Unbind all routes currently attached to the router
		 *
		 * @param {String} verb [optional]
		 * @api private
		 */

		Router.prototype.reset = function(verb) {

			// If no verb was specified, unbind everything
			if (!verb) {
				_.each(expressApp.routes, function(routes, method) {
					this.reset(method);
				}, this);

				return;
			}

			// Unbind each route for the specified HTTP verb
			_.each(expressApp.routes[verb] || [], this.unbind, this);

		};



		/**
		 * Wipe everything and bind routes.
		 *
		 * @api private
		 */

		Router.prototype.flush = function() {

			this.reset();

			// Fired before static routes are bound
			sails.emit('router:before');

			// Use specified path to bind static routes
			_.each(this.staticRoutes, function(target, path) {
				this.bind(path, target);
			}, this);

			// Fired after static routes are bound
			sails.emit('router:after');

			// Fired in case anything needs to be bound absolutely last
			sails.emit('router:done');
		};



		// Bind the context of all instance methods
		_.bindAll(this);

	}

};