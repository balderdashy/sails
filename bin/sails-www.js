#!/usr/bin/env node


/**
 * Module dependencies
 */

var nodepath = require('path');
var _ = require('lodash');
var CaptainsLog = require('captains-log');
var Sails = require('../lib/app');
var rconf = require('../lib/app/configuration/rc');
var __Grunt = require('../lib/hooks/grunt');
var Err = require('../errors');

/**
 * `sails www`
 *
 * Run the `grunt build` task
 */

module.exports = function() {
  var log = CaptainsLog(rconf.log);

  var wwwPath = nodepath.resolve(process.cwd(), './www'),
    GRUNT_TASK_NAME = 'build',
    GRUNT_TASK_PROD_NAME = 'buildProd';

  var sails = Sails();
  sails.load(_.merge({}, rconf, {
    hooks: {
      grunt: false
    },
    globals: false
  }), function sailsReady(err) {
    if (err) return Err.fatal.failedToLoadSails(err);

    var overrideGruntTask = (sails.config.environment == 'production' ? GRUNT_TASK_PROD_NAME : GRUNT_TASK_NAME)

    // Run Grunt task
    var Grunt = __Grunt(sails);

    log.info('Compiling assets into standalone `www` directory with `grunt ' + overrideGruntTask + '`...');
    Grunt.runTask(overrideGruntTask);

    // Bind error event
    sails.on('hook:grunt:error', function(err) {
      log.error('Error occured starting `grunt ' + overrideGruntTask + '`');
      log.error('Please resolve any issues and try running `sails www` again.');
      log.error(err);
      process.exit(1);
    });

    // Task is not actually complete yet-- it's just been started
    // We'll bind an event listener so we know when it is
    sails.on('hook:grunt:done', function() {
      log.info();
      log.info('Created `www` directory at:');
      log.info(wwwPath);
      process.exit(0);
    });
  });
};
