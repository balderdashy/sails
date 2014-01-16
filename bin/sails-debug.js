#!/usr/bin/env node


/**
 * Module dependencies
 */

var Sails = require('../lib/app')
	, path  = require('path')
	, captains = require('captains-log');


/*

# This is here for backwards compatibility.
node --debug `which sails` $@
*/


module.exports = function () {
	var config = {};
	var log = captains(config.log);
};
