module.exports = function (cb) {
	sails.log.verbose('Loading app adapters...');

	// Load custom adapters
	// Case-insensitive, using filename to determine identity
	sails.adapters = require('../moduleloader').optional({
		dirname		: sails.config.paths.adapters,
		filter		: /(.+Adapter)\.(js|coffee)$/,
		replaceExpr	: /Adapter/
	});

	// Include default adapters automatically
	// (right now, that's just defaultAdapterName)
	sails.adapters[sails.defaultAdapterModule] = require(sails.defaultAdapterModule);

	cb();
};