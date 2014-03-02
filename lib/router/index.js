/**
 * Module dependencies.
 */

var _ = require('lodash')
	, express = require('express');



module.exports = function(sails) {


	var defaultHandlers = require('./bindDefaultHandlers')(sails);


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
		 * This internal "slave" instance of an Express app object
		 * is used only for routing. (i.e. it will not be used for 
		 * listening to actual HTTP requests; instead, one or more 
		 * delegate servers can be attached- see the `http` or 
		 * `sockets` hooks for examples of attaching a server to
		 * Sails)
		 *
		 * NOTE: Requires calling `load()` before use in order to
		 * provide access to the proper NODE_ENV, since Express
		 * uses that to determine its environment (development vs.
		 * production.)
		 */

		Router.prototype._slave;





		/**
		 * `sails.router.load()`
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
			this._slave = express();

			// Maintain a reference to the static route config
			this.explicitRoutes = sails.config.routes;

			// Save reference to sails logger
			this.log = sails.log;

			// Expose router on `sails` object
			sails.router = this;

			// Wipe any existing routes and bind them anew
			this.flush();

			// Listen for requests
			sails.on('router:request', this.route);

			// Listen for unhandled errors and unmatched routes
			sails.on('router:request:500', defaultHandlers[500]);
			sails.on('router:request:404', defaultHandlers[404]);

			cb();
		};



		/**
		 * `sails.router.route()`
		 * 
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
		 * @param {Function} next [optional callback- used to populate default res.send() behavior]
		 * @api private
		 */

		Router.prototype.route = function(req, res, next) {

			// Bundle raw callback function
			res._cb = next || function noRouteCbSpecified (err) { if (err) return sails.log.error(err); };

			// Track request start time
			req._startTime = new Date();

			// Make sure request and response objects have reasonable defaults
			// (will use the supplied definitions if possible)
			req = reasonableDefaultRequest(req);
			res = reasonableDefaultResponse(res);

			// Use our slave router to route the request
			this._slave.router(req, res, function handleUnmatchedNext(err) {

				//
				// In the event of an unmatched `next()`, `next('foo')`,
				// or `next('foo', errorCode)`...
				// 
				
				// Use the default server error handler
				if (err) {
					sails.emit('router:request:500', err, req, res);
					return;
				}

				// Or the default not found handler
				sails.emit('router:request:404', req, res);
				return;
			});

		};



		/**
		 * `sails.router.bind()`
		 * 
		 * Bind new route(s)
		 *
		 * @param {String|RegExp} path
		 * @param {String|Object|Array|Function} bindTo
		 * @param {String} verb
		 * @api private
		 */

		Router.prototype.bind = require('./bind')(sails);



		/**
		 * `sails.router.unbind()`
		 * 
		 * Unbind existing route
		 *
		 * @param {Object} route
		 * @api private
		 */

		Router.prototype.unbind = function(route) {

			// Inform attached servers that route should be unbound
			sails.emit('router:unbind', route);

			// Remove route in internal router
			var newRoutes = [];
			_.each(this._slave.routes[route.method], function(expressRoute) {
				if (expressRoute.path != route.path) {
					newRoutes.push(expressRoute);
				}
			});
			this._slave.routes[route.method] = newRoutes;

		};



		/**
		 * `sails.router.reset()`
		 * 
		 * Unbind all routes currently attached to the router
		 *
		 * @api private
		 */

		Router.prototype.reset = function () {

			// Unbind everything
			_.each(this._slave.routes, function(routes, httpMethod) {
				
				// Unbind each route for the specified HTTP verb
				var routesToUnbind = this._slave.routes[httpMethod] || [];
				_.each(routesToUnbind, this.unbind, this);

			}, this);


			// Emit reset event to allow attached servers to
			// unbind all of their routes as well		
			sails.emit('router:reset');

		};



		/**
		 * `sails.router.flush()`
		 * 
		 * Unbind all current routes, then re-bind everything, re-emitting the routing
		 * lifecycle events (e.g. `router:before` and `router:after`)
		 *
		 * @param {Object} routes - (optional)
		 *  If specified, replaces `this.explicitRoutes` before flushing.
		 *
		 * @api private
		 */

		Router.prototype.flush = function( routes ) {

			// Wipe routes
			this.reset();

			// Fired before static routes are bound
			sails.emit('router:before');

			// If specified, replace `this.explicitRoutes`
			if (routes) {
				this.explicitRoutes = routes;
			}

			// Use specified path to bind static routes
			_.each(this.explicitRoutes, function(target, path) {
				this.bind(path, target);
			}, this);


			// Fired after static routes are bound
			sails.emit('router:after');
		};


		// Bind the context of all instance methods
		_.bindAll(this);

	}




	// 
	// TODO:
	// replace w/ req.js and res.js:
	// 

	/**
	 * Ensure that request object has a minimum set of reasonable defaults.
	 * Used primarily as a test fixture.
	 *
	 * @api private
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
	 * Used primarily as a test fixture.
	 *
	 * @api private
	 */

	function reasonableDefaultResponse(res) {
		return _.defaults(res || {}, {
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