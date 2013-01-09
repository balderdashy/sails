var sails = {};

// Get Sails logger
sails.log = require('../lib/logger.js')();

// Extend w/ data from Sails package.json
var packageConfig = require('../lib/package.js');
sails.version = packageConfig.version;
sails.dependencies = packageConfig.dependencies;

////////////////////////////////////////////////////////////
// !!! TODO get actual user config
var userConfig = {
	appPath: '.'
};
////////////////////////////////////////////////////////////

// Merge user config with defaults
var configuration = require('../lib/configuration');
sails.config = configuration.build(configuration.defaults(userConfig), userConfig);

module.exports = sails;