#!/usr/bin/env node

var argv = require('optimist').argv;

// Build sails instance
var sails = require('../lib');
sails.config = {
  appPath: process.cwd(),
  prod: argv.prod,

  // Indicate that this is a mock config
  mock: true
};
if(argv.verbose){
  sails.config.log = {level: 'verbose'};
}
if(argv.port){
  sails.config.port = argv.port;
}

require('../lib/configuration')(sails).load(function (err, config) {
  if (err) throw new Error(err);


  // Dependencies
  var _ = require('lodash'),
    utils = require('./utils.js')(sails),
    fs = utils.fs,
    generate = require('./generate.js')(sails),
    newSailsApp = require('./new.js')(sails);


  // If coffeescript is not installed, ignore silently
  try {
    require('coffee-script');
    sails.log.verbose('Enabling CoffeeScript...');
  } catch (e) {
    sails.log.verbose('CoffeeScript not installed.');
  }

  // Stringify args
  argv._ = _.map(argv._, function (arg) {
    return arg + '';
  });

  // Known errors
  var errors = {
    badLocalSails: function (requiredVersion) {
      return 'You may consider reinstalling Sails locally (npm install sails@' + requiredVersion + ').';
    }
  };

  // Read package.json file in specified path
  function getPackage(path) {
    path = require('underscore.string').rtrim(path, '/');
    var packageJson = fs.readFileSync(path + '/package.json', 'utf-8');
    try {
      packageJson = JSON.parse(packageJson);
    } catch (e) {
      return false;
    }
    return packageJson;
  }



  // Start this app
  if (argv._[0] && _.contains(['lift', 'raise', 'start', 'server', 's', 'l'], argv._[0])) {

    require('./lift.js')(sails)(argv);
  }




  // Check if console was requested, if so, launch console
  else if (_.contains(['console'], argv._[0])) {
    console.log();
    sails.log('Welcome to the Sails console (v' + sails.version + ')');
    sails.log('( to exit, type <CTRL>+<C> )');

    sails.lift({
      log: {
        level: 'silent'
      }
    }, function () {
      repl = require("repl").start("sails> ");
      repl.on('exit', function () {
        sails.log.verbose('Closing console');
        process.exit();
      });
    });

    return;
  }



  // Check for newer version and upgrade if available.
  else if (_.contains(['upgrade'], argv._[0])) {
    var sys = require('sys');
    var exec = require('child_process').exec;
    var child;
    var http = require('http');
    var newest;
    var current;
    var options = {
      host: 'registry.npmjs.org',
      port: 80,
      path: '/sails'
    };
    http.get(options, function (res) {
      var jsond = '';
      var body = '';
      res.on('data', function (chunk) {
        body += chunk;
      });
      res.on('end', function () {
        jsond = JSON.parse(body);
        if (jsond['dist-tags'].latest > sails.version) {
          // executes `pwd`
          child = exec("npm install sails@" + jsond['dist-tags'].latest, function (error, stdout, stderr) {
            if (error !== null) {
              console.log('exec error: ' + error);
            }
            console.log("Upgrade Complete:  You are now on Sails Version: " + jsond['dist-tags'].latest);
          });
        } else {
          console.log("Already Up To Date");
        }
      });
    }).on('error', function (e) {
      console.error(e);
    });
  }



  // Get the sails version
  else if (argv.v || argv.version || (argv._[0] && _.contains(['v', 'version'], argv._[0]))) {
    sails.log.info('v' + sails.version);
  }




  // Basic usage
  else if (argv._.length === 0) {
    console.log('');
    sails.log('Welcome to Sails! (v' + sails.version + ')');
    console.log('');
    sailsUsage();
  }



  // Generate file(s)
  else if (argv._[0] && (argv._[0].match(/^g$|^ge$|^gen$|^gene$|^gener$|^genera$|^generat$|^generate$/) || argv.g || argv.generate)) {

    verifyArg(1, 'Please specify the name for the new model and controller as the second argument.');


    // Generate a model
    if (argv._[1] === 'model') {
      var entity = argv._[2];
      verifyArg(2, 'Please specify the name for the new model as the third argument.');

      // Figure out attributes based on args
      var modelOpts = _.extend({}, argv);
      var args = argv._.splice(3);
      modelOpts.attributes = [];
      _.each(args, function (attribute, i) {
        var parts = attribute.split(':');
        if (!parts[1]) {
          sails.log.error('Please specify the type for attribute ' + (i + 1) + ' "' + parts[0] + '".');
          process.exit(1);
        }
        modelOpts.attributes.push({
          name: parts[0],
          type: parts[1].toUpperCase()
        });
      });

      sails.log.warn('For the record :: to serve the blueprint API for this model,');
      sails.log.warn('you\'ll also need to have an empty controller.');
      generate.generateModel(entity, modelOpts);
      sails.log.info("Generated model for " + entity + '!');
    }

    // Generate a controller
    else if (argv._[1] === 'controller') {
      verifyArg(2, 'Please specify the name for the new controller as the third argument.');

      // Figure out actions based on args
      var controllerOpts = _.clone(argv);
      controllerOpts.actions = argv._.splice(3);
      generate.generateController(argv._[2], controllerOpts);
      sails.log.info("Generated controller for " + argv._[2] + '!');
    }

    // Generate a view
    // TODO: Do this properly, per view engine!
    // else if(argv._[1] === 'view') {
    // 	var entity = argv._[2];
    // 	verifyArg(2, "Please specify the name for the new view as the third argument.");
    // 	// Figure out actions based on args
    // 	var options = _.extend({},argv);
    // 	options.actions = argv._.splice(3);
    // 	generate.generateView(entity, options);
    // }

    // TODO: Generate a policy

    // Generate an adapter
    else if (argv._[1] === 'adapter') {
      verifyArg(2, "Please specify the name for the new argument as the third argument.");

      // Figure out attributes based on args
      generate.generateAdapter(argv._[2], _.clone(argv));
      sails.log.info("Generated adapter for " + argv._[2] + '!');
    }
    // Otherwise generate a model and controller
    else {
      verifyArg(1, "Please specify the name of the entity as the second argument to generate a model, controller, and view.");
      sails.log.info("Generating model and controller for " + argv._[1] + '...');

      var generateOptions = _.clone(argv);
      generateOptions.actions = argv._.splice(2);
      generate.generateModel(argv._[1], generateOptions);
      generate.generateController(argv._[1], generateOptions);
    }
  }

  // Create a new app
  // second argument == app name
  else if (argv._[0].match(/^new$/)) {

    verifyArg(1, "Please specify the name of the new project directory to create: e.g.\n sails new <appName>");

    // Change to single options object we pass in.
    newSailsApp({
      appName: argv._[1],

      // Default to ejs templates for new projects, but allow user to override with --template
      templateLang: argv.template || 'ejs',

      // Default to not using the script linker functionality, 
      // but use it if --linker option is set
      useLinker: !!argv.linker
    });
  }

  // Build a www directory of everyting from /.tmp/public (aka /assets)
  else if (argv._[0].match(/^build$/)) {
    return sails.build();
  }

  /**
   * Run a management command. Management commands should take a single callback argument.
   * 
   * Usage: sails issue <foo>
   *    – where <foo> is exported from <sails.config.appPath>/commands
   */
  else if (argv._[0].match(/^(issue|run)$/)) {

    verifyArg(1, 'Please specify the name of the command to run: e.g.\n sails run <command>');

    var command = argv._[1],
        commands;

    try {
      commands = require(sails.config.appPath + '/commands');
    } catch(e) {
      sails.log.error('\nModule not found. Tips:\n' +
        '* Make sure to run this command from your app path where app.js is located.\n' +
        '* Make sure commands/index.js" exists at your app root.');
      process.exit(e.code);
    }

    if (!_.has(commands, command)) {
      sails.log.error('Command not found. Does ' + sails.config.appPath + '/commands/index.js export "' + command + '"?');
      process.exit(1);
    }

    sails.lift({
      log: {
        level: 'silent'
      }
    }, function () {
      sails.log.verbose('Issuing task "' + command + '"...');
      commands[command](function() {
        sails.log.verbose('Crew successfully carried out their task: "' + command + '"!');
        process.exit();
      });
    });

    return;
  }

  // Unknown command, print out usage
  else {
    console.log('');
    sailsUsage();
    sails.log.error(argv._[0] + ' is not a valid action.');
  }

  // Display usage
  function sailsUsage() {
    function leftColumn(str) {
      var n = (33 - str.length);
      return str + require('underscore.string').repeat(' ', n);
    }

    var usage = 'Usage: sails <command>\n\n';
    usage += leftColumn('sails lift') + 'Run the Sails app in the current dir (if node_modules/sails exists, it will be used instead of the global install)\n';
    usage += leftColumn('  [--dev]') + 'in development environment \n';
    usage += leftColumn('  [--prod]') + 'in production environment \n';
    usage += leftColumn('  [--port 9000]') + 'on port 9000 \n';
    usage += leftColumn('  [--verbose]') + 'with verbose logging enabled \n';
    usage += leftColumn('sails console') + 'Run this Sails app (in the current dir & in interactive mode.)\n';
    usage += leftColumn('sails new <appName>') + 'Create a new Sails project in a folder called <appName>\n';
    usage += leftColumn('sails new <appName> --linker') + 'Create a new Sails project in a folder called <appName>, using automatic asset linking\n';
    usage += leftColumn('sails generate <foo>') + 'Generate api/models/Foo.js and api/controllers/FooController.js\n';
    usage += leftColumn('sails generate model <foo>') + 'Generate api/models/Foo.js\n';
    usage += leftColumn('sails generate controller <foo>') + 'Generate api/controllers/FooController.js\n';
    usage += leftColumn('sails version') + 'Get the current globally installed Sails version\n';
    usage += leftColumn('sails run <command>') + 'Run a management command (exported by YOUR_APP/commands/index.js)';

    sails.log.info(usage);
  }

  // Verify that an argument exists
  function verifyArg(argNo, msg) {
    if (!argv._[argNo]) {
      sails.log.error(msg);
      process.exit(1);
    }
  }
});