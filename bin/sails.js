#!/usr/bin/env node


/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');
var program = require('./private/patched-commander');
var sailsPackageJson = require('../package.json');
var NOOP = function() {};



program
  .version(sailsPackageJson.version, '-v, --version');


//
// Normalize version argument, i.e.
//
// $ sails -v
// $ sails -V
// $ sails --version
// $ sails version
//


// make `-v` option case-insensitive
process.argv = _.map(process.argv, function(arg) {
  return (arg === '-V') ? '-v' : arg;
});


// $ sails version (--version synonym)
program
  .command('version')
  .description('')
  .action(program.versionInformation);



program
  .unknownOption = NOOP;
program.usage('[command]');


// $ sails lift
var cmd;
cmd = program.command('lift');
cmd.option('--prod');
cmd.option('--port [port]');
cmd.option('--silent');
cmd.option('--verbose');
cmd.option('--silly');
cmd.unknownOption = NOOP;
cmd.description('');
cmd.alias('l');
cmd.action(require('./sails-lift'));


// $ sails new <appname>
cmd = program.command('new [path_to_new_app]');
// cmd.option('--dry');
cmd.option('--viewEngine [viewEngine]');
cmd.option('--template [viewEngine]');
cmd.usage('[path_to_new_app]');
cmd.unknownOption = NOOP;
cmd.description('');
cmd.action(require('./sails-new'));


// $ sails generate <module>
cmd = program.command('generate');
// cmd.option('--dry');
cmd.unknownOption = NOOP;
cmd.description('');
cmd.usage('[something]');
cmd.action(require('./sails-generate'));

// $ sails upgrade
cmd = program.command('upgrade');
cmd.unknownOption = NOOP;
cmd.description('');
cmd.action(require('./sails-upgrade'));

// $ sails deploy
cmd = program.command('deploy');
// cmd.option('--dry');
cmd.unknownOption = NOOP;
cmd.description('');
cmd.usage('');
cmd.action(require('./sails-deploy'));


// $ sails console
cmd = program.command('console');
cmd.option('--silent');
cmd.option('--verbose');
cmd.option('--silly');
cmd.unknownOption = NOOP;
cmd.description('');
cmd.alias('c');
cmd.action(require('./sails-console'));


// $ sails www
// Compile `assets` directory into a standalone `www` folder.
cmd = program.command('www');
cmd.unknownOption = NOOP;
cmd.description('');
cmd.action(require('./sails-www'));



// $ sails debug
cmd = program.command('debug');
cmd.unknownOption = NOOP;
cmd.description('');
cmd.action(require('./sails-debug'));



//
// Normalize help argument, i.e.
//
// $ sails --help
// $ sails help
// $ sails
// $ sails <unrecognized_cmd>
//


// $ sails help (--help synonym)
cmd = program.command('help [command]');
cmd.description('');
cmd.action(function(){
  if (program.args.length > 1 && _.isString(program.args[0])) {
    var helpCmd = _.find(program.commands, {_name: program.args[0]});
    if (helpCmd) {
      helpCmd.help();
      return;
    }
  }
  program.help();
});



// $ sails <unrecognized_cmd>
// Output Sails help when an unrecognized command is used.
program
  .command('*')
  .action(function(cmd){
    console.log('\n  ** Unrecognized command:', cmd, '**');
    program.help();
  });



// Don't balk at unknown options
program.unknownOption = NOOP;



// $ sails
//
program.parse(process.argv);
var NO_COMMAND_SPECIFIED = program.args.length === 0;
if (NO_COMMAND_SPECIFIED) {
  program.help();
}
