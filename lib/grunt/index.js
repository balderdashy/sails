module.exports = function (sails) {

	/**
	 * Module dependencies
	 */

	var FatalError = require('../errors'),
		ChildProcess = require('child_process');


	/**
	 * Fork Grunt child process
	 */
	return function loadGrunt (taskName, cb) {

		var environment = sails.config.environment;
		var baseurl = 'http://' + sails.config.host + ':' + sails.config.port;
		var signalpath = '/___signal';
		var pathToSails = __dirname.replace(' ', '\\ ') + '/../..';

		if (!taskName) {
			taskName = '';
		}

		// Fork Grunt child process
		var child = 
		ChildProcess.fork(
		pathToSails + '/node_modules/grunt-cli/bin/grunt',
		[
			taskName,

			// Grunt dependency source path
			'--gdsrc=' + pathToSails + '/node_modules',

			// Environment to run in
			'--environment=' + environment,

			// The base URL of the running Sails app
			'--baseurl=' + baseurl,

			// The URL path where Grunt should send signals
			// when core files change
			'--signalpath=' + signalpath
		],
		{
			silent: true,
			stdio: 'pipe'
		}
		);

		var errorMsg = '';
		var stackTrace = '';

		// Log output as it comes in to the appropriate log channel
		child.stdout.on('data', function (consoleMsg) {

			// store all the output
			consoleMsg = consoleMsg.toString();
			errorMsg += consoleMsg + '\n';

			if (consoleMsg.match(/Warning:/)) {
				// Find the Stack Trace related to this warning
				stackTrace = errorMsg.substring(errorMsg.lastIndexOf('Running "'));
				sails.log.error('Grunt :: ' + consoleMsg, stackTrace);
				return;
			}

			// Handle fatal Grunt errors by killing Sails process as well
			if (consoleMsg.match(/Aborted due to warnings./)) {
				return FatalError.__GruntAborted__(consoleMsg, stackTrace);
			}

			if (consoleMsg.match(/ParseError/)) {
				sails.log.error('Grunt :: ', consoleMsg, stackTrace);
			}

			else sails.log.verbose('Grunt :: ' + consoleMsg);
		});

		child.stdout.on('error', function (consoleErr) {
			sails.log.error('Grunt :: ' + consoleErr);
		});
		child.stderr.on('data', function (consoleErr) {
			sails.log.error('Grunt :: ' + consoleErr);
		});
		child.stderr.on('error', function (consoleErr) {
			sails.log.error('Grunt :: ' + consoleErr);
		});

		sails.log.verbose('Tracking new grunt child process...');
		sails.childProcesses.push(child);

		// Go ahead and get out of here, since Grunt might sit there backgrounded
		cb && cb();
	};
};
