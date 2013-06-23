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

			// Maintain a reference to our Express app
			this.app = sails.express.app;

			// Maintain a reference to the static route config
			this.staticRoutes = sails.config.routes;

			// Save reference to sails logger
			this.log = sails.log;

			// Save self-reference in sails
			sails.router = this;

			// Wipe any existing routes and bind them anew
			this.flush();

			cb();
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
		 * Unbind all routes currently attached to the router
		 *
		 * @param {String} verb
		 * @api private
		 */

		Router.prototype.reset = function ( verb ) {
			if (!verb) {

				// Reset the routes for each HTTP method
				return _.each(this.app.routes, function ( routes, method ) {
					this.reset(method);
				}, this);
			}
			this.app.routes[verb] = [];
		};




		/**
		 * Wipe everything and bind routes.
		 *
		 * @api private
		 */

		Router.prototype.flush = function ( ) {

			this.reset();

			sails.emit('routes:before');

			// Use specified path to bind sails.config.routes
			_.each(this.staticRoutes, function (target, path) {
				this.bind(path, target);
			}, this);

			sails.emit('routes:after');

		};




		// Bind the context of all instance methods
		_.bindAll(this);

	}

};
