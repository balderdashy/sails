#!/usr/bin/env node


/**
 * Module dependencies
 */

var Sails = require('../lib/app')
	, path  = require('path')
	, _  = require('lodash')
	, rconf = require('../lib/configuration/rc')
	, captains = require('captains-log');


/**
 * `sails www`
 *
 * Run the `grunt build` task
 */

module.exports = function () {
	var log = captains(rconf.log);

	var wwwPath = path.resolve( process.cwd(), './www' ),
			GRUNT_TASK_NAME = 'build';

	log.info('Compiling assets into standalone `www` directory with `grunt ' + GRUNT_TASK_NAME + '`...');

	var sails = Sails();
	sails.load(_.merge({},rconf,{
		hooks: {
			grunt: false
		},
		globals: false
	}), function sailsReady (err) {
		if (err) return Err.fatal.failedToLoadSails(err);

		// Run Grunt task
		var Grunt = require('../lib/hooks/grunt')(sails);
		Grunt.runTask(GRUNT_TASK_NAME);

		// Bind error event
		sails.on('hook:grunt:error', function (err) {
			log.error('Error occured starting `grunt ' + GRUNT_TASK_NAME + '`');
			log.error('Please resolve any issues and try running `sails www` again.');
			log.error(err);
			process.exit(1);
		});

		// Task is not actually complete yet-- it's just been started
		// We'll bind an event listener so we know when it is
		sails.on('hook:grunt:done', function () {
			log.info();
			log.info('Created `www` directory at:');
			log.info(wwwPath);
			process.exit(0);
		});
	});
};