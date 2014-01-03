/**
 * Dependencies
 */
var _ = require('lodash');
var Err = require('root-require')('errors/fatal');


/**
 * Expose hook definition
 */
module.exports = function(sails) {
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

				// Check that the user reserved response methods/properties
				var reservedResKeys = [
					'view',
					'status', 'set', 'get', 'cookie', 'clearCookie', 'redirect',
					'location', 'charset', 'send', 'json', 'jsonp', 'type', 'format',
					'attachment', 'sendfile', 'download', 'links', 'locals', 'render'
				];

				_.each(Object.keys(responseDefs), function (userResponseKey) {
					if (_.contains(reservedResKeys, userResponseKey)) {
						return Err.invalidCustomResponse(userResponseKey);
					}
				});
				
				// Expose `responses` object on `sails`.
				sails.responses = responseDefs;
				return cb();
			});
		}
	};
};

