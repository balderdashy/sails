module.exports = function (sails) {


	/**
	 * Module dependencies.
	 */

	var _			= require( 'lodash' ),
	util			= require( '../util'),
	EventEmitter	= require('events').EventEmitter;


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

	function Router ( options ) {


		/**
		 * Expose a new Router
		 * 
		 * Link Express HTTP requests to a function which handles them
		 *
		 * @api public
		 */

		Router.prototype.load = function (cb) {

			sails.log.verbose('Loading router...');

			// Keep track of app route manifest
			// Even if this is just going to be passed over to Express,
			// we want to hold onto it here as well so we can introspect it and power 
			// more versatile routing and app reloading options
			this.routes = {
				'get'		: [],
				'post'		: [],
				'put'		: [],
				'head'		: [],
				'delete'	: [],
				'options'	: [],
				'trace'		: [],
				'copy'		: [],
				'lock'		: [],
				'mkcol'		: [],
				'move'		: [],
				'propfind'	: [],
				'proppatch'	: [],
				'unlock'	: [],
				'report'	: [],
				'mkactivity': [],
				'checkout'	: [],
				'merge'		: [],
				'm-search'	: [],
				'notify'	: [],
				'subscribe'	: [],
				'unsubscribe': [],
				'patch'		: []
			};

			// Maintain a reference to the static route config
			this.staticRoutes = sails.config.routes;

			// Save reference to sails logger
			this.log = sails.log;

			// Save self-reference in sails
			sails.router = this;

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
		 */

		Router.prototype.route = function (req, res) {

			// Make sure request and response objects have reasonable defaults
			// (will use the supplied definitions if possible)
			req = _.defaults(req || {}, {
				params: {},
				param: function (paramName) {
					return req.params[paramName];
				},
				path: '/',
				method: 'get'
			});
			res = _.defaults(res || {}, {
				send: function (body, status) {
					sails.emit('response', body, status, res);
				},
				json: function (body, status) {
					var json;

					try {
						json = JSON.stringify(body);
					}
					catch (e) {
						return res.send(e, 500);
					}

					res.send(json, status);
				}
			});


			// Simulate the Express router:
			// Find the next matching route
			// and call middleware in order
			var routes = this.routes[req.method];
			req._id = 0;
			runMiddleware();

			/*
			 * Basically a copy of Express's next() function
			 * This performs the next piece of middleware
			 */

			function runMiddleware (err) {

				console.log('Running middleware, id=',req._id, 'outof ',routes.length);

				// If this is the end of the line, stop
				// (this should never be reached, since the default 404 handler will kick in)
				if (req._id >= routes.length) {
					sails.log.warn('Unmatched route reached core-level 404 handler.');
					res.send('Not found.', 404);
					return;
				}

				// Grab the current route
				var route = routes[req._id];						

				// Increment iterator for next time
				req._id++;

				// Check # of arguments of route.target to determine whether this is an error middleware
				var isErrorMiddleware = route.target.length === 4;

				// Compare route regex to request path
				var routeMatch = req.path.match(route.regex);

				// Determine whether this middleware matches the request
				var match = routeMatch && (!err || isErrorMiddleware);

				// Either skip to next middleware (if there's not a match)
				if (!match) {
					runMiddleware(err);
					return;
				}

				// Or run error middleware
				if (err) {
					route.target( err, req, res, runMiddleware );
					return;
				}

				// Or run normal middleware
				route.target( req, res, runMiddleware );
			}
		};



		/**
		 * Bind new route(s)
		 *
		 * @param {String|RegExp} path
		 * @param {String|Object|Array|Function} bindTo
		 * @param {String} verb
		 * @api private
		 */

		Router.prototype.bind = require( './bind' )(sails);



		/**
		 * Unbind existing route
		 *
		 * @param {String} verb
		 * @param {String|RegExp} path
		 * @api private
		 */

		Router.prototype.unbind = function ( verb, path ) {
			sails.emit('router:unbind', {
				path: path,
				verb: verb
			});
		};



		/**
		 * Unbind all routes currently attached to the router
		 *
		 * @param {String} verb [optional]
		 * @api private
		 */

		Router.prototype.reset = function ( verb ) {

			// If no verb was specified, unbind everything
			if (!verb) {
				_.each(this.routes, function ( routes, method ) {
					this.reset(method);
				}, this);

				return;
			}

			// Unbind each route for the specified HTTP verb
			_.each(this.routes[verb] || [], function (route) {
				this.unbind(verb, route.path);
			}, this);

			// Remove all traces of the route's existence
			this.routes[verb] = [];

		};




		/**
		 * Wipe everything and bind routes.
		 *
		 * @api private
		 */

		Router.prototype.flush = function ( ) {

			this.reset();

			// Fired before static routes are bound
			sails.emit('router:before');

			// Use specified path to bind static routes
			_.each(this.staticRoutes, function (target, path) {
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
