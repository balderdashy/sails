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
			
			// Save reference to Sails logger
			this.log = sails.log;

			// Save self-reference in sails
			sails.middleware = this;

			// Iterate through hooks and absorb the middleware therein
			_.each(sails.hooks, function (hook, id) {
				_.extend(this, hook.middleware);
			}, this);

			return cb();
		};
		
		// Bind the context of all instance methods
		_.bindAll(this);

	}

};
