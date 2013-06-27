module.exports = function (sails) {

	/**
	 * Module dependencies.
	 */

	var _		= require('lodash'),
		crypto	= require("crypto");


	return {

		// Generate session secret
		generateSecret: function () {
			
			// Combine random and case-specific factors into a base string
			var factors = {
				creationDate: (new Date()).getTime(),
				random: Math.random() * (Math.random() * 1000),
				nodeVersion: process.version
			};
			var basestring = '';
			_.each(factors, function (val) { basestring += val; });

			// Build hash
			var hash =	crypto.
						createHash("md5").
						update(basestring).
						digest("hex");

			return hash;
		},



		get: function (sessionId, cb) {
			return sails.config.session.store.get(sessionId, cb);
		},

		set: function (sessionId, data, cb) {
			return sails.config.session.store.set(sessionId, data, cb);
		}
	};
};
