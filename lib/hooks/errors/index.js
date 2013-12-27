module.exports = function(sails) {
	

	/**
	 * Expose hook definition
	 */
	return {

		defaults: {},


		configure: function () {

			// Legacy (< v0.10) support for configured handler
			if ( typeof sails.config[500] === 'function' ) {
				sails.log.warn('sails.config[500] (i.e. `config/500.js`) has been superceded in Sails v0.10.');
				sails.log.warn('Please define an `error` instead. (i.e. api/errors/serverError.js)');
				sails.log.warn('Your old handler will be ignored.');
			}
			if ( typeof sails.config[404] === 'function' ) {
				sails.log.warn('sails.config[404] (i.e. `config/404.js`) has been superceded in Sails v0.10.');
				sails.log.warn('Please define a response `error` instead. (i.e. api/errors/notFound.js)');
				sails.log.warn('Your old handler will be ignored.');
			}
		},
		
		/**
		 * Fetch relevant modules, exposing them on `sails` subglobal if necessary,
		 */
		loadModules: function (cb) {
			sails.log.verbose('Loading runtime error definitions...');
			sails.modules.loadErrors(function loadedRuntimeErrorModules (err, errorDefs) {
				if (err) return cb(err);
				
				// Expose `errors` object on `sails` with the error handlers.
				// (NOTE: keys are all lower-cased)
				sails.errors = errorDefs;
				cb();
			});
		}
	};
};

