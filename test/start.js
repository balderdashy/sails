/**
 * Module dependencies
 */
 
var sys = require('sys'),
	exec = require('child_process').exec,
	async = require('async');


/**
 * Set up logger
 */

var logger = console;



/**
 * Constants and defaults
 */

var 
	EXIT_CODE		= 0,	// final exit code (for travis)
	
	TEST_RUNNER_CMD	= 'node ./node_modules/mocha/bin/mocha',
	OPT_RECURSIVE	= ' --recursive',
	OPT_GLOBALS_OK	= ' --ignore-leaks',
	OPT_FORMAT		= ' -R dot',
	DEFAULT_TIMEOUT	= '60000',
	OPT_TIMEOUT		= ' -t ' + DEFAULT_TIMEOUT,
	DEFAULT_TEST_CMD= TEST_RUNNER_CMD + OPT_GLOBALS_OK + OPT_RECURSIVE + OPT_FORMAT + OPT_TIMEOUT + ' ';





/**
 * Run unit tests, one at a time
 */

logger.log('\n Running unit tests...\n=============================================\n');

async.series([

	// Run built-in waterline tests in node_modules
	runTest( DEFAULT_TEST_CMD + 'node_modules/waterline/test/**/**', 'waterline (orm)' ),

	runTest( DEFAULT_TEST_CMD + 'test/router/unit/*', 'router'),

	function placeholder (cb) {cb();}


], function (err) {
	_catch(err, logger.error);
	
	logger.log('\n=============================================\n\n All tests complete.\n');

});







/**
 * Return async fn that runs the specified command and triggers its cb when finished
 * @param {String} cmd
 * @param {String} label [optional]
 */

function runTest ( cmd, label ) {

	// Execute a cmd, then trigger callback when it finishes
	return function (cb) {

		label = label || cmd;
		logger.log(' *->  Running test :: ' + label + '...', '\n(', cmd,')');

		var test = exec(cmd, function (err, stdout, stderr) {
			console.log(stdout);
			console.error(stderr);
			if (err) {
				// If test fails, set exit code to failing test code
				logger.error('Failed :: ' + label);
				EXIT_CODE = 1;
				return cb(err);
			}
			return cb();
		});
	};
}



/**
 * If an async error occured, make some noise but continue on
 * Runs `logFn(err)` if specified, otherwise `sails.log.error(err)`, 
 * or worst case `console.error(err)`
 *
 * @param {Error|String} err
 * @param {Function} logFn
 */

function _catch (err, logFn) {
	if (err) {
		err = (err instanceof Error) ? err : new Error(err);
		logFn = (logFn || (typeof sails !== 'undefined' ? sails.log.error : console.error));
		logFn(err);
	}
}

/**
 * If an async error occurred, throw it (aka "catch and release")
 * Runs `logFn(err)` if specified, otherwise `sails.log.error(err)`, 
 * or worst case `console.error(err)`
 *
 * @param {Error|String} err
 * @param {Function} logFn
 */

function _throw (err, logFn) {
	if (err) {
		_catch(err, logFn);
		throw (err instanceof Error) ? err : new Error(err);
	}
}



// // Execute a cmd, then trigger callback when it finishes
// function runTest(cmd, cb) {
// 	var test = exec(cmd);
// 	test.stdout.on('data', sys.print);
//     test.stdout.on('data', process.stdout.write);
// 	test.on('exit', function (code) {
// 		// If test fails, set exit code to failing test code
// 		if (code !== 0) EXIT_CODE = code;
// 		return code ? cb('Returned with code: ' + code) : cb();
// 	});
// }
// var $runTest = function (cmd) {
// 	return $(runTest)(cmd);
// };

// $log('Testing waterline (ORM)...');
// $runTest('node ./node_modules/mocha/bin/mocha --ignore-leaks --recursive  -R dot -t '+ TEST_TIMEOUT +' test/waterline');


// $log('Running tests...');

// //////////////////////////////////////////////////////
// // Run user-level integration tests for core modules
// //////////////////////////////////////////////////////

// // - Server starts successfully
// // - CLI (sails generate, sails new, etc.)
// $log('Testing cli...');
// $runTest('node ./node_modules/mocha/bin/mocha --ignore-leaks --recursive  -R dot -t '+ TEST_TIMEOUT +' test/cli');
// // - all modules included properly
// // - configuration applied properly
// // - services are accessible
// // - active record (aka waterline)
// $log('Testing waterline (ORM)...');
// $runTest('node ./node_modules/mocha/bin/mocha --ignore-leaks --recursive  -R dot -t '+ TEST_TIMEOUT +' test/waterline');

// //////////////////////////////////////////////////////
// // Run web integration tests
// //////////////////////////////////////////////////////

// $log('Testing http...');
// $runTest('node ./node_modules/mocha/bin/mocha --ignore-leaks --recursive  -R dot -t '+ TEST_TIMEOUT +' test/http');
// // - HTTP: Specified routes work appropriately
// // - HTTP: Automatic controller routes work appropriately
// // - HTTP: Automatic view routes work appropriately
// // - HTTP: Model API scaffolds work appropriately
// // - HTTP: policies are applied during routing
// // - Sockets: Specified routes work appropriately
// // - Sockets: Automatic controller routes work appropriately
// // - Sockets: Automatic view routes work appropriately
// // - Sockets: policies are applied during routing
// // - Sockets: Model API scaffolds work appropriately
// // - Sockets: broadcast(), publish(), subscribe() and introduce() work properly
// // - Sockets: Scaffold triggers appropriate pubsub actions

// // - css/js assets are included 
// // - LESS/coffee assets are compiled and included
// // - ejs templates are included

// // - test production mode asset compilation
// // - test session adapter
// // - test socket store adapter

// // - test multi-process deployment(aka fleet)


// //////////////////////////////////////////////////////
// // As well as each of the most common adapters
// // (use locally configured connection data)
// //////////////////////////////////////////////////////

// // sails-dirty

// // sails-mysql
// // sails-postgres

// // sails-mongo
// // sails-redis
// // sails-sqlite

// // sails-smtp

// // sails-twitter
// // sails-facebook
// // sails-couch


// $log('Tests complete.');
