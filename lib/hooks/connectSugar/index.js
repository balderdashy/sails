module.exports = function (sails) {


	/**
	 * Module dependencies.
	 */


	var _		= require( 'lodash' );



	/**
	 * Expose Hook definition
	 * Extend middleware req/res for this route w/ new methods.
	 */

	return {

		// initialize: function(cb) {
		// 	async.auto({
		// 		modules: loadModules,
		// 		start: ['modules', this.start]
		// 	}, cb);
		// },

		/**
		 * Routes to bind before or after routing
		 */

		routes: {

			before: {
				'*' : function addSugarMethods (req, res, next) {
					res.error = function respondWithError (err, statusCode) {

						// Argument defaults
						err = err || 'Unexpected error occurred.';
						statusCode = statusCode || 500;


						if (err instanceof Error) {
							return res.send(err.toString(), statusCode);
						}

						if (_.isObject(err)) {
							return res.json(err, statusCode);
						}
						
						return res.send(err, statusCode);
						
					};

					next();
				}
			},

			after: {}
		}
	};

};
