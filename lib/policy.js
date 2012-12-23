/**
 * Determine policy configuration (policy.js)
 */
var policyConfigModuleName = 'policy.js';

try {
	module.exports = require(sails.config.appPath + '/' + policyConfigModuleName) || { "*" : true };
}
catch (e) {
	module.exports = { "*" : true };
}