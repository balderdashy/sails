module.exports = function(sails) {


	/**
	 * Module dependencies.
	 */

	var _ = require('lodash'),
		util = require('../util'),
		EventEmitter = require('events').EventEmitter;


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

	function Router (options) {

		/**
		 * Instantiate a Express app just to get some of that sweet, sweet routing goodness
		 * (this Express app instance will not be used for listening for HTTP requests;
		 * instead, one or more delegate servers can be attached)
		 *
		 */

		// Requires calling of load() before use, due to dynamic loading of NODE_ENV
		var expressApp;



		/**
		 * Expose a new Router
		 *
		 * Link Express HTTP requests to a function which handles them
		 *
		 * @api public
		 */

		Router.prototype.load = function(cb) {

			sails.log.verbose('Loading router...');

			// Required for dynamic NODE_ENV setting via command line args
			expressApp = require('express')();

			// Maintain a reference to the static route config
			this.staticRoutes = sails.config.routes;

			// Save reference to sails logger
			this.log = sails.log;

			// Save self-reference in sails
			sails.router = this;

			// Make slave router accesible
			sails.router._app = expressApp;

			// Wipe any existing routes and bind them anew
			this.flush();

			// Listen for requests
			sails.on('router:request', this.route);

			cb();
		};



		/*
		 * Set up a `request` listener which can be used to trigger routes
		 *
		 * NOTE: this should only be used if the request handler does not have its own router.
		 * (this approach also dramatically simplifies unit testing!)
		 *
		 * The optimal behavior for Express, for instance, is to listen to `router:bind`
		 * and use the built-in router at lift-time, whereas Socket.io needs to use the
		 * `router:request` event to simulate a connect-style router since it
		 * can't bind dynamic routes ahead of time.
		 *
		 * By default, params and IO methods like res.send() are noops that should be overridden.
		 *
		 * Keep in mind that, if `route` is not used, the implementing server is responsible
		 * for routing to Sails' default `next(foo)` handler.
		 *
		 * @param {Object} req
		 * @param {Object} res
		 * @param {Function} cb [optional- used to populate default res.send() behavior]
		 * @api private
		 */

		Router.prototype.route = function(req, res, cb) {
			cb = util.optional(cb);

			// Bundle raw callback function
			res._cb = cb;

			// Make sure request and response objects have reasonable defaults
			// (will use the supplied definitions if possible)
			req = reasonableDefaultRequest(req);
			res = reasonableDefaultResponse(res);

			// Use our slave router to route the request
			expressApp.router(req, res, this.wildcard(req, res));

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

			// Fired after static routes are bound, 
			// but BEFORE implicit routes
			sails.emit('router:beforeImplicit');

			// Fired after static routes are bound
			sails.emit('router:after');
		};



		/**
		 * Handle an unmatched `next()`, `next('foo')`, or `next('foo', errorCode)`
		 *
		 * @api private
		 */

		Router.prototype.wildcard = function generateHandler (req, res) {
			return function handleUnmatchedNext(status) {

				// Default server error handler
				if (status) {
					return sails.config[500](status, req, res);
				}

				// Default 'not found' handler
				return sails.config[404](req, res);
			};
		};



		// Bind the context of all instance methods
		_.bindAll(this);

	}



	/**
	 * Ensure that request object has a minimum set of reasonable defaults
	 */

	function reasonableDefaultRequest(req) {
		return _.defaults(req || {}, {
			params: {},
			param: function(paramName) {
				return req.params[paramName];
			},
			wantsJSON: true,
			method: 'get'
		});
	}


	/**
	 * Ensure that response object has a minimum set of reasonable defaults
	 */

	function reasonableDefaultResponse(res) {
		return _.defaults(res || {}, {
			send: function(body, status) {
				res._cb(body, status);
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
	}

};