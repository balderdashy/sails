var sys = require('sys');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var sails = require('../lib/sails');

var parley = require('parley');
var $ = new parley();

// Build log
var log = sails.log;

// Build deferred log
var $log = function (msg) {
	return $(function (msg, xcb) {
		sails.log(msg);
		xcb();
	})(msg);
};

// Execute a cmd, then trigger callback when it finishes
function runTest(cmd, cb) {
	log();
	var test = exec(cmd);
	test.stdout.on('data', sys.print);
	test.stderr.on('data', log.error);
	test.on('exit', function (code) {
		if (code) return cb("Returned with code: "+code);
		else return cb();
	});
}
var $runTest = function (cmd) {
	return $(runTest)(cmd);
};


$log('Running tests...');

//////////////////////////////////////////////////////
// Run user-level integration tests for core modules
//////////////////////////////////////////////////////

// - Server starts successfully
// - CLI (sails generate, sails new, etc.)
$log('Testing cli)...');
$runTest('node ./node_modules/mocha/bin/mocha --ignore-leaks --recursive -b -R nyan -t 8000 test/cli');
// - all modules included properly
// - configuration applied properly
// - services are accessible
// - active record (aka waterline)
$log('Testing waterline (ORM)...');
$runTest('node ./node_modules/mocha/bin/mocha --ignore-leaks --recursive -b -R nyan -t 8000 test/waterline');

//////////////////////////////////////////////////////
// Run web integration tests
//////////////////////////////////////////////////////

// - HTTP: Specified routes work appropriately
// - HTTP: Automatic controller routes work appropriately
// - HTTP: Automatic view routes work appropriately
// - HTTP: Model API scaffolds work appropriately
// - HTTP: policies are applied during routing
// - Sockets: Specified routes work appropriately
// - Sockets: Automatic controller routes work appropriately
// - Sockets: Automatic view routes work appropriately
// - Sockets: policies are applied during routing
// - Sockets: Model API scaffolds work appropriately
// - Sockets: broadcast(), publish(), subscribe() and introduce() work properly
// - Sockets: Scaffold triggers appropriate pubsub actions

// - css/js assets are included 
// - LESS/coffee assets are compiled and included
// - ejs templates are included

// - test production mode asset compilation
// - test session adapter
// - test socket store adapter

// - test multi-process deployment(aka fleet)


//////////////////////////////////////////////////////
// As well as each of the most common adapters
// (use locally configured connection data)
//////////////////////////////////////////////////////

// sails-dirty

// sails-mysql
// sails-postgres

// sails-mongo
// sails-redis
// sails-sqlite
// sails-couch

// sails-smtp

// sails-twitter
// sails-facebook



$log('Tests complete.');


