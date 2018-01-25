/**
 * Module dependencies
 */

var path = require('path');
var _ = require('@sailshq/lodash');
var CaptainsLog = require('captains-log');
var Process = require('machinepack-process');
var chalk = require('chalk');
var flaverr = require('flaverr');
var rconf = require('../lib/app/configuration/rc')();


/**
 * `sails www`
 *
 * Run the `build` or `buildProd` Grunt task (depending on whether this is the production environment)
 * for the Sails app in the current working directory.
 *
 * @see http://sailsjs.com/documentation/reference/command-line-interface/sails-www
 */

module.exports = function() {

  // Check compatibility
  try {
    var pathToLocalPackageJson = path.resolve(process.cwd(), 'package.json');
    var packageJson;
    try {
      packageJson = require(pathToLocalPackageJson);
    } catch (e) {
      switch (e.code) {
        case 'MODULE_NOT_FOUND': throw flaverr('E_NO_PACKAGE_JSON', new Error('No package.json file.  Are you sure you\'re in the root directory of a Sails app?'));
        default: throw e;
      }
    }

    if (_.isUndefined(packageJson.dependencies)) {
      throw flaverr('E_NO_SAILS_DEP', new Error('This package.json file does not declare any dependencies.  Are you sure you\'re in the root directory of a Sails app?'));
    }

    if (!_.isObject(packageJson.dependencies) || _.isArray(packageJson.dependencies)) {
      throw flaverr('E_NO_SAILS_DEP', new Error('This package.json file has an invalid `dependencies` property -- should be a dictionary (plain JS object).'));
    }

    var sailsDepSVR = packageJson.dependencies.sails;
    if (!sailsDepSVR) {
      throw flaverr('E_NO_SAILS_DEP', new Error('This package.json file does not declare `sails` as a dependency.\nAre you sure you\'re in the root directory of a Sails app?'));
    }

    var shGruntDepSVR = packageJson.dependencies['sails-hook-grunt'] || packageJson.devDependencies['sails-hook-grunt'];
    if (!shGruntDepSVR) {
      throw flaverr('E_NO_SH_GRUNT_DEP', new Error('This app\'s package.json file does not declare `sails-hook-grunt` in "dependencies" or "devDependencies".\nAre you sure this is a Sails v1.0 app that is using Grunt?'));
    }

  } catch (e) {
    switch (e.code) {
      case 'E_NO_PACKAGE_JSON':
      case 'E_NO_SAILS_DEP':
        console.log('--');
        console.log(chalk.red(e.message));
        return process.exit(1);
      case 'E_NO_SH_GRUNT_DEP':
        console.log('--');
        console.log(chalk.red(e.message));
        console.log(chalk.gray('(Maybe try running `npm install sails-hook-grunt --save`?)'));
        return process.exit(1);

      default:
        console.log('--');
        console.log(chalk.bold('Oops, something unexpected happened:'));
        console.log(chalk.red(e.stack));
        console.log('--');
        console.log('Please read the error message above and troubleshoot accordingly.');
        console.log('(You can report suspected bugs at '+chalk.underline('http://sailsjs.com/bugs')+'.)');
        return process.exit(1);
    }
  }



  var log = CaptainsLog(rconf.log);

  // The destination path.
  var wwwPath = path.resolve(process.cwd(), 'www');

  // Determine the appropriate Grunt task to run based on `process.env.NODE_ENV`, `rconf.prod`, and `rconf.environment`.
  var overrideGruntTask;
  if (rconf.prod || rconf.environment === 'production' || process.env.NODE_ENV === 'production') {
    overrideGruntTask = 'buildProd';
  }
  else {
    overrideGruntTask = 'build';
  }
  log.info('Compiling assets into standalone directory with `grunt ' + overrideGruntTask + '`...');

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Execute a command like you would on the terminal.
  Process.executeCommand({
    command: path.join('node_modules', '.bin', 'grunt')+' '+overrideGruntTask,
  }).exec(function (err) {
    if (err) {
      log.error('Error occured running `grunt ' + overrideGruntTask + '`');
      log.error('Please resolve any issues and try running `sails www` again.');
      log.error('Hint: you must have the Grunt CLI installed!  Try `npm install grunt -g`.');
      log.error();
      log.error('Error details:');
      log.error(err);
      return process.exit(1);
    }

    log.info();
    log.info('Created directory of compiled assets at:');
    log.info(wwwPath);
    return process.exit(0);

  });//</ Process.executeCommand() >

};

