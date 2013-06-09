var async = require('async');
var _ = require('lodash');

var Router = require('../router');

// Map Routes
// Link Express HTTP requests to a function which handles them
// *** NOTE: MUST BE AFTER app.configure in order for bodyparser to work ***
module.exports = function (cb) {
	sails.log.verbose('Loading router...');

	// Instantiate router for the first time
	var router = new Router();

	// Build middleware cache
	router.build();

	// Bind routes
	router.route();

	// listen(require('../router/bindExpressRoute'));

	cb();
};