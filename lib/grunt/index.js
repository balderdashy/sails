module.exports = function (sails) {

	var path = require('path');

	return function load (taskName, cb) {

		var environment = sails.config.environment;
		var baseurl = 'http://' + sails.config.host + ':' + sails.config.port;
		var signalpath = '/___signal';
		var pathToSails = path.resolve(__dirname, '../../');

		if (!taskName) {
			taskName = '';
		}

		// Build command to run Gruntfile
		var cmd = pathToSails + '/node_modules/grunt-cli/bin/grunt',
			args = [
				taskName,
				'--gdsrc=' + pathToSails + '/node_modules',
				'--environment=' + environment,
				'--baseurl=' + baseurl,
				'--signalpath=' + signalpath
			],
			options = {
				silent: true,
				stdio: 'pipe'
			};

		// Spawn grunt process
		var child = require('child_process').fork(cmd, args, options);

		var errorMsg = '';
		var stackTrace = '';

		// Log output as it comes in to the appropriate log channel
		child.stdout.on('data', function (consoleMsg) {

			consoleMsg = consoleMsg.toString();

			// store all the output
			errorMsg += consoleMsg + '\n';

			if( consoleMsg.match(/Warning:/)) {

				// Find the Stack Trace related to this warning
				stackTrace = errorMsg.substring(errorMsg.lastIndexOf('Running "'));

				sails.log.error('Grunt :: ' + consoleMsg, stackTrace);
				return;
			}

			// Throw an error
			else if (consoleMsg.match(/Aborted due to warnings./)) {
				sails.log.error('Grunt :: ', consoleMsg, stackTrace);
				sails.log.error(
					'*-> An error occurred-- please fix it, then stop ' +
					'and restart Sails to continue watching assets.'
				);
			}

			else if (consoleMsg.match(/ParseError/)) {
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
