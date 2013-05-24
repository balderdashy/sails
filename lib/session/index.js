var _ = require('lodash');

module.exports = {


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
		var hash = require("crypto")
		.createHash("md5")
		.update(basestring)
		.digest("hex");

		return hash;
	}
};