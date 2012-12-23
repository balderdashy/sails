// Load application's custom access policies (/policies) from directory
// CASE SENSITIVE :: USES FILENAME (i.e. ApiService)
var policies = {};

if(path.existsSync(sails.config.appPath + '/policies')) {
	_.each(require('require-all')({
		dirname: sails.config.appPath + '/policies',
		filter: /(.+)\.js$/
	}), function(policy, filename) {
		policies[filename] = policy;
	});
}

// TODO: think up a better way of doing this
sails.policies = policies;

// Default access policy mappings
var acl = {
	"*": true
};

// Load access policy configuration (policy.js)
var aclConfigModule = 'access_control';
if(path.existsSync(sails.config.appPath + '/' + aclConfigModule + '.js')) {
	try {
		acl = _.extend(acl, require(sails.config.appPath + '/' + aclConfigModule));
	} catch(e) {
		sails.log.error("Invalid policy detected in " + aclConfigModule + " configuration!", e);
		process.exit(1);
	}
}

// Export policy and acl dictionaries
_.extend(module.exports,{
	policies: policies,
	acl: acl
});