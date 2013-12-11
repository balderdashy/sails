module.exports = function (sails) {


	/**
	 * Module dependencies.
	 */

	var util	= require( 'sails-util' );



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
		 * Load method is fired when registry is loaded.
		 * This gives us the opportunity to load global middleware asynchronously
		 *
		 * @api private
		 */

		this.load = function (cb) {
			
			sails.log.verbose('Instantiate middleware registry...');

			// Save self-reference in sails
			sails.middleware = this;

			// Iterate through hooks and absorb the middleware therein
			util.each(sails.hooks, function (hook, id) {

				// Namespace middleware under hook id
				this[id] = hook.middleware;

			}, this);

			return cb();
		};
		
		// Bind the context of all instance methods
		util.bindAll(this);

	}

};
