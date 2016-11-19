#!/usr/bin/env node


/**
 * Module dependencies
 */

var nodepath = require('path');
var _ = require('@sailshq/lodash');
var CaptainsLog = require('captains-log');
var Sails = require('../lib/app');
var rconf = require('../lib/app/configuration/rc');
var GruntHookDef = require('../lib/hooks/grunt');
var Err = require('../errors');




/**
 * `sails www`
 *
 * Run the `build` or `buildProd` Grunt task (depending on whether this is the production environment)
 * for the Sails app in the current working directory.
 *
 * @stability 2
 * @see http://sailsjs.org/documentation/reference/command-line-interface/sails-www
 */

module.exports = function() {
  var log = CaptainsLog(rconf.log);

  // The destination path.
  var wwwPath = nodepath.resolve(process.cwd(), './www');

  // Note that we _load_ but _don't lift_ the app.  That means that the HTTP/Socket.io
  // servers will not actually listen on ports.
  var sails = Sails();
  sails.load(_.merge({}, rconf, {
    // We leave Grunt disabled
    // (since we do all the Grunting ourselves using the raw hook definition below)
    hooks: { grunt: false }
  }), function whenAppIsLoaded(err) {
    if (err) {
      return Err.fatal.failedToLoadSails(err);
    }

    // Determine the appropriate Grunt task to run based on `sails.config.environment`
    // (which is itself based on NODE_ENV).
    var overrideGruntTask;
    if (sails.config.environment === 'production') {
      overrideGruntTask = 'buildProd';
    }
    else {
      overrideGruntTask = 'build';
    }
    log.info('Compiling assets into standalone `www` directory with `grunt ' + overrideGruntTask + '`...');

    // Pass in our app (`sails`) to the hook definition (factory function) in order to get
    // a "hydrated" Grunt hook (a dictionary with methods and other fine goods)
    var hydratedGruntHook = GruntHookDef(sails);

    // Now use that sopping hook definition to run the appropriate Grunt task.
    // (by the way, `runTask` is technically a private method, and so should not
    //  be relied upon in userland code outside of Sails core.  Its usage may be
    //  tweaked in a subsequent release.)
    hydratedGruntHook.runTask(overrideGruntTask);

    // Listen for `hook:grunt:error` event from the Grunt hook-- if fired,
    // this means the Grunt child process exited with a non-zero status code.
    // (meaning that someting went awry.)
    sails.on('hook:grunt:error', function(err) {
      log.error('Error occured running `grunt ' + overrideGruntTask + '`');
      log.error('Please resolve any issues and try running `sails www` again.');
      log.error('Details:');
      log.error(err);
      process.exit(1);
    });

    // Listen for `hook:grunt:done` event from the Grunt hook-- if fired,
    // this means the Grunt child process exited with a zero status code.
    // (meaning that everything worked as expected!)
    sails.on('hook:grunt:done', function() {
      log.info();
      log.info('Created `www` directory at:');
      log.info(wwwPath);
      process.exit(0);
    });
  });
};
