var path = require('path');

// Default policy mappings
var policy = {
	"*": true
};

// Load policy configuration (policy.js)
var policyConfigModule = 'policy';
if(path.existsSync(sails.config.appPath + '/' + policyConfigModule + '.js')) {
	try {
		policy = _.extend(policy, require(sails.config.appPath + '/' + policyConfigModule));
	} catch(e) {
		sails.log.error("Invalid configuration detected in " + policyConfigModule + "!", e);
		process.exit(1);
	}
}

module.exports = policy;