var sails = {};

// Get Sails logger
sails.log = require('../lib/util/logger')();

// Extend w/ data from Sails package.json
var packageConfig = require('../lib/configuration/package');
sails.version = packageConfig.version;
sails.dependencies = packageConfig.dependencies;

// Invent the simplest possible user config
var userConfig = {
	appPath: process.cwd()
};

// Merge user config with defaults
var configuration = require('../lib/configuration');
sails.config = configuration.build(configuration.defaults(userConfig), userConfig);

module.exports = sails;