var _ = require('underscore');

/**
 * Determine policy configuration (policy.js)
 */
var policyConfigModuleName = 'policy';

try {
	module.exports = _.extend({ "*" : true },require(sails.config.appPath + '/' + policyConfigModuleName));
}
catch (e) {
	module.exports = { "*" : true };
}