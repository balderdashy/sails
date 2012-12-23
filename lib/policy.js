/**
 * Determine policy configuration (policy.js)
 */
var policyMap = { "*" : true };
var policyConfigModuleName = 'policy.js';
if(require('path').existsSync(sails.config.appPath + '/' + policyConfigModuleName)) {
	try {
		policyMap = _.extend(policyMap, require(sails.config.appPath + '/' + policyConfigModuleName));
	} catch(e) {
		sails.log.error("Invalid configuration detected in " + policyConfigModuleName + " :: " + e);
	}
}
module.exports = policyMap;