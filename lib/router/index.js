module.exports = function(sails) {


	/**
	 * Module dependencies.
	 */

	var util = require('sails-util');


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
		 * _slave
		 *
		 * This internal Express app slave instance is used only for routing.
		 * (i.e. it will not be used for listening for HTTP requests;
		 * instead, one or more delegate servers can be attached-
		 * see the `http` or `sockets` hook for examples.)
		 *
		 * Requires calling of load() before use in order to give it access
		 * to the proper NODE_ENV.
		 */

		Router.prototype._slave;





		/**
		 * load
		 *
		 * Expose the router, create the Express slave router,
		 * then call flush(), which will bind configured routes
		 * and emit the appropriate events.
		 *
		 * @api public
		 */

		Router.prototype.load = function(cb) {

			sails.log.verbose('Loading router...');

			// Required for dynamic NODE_ENV setting via command line args
			this._slave = require('express')();

			// Maintain a reference to the static route config
			this.staticRoutes = sails.config.routes;

			// Save reference to sails logger
			this.log = sails.log;

			// Expose router on `sails` object
			sails.router = this;

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

			// Track request start time
			req._startTime = new Date();

			// Make sure request and response objects have reasonable defaults
			// (will use the supplied definitions if possible)
			req = reasonableDefaultRequest(req);
			res = reasonableDefaultResponse(res);

			// Use our slave router to route the request
			this._slave.router(req, res, this.wildcard(req, res));

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

			// Inform attached servers that route should be unbound
			sails.emit('router:unbind', route);

			// Remove route in internal router
			var newRoutes = [];
			util.each(this._slave.routes[route.method], function(expressRoute) {
				if (expressRoute.path != route.path) {
					newRoutes.push(expressRoute);
				}
			});
			this._slave.routes[route.method] = newRoutes;

		};



		/**
		 * Unbind all routes currently attached to the router
		 *
		 * @api private
		 */

		Router.prototype.reset = function () {

			// Unbind everything
			util.each(this._slave.routes, function(routes, httpMethod) {
				
				// Unbind each route for the specified HTTP verb
				var routesToUnbind = this._slave.routes[httpMethod] || [];
				util.each(routesToUnbind, this.unbind, this);

			}, this);


			// Emit reset event to allow attached servers to
			// unbind all of their routes as well		
			sails.emit('router:reset');

		};



		/**
		 * Wipe everything and bind routes.
		 *
		 * @param {Object} routes - (optional) If specified,
		 *		replaces `this.staticRoutes` before flushing.
		 *
		 * @api private
		 */

		Router.prototype.flush = function( routes ) {

			// Wipe routes
			this.reset();

			// Fired before static routes are bound
			sails.emit('router:before');

			// If specified, replace `this.staticRoutes`
			if (routes) {
				this.staticRoutes = routes;
			}

			// Use specified path to bind static routes
			util.each(this.staticRoutes, function(target, path) {
				this.bind(path, target);
			}, this);


			// Fired after static routes are bound
			sails.emit('router:after');
		};



		/**
		 * Handle an unmatched `next()`, `next('foo')`, or `next('foo', errorCode)`
		 * This should only be called by servers without bind and is mainly here as a catch-all.
		 *
		 * @api private
		 */

		Router.prototype.wildcard = function generateHandler (req, res) {
			return function handleUnmatchedNext(err) {
				try {

					// Default server error handler
					if (err) {

						if ( typeof sails.config[500] === 'function' ) {
							sails.log.warn('sails.config[500] (i.e. `config/500.js`) has been superceded in Sails v0.10 by the `serverError.js` blueprint.');
							sails.log.warn('sails.config[500] will be deprecated in an upcoming release.');
							sails.log.warn('Please use the serverError blueprint instead. (i.e. api/blueprints/errors/serverError.js)');
							return sails.config[500](err, req, res);
						}

						if ( typeof sails.blueprints.serverError === 'function' ) {
							return sails.blueprints.serverError(err, req, res);
						}
						
						sails.log.error('An error occurred in a request, but no error handler is configured.');
						sails.log.error(err);
						return;
					}

					// Default 'not found' handler
					if ( typeof sails.config[404] === 'function' ) {
						sails.log.warn('sails.config[404] (i.e. `config/404.js`) has been superceded in Sails v0.10 by the `notFound.js` blueprint.');
						sails.log.warn('sails.config[404] will be deprecated in an upcoming release.');
						sails.log.warn('Please use the notFound blueprint instead. (i.e. api/blueprints/errors/notFound.js)');
						return sails.config[404](req, res);
					}
					
					if ( typeof sails.blueprints.notFound === 'function' ) {
						return sails.blueprints.notFound(req, res);
					}
					
					sails.log.verbose('A request did not match any routes, and no notFound handler is configured.');
					return;

				}
				catch(e) {
					sails.log.error('An error occurred in a request, and the core error handler also encountered an issue::');
					sails.log.error(e);
					return;
				}
			};
		};


		// Bind the context of all instance methods
		util.bindAll(this);

	}



	/**
	 * Ensure that request object has a minimum set of reasonable defaults.
	 * Used primarily as a test fixture.
	 *
	 * @api private
	 */

	function reasonableDefaultRequest(req) {
		return util.defaults(req || {}, {
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
	 * Used primarily as a test fixture.
	 *
	 * @api private
	 */

	function reasonableDefaultResponse(res) {
		return util.defaults(res || {}, {
			send: function(body, status) {
				res._cb(body, status);
			},
			json: function(body, status) {
				
				// Tolerate bad JSON
				var json = sails.util.stringify(body);
				if ( !json ) {
					var failedStringify = new Error(
						'Failed to stringify specified JSON response body :: ' + body
					);
					return res.send(failedStringify.stack, 500);
				}

				return res.send(json,status);
			}
		});
	}

};