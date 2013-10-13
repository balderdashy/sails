module.exports = function (sails) {


	/**
	 * Module dependencies.
	 */

	var _		= require( 'lodash' ),
		async	= require( 'async' );



	/**
	 * Expose new instance of `MiddlewareRegistry`
	 *
	 * @api private
	 */

	return new MiddlewareRegistry();


	/**
	 * `MiddlewareRegistry`
	 *
	 * NOTE: There's no guarantee that any dependencies are in place until load() fires
	 *
	 * @api private
	 */

	function MiddlewareRegistry ( ) {

		// Save self-reference in sails object
		sails.middleware = this;


		/**
		 * Import middleware from all hooks
		 *
		 * Load method is fired when registry is loaded
		 * This gives us the opportunity to load global middleware asynchronously
		 *
		 * @api private
		 */

		this.load = function (cb) {
			
			sails.log.verbose('Instantiate middleware registry...');

			// Iterate through hooks and absorb the middleware therein
			_.each(sails.hooks, function (hook, id) {

				// Namespace middleware under hook id
				this[id] = hook.middleware;

			}, this);

			return cb();
		};


		// Default 404 (not found) handler
		this[404] = function notFound (req, res) {
			res.send(404);
		};

		// Default 500 (server error) handler
		this[500] = function serverError (errors, req, res) {
			res.send(errors || undefined, 500);
		};

		// Default 403 (forbidden) handler
		this[403] = function forbidden (message, req, res) {
			res.send(message || undefined, 403);
		};

		// Default 400 (bad request) handler
		this[400] = function badRequest (errors, redirectTo, req, res) {
			res.send(errors || undefined, 400);
		};

		
		// Bind the context of all instance methods
		_.bindAll(this);

	}

};
