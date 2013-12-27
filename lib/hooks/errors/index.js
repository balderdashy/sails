module.exports = function(sails) {
	

	/**
	 * Expose hook definition
	 */
	return {

		defaults: {},

		
		/**
		 * Fetch relevant modules, exposing them on `sails` subglobal if necessary,
		 */
		loadModules: function (cb) {
			sails.log.verbose('Loading runtime error definitions...');
			sails.modules.loadErrors(function loadedRuntimeErrorModules (err, errorDefs) {
				if (err) return cb(err);
				// Expose `errors` object on `sails`.
				sails.errors = errorDefs;
				cb();
			});
		}
	};
};



// Default 404 (not found) handler
		// notFound: function (req, res) {
		// 	res.send(404);
		// },

		// // Default 500 (server error) handler
		// serverError: function (errors, req, res) {
		// 	res.send(500, errors || undefined);
		// },

		// // Default 403 (forbidden) handler
		// forbidden: function (errors, req, res) {
		// 	res.send(403, errors || undefined);
		// },

		// // Default 400 (bad request) handler
		// badRequest: function (errors, redirectTo, req, res) {
		// 	res.send(400, errors || undefined);
		// }
