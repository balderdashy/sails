module.exports = function (cb) {
	sails.log.verbose('Loading app services...');

	// Load app's service modules (case-insensitive)
	sails.services = require('../moduleloader').optional({
		dirname		: sails.config.paths.services,
		filter		: /(.+)\.(js|coffee)$/,
		caseSensitive: true
	});
	cb();
};