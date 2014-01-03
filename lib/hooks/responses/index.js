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
				sails.log.warn('Please define a "response" instead. (i.e. api/responses/serverError.js)');
				sails.log.warn('Your old handler will be ignored.');
			}
			if ( typeof sails.config[404] === 'function' ) {
				sails.log.warn('sails.config[404] (i.e. `config/404.js`) has been superceded in Sails v0.10.');
				sails.log.warn('Please define a "response" instead. (i.e. api/responses/notFound.js)');
				sails.log.warn('Your old handler will be ignored.');
			}
		},
		
		/**
		 * Fetch relevant modules, exposing them on `sails` subglobal if necessary,
		 */
		loadModules: function (cb) {
			sails.log.verbose('Loading runtime custom response definitions...');
			sails.modules.loadResponses(function loadedRuntimeErrorModules (err, responseDefs) {
				if (err) return cb(err);
				
				// Expose `responses` object on `sails`.
				sails.responses = responseDefs;
				cb();
			});
		}
	};
};

