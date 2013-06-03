var async = require('async');
var _ = require('lodash');

// Map Routes
// Link Express HTTP requests to a function which handles them
// *** NOTE: MUST BE AFTER app.configure in order for bodyparser to work ***
module.exports = function (cb) {
	sails.log.verbose('Loading router...');

	require('../router').listen(require('../router/bindExpressRoute'));

	cb();
};