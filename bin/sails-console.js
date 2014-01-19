#!/usr/bin/env node


/**
 * Module dependencies
 */

var Sails = require('../lib/app')
	, path  = require('path')
	, _     = require('lodash')
	, rconf = require('../lib/configuration/rc')
	, captains = require('captains-log')
	, REPL		= require('repl');

require('colors');


/**
 * `sails console`
 *
 * Enter the interactive console (aka REPL) for the app
 * in our working directory.
 */

module.exports = function () {

	var log = captains(rconf.log);

	console.log();
	log.info('Starting app in interactive mode...'.debug);
	console.log();

	// Now load up sails for real
	var sails = Sails();
	sails.lift(_.merge({}, rconf, {

		// Silence annoying warning
		// (if you're in the REPL, you already know.)
		express: {
			silenceMultipartWarning: true
		},

		// Disable ASCII ship to keep from dirtying things up
		log: {
			noShip: true
		}
	}), function(err) {
		if (err) return Err.fatal.failedToLoadSails(err);

		log.info('Welcome to the Sails console.');
		log.info(('( to exit, type '+'<CTRL>+<C>'+' )').grey);
		console.log();

		var repl = REPL.start('sails> ');
		repl.on('exit', function(err) {
			if (err) {
				log.error(err);
				process.exit(1);
			}
			process.exit(0);
		});

	});
};
