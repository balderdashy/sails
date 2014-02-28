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
		log.warn('Trying to lift app using a local copy of `sails`');
		log.warn('(located in '+path.resolve(process.cwd(), 'node_modules/sails') + ')');
		log.warn();
		log.warn('But the package.json in the current directory indicates a dependency');
		log.warn('on Sails `' + requiredVersion + '`, and the locally installed Sails is `' + localVersion + '`!');
		log.warn();
		log.warn('If you run into compatibility problems, try reinstalling Sails locally:');
		log.warn('    $ npm install sails@' + requiredVersion);
		log.warn();
		console.log();
	}
};
