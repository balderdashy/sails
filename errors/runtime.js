/**
 * Module dependencies
 */
var argv = require('optimist').argv,
	util = require('../util'),
	Logger = require('../lib/hooks/logger/captains');


// Build logger using command-line arguments
var log = new Logger(util.getCLIConfig(argv).log);

/**
 * Runtime errors
 */
module.exports = {


};