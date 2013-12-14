/**
 * Module dependencies
 */
var argv = require('optimist').argv,
	util = require('sails-util'),
	Logger = require('captains-log'),
	path = require('path');


// Build logger using command-line arguments
var log = new Logger(util.getCLIConfig(argv).log);


/**
 * Warnings
 */
module.exports = {

	incompatibleLocalSails: function(requiredVersion, localVersion) {
		log.warn('Trying to lift sails in', path.resolve(process.cwd(), 'node_modules/sails') + '...');
		log.warn('But the package.json in the current directory indicates a dependency');
		log.warn('on Sails ' + requiredVersion + ' and the locally installed Sails is ' + localVersion + '!');
		console.log();
		log.warn('If you run into compatibility problems, you may consider reinstalling Sails locally:');
		log.warn('> npm install sails@' + requiredVersion);
	}
};
