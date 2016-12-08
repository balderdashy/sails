/**
 * Module dependencies
 */

var nodepath = require('path');
var _ = require('@sailshq/lodash');
var CaptainsLog = require('captains-log');
var Process = require('machinepack-process');
var rconf = require('../lib/app/configuration/rc')();



/**
 * `sails www`
 *
 * Run the `build` or `buildProd` Grunt task (depending on whether this is the production environment)
 * for the Sails app in the current working directory.
 *
 * @see http://sailsjs.org/documentation/reference/command-line-interface/sails-www
 */

module.exports = function() {
  var log = CaptainsLog(rconf.log);

  // The destination path.
  var wwwPath = nodepath.resolve(process.cwd(), './www');

  // Determine the appropriate Grunt task to run based on `process.env.NODE_ENV`, `rconf.prod`, and `rconf.environment`.
  var overrideGruntTask;
  if (rconf.prod || rconf.environment === 'production' || process.env.NODE_ENV === 'production') {
    overrideGruntTask = 'buildProd';
  }
  else {
    overrideGruntTask = 'build';
  }
  log.info('Compiling assets into standalone `www` directory with `grunt ' + overrideGruntTask + '`...');

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Execute a command like you would on the terminal.
  Process.executeCommand({
    command: 'grunt '+overrideGruntTask,
  }).exec(function (err) {
    if (err) {
      log.error('Error occured running `grunt ' + overrideGruntTask + '`');
      log.error('Please resolve any issues and try running `sails www` again.');
      log.error('Details:');
      log.error(err);
      return process.exit(1);
    }

    log.info();
    log.info('Created `www` directory at:');
    log.info(wwwPath);
    return process.exit(0);

  });//</ Process.executeCommand() >

};

