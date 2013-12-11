/**
 * Module dependencies
 */
var argv = require('optimist').argv,
	cliutil = require('sails-util/cli'),
	Logger = require('../lib/hooks/logger/captains');


// Build logger using command-line arguments
var log = new Logger(cliutil.getCLIConfig(argv).log);

/**
 * Runtime errors
 */
module.exports = {


};