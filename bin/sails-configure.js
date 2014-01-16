#!/usr/bin/env node


/**
 * Module dependencies
 */

var captains = require('captains-log');



module.exports = function ( ) {

	var config = {};
	var log = captains(config.log);

	log.info('To configure the Sails command-line interface, create a `.sailsrc` file.');
	console.log();
	log.warn('The `.sailrc` specification is currently an experimental feature.');
	log.warn('Please share your feedback on Github! (http://github.com/balderdashy/sails)');
	return;
};
