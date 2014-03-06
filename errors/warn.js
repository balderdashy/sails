/**
 * Module dependencies
 */
var path = require('path');

// Build logger using best-available information
// when this module is initially required.
var log = require('captains-log')(require('../lib/configuration/rc'));


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
		log.warn('If you run into compatibility issues, try installing '+requiredVersion+' locally:');
		log.warn('    $ npm install sails@' + requiredVersion);
		log.warn();
		log.blank();
	}
};
