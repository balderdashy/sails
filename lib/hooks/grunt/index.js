module.exports = function (sails) {

	/**
	 * Module dependencies
	 */

	var Err = require('../../../errors'),
		path  = require('path'),
		ChildProcess = require('child_process');


	return {

		
		/**
		 * Initialize this project's Grunt tasks
		 * and execute the environment-specific gruntfile
		 *
		 */
		initialize: function (cb) {

			sails.log.verbose('Loading app Gruntfile...');

			// Start task depending on environment
			if(sails.config.environment === 'production'){
				return this.runTask('prod', cb);
			}

			this.runTask('default', cb);
		},


		/**
		 * Fork Grunt child process
		 *
		 * @param {String} taskName - grunt task to run
		 * @param {Function} cb - optional, fires when the Grunt task has been started
		 */
		runTask: function (taskName, cb_afterTaskStarted) {
			cb_afterTaskStarted = cb_afterTaskStarted || function () {};

			var environment = sails.config.environment;
			var pathToSails = path.resolve(__dirname, '../../../'); //.replace(' ', '\ ') + '/../../..';
			
			// Only relevant in a development environment:
			// (unfortunately, cannot use sails.getBaseurl() because it is not calculatable yet)
			var baseurl = 'http://' + (sails.config.host || 'localhost') + ':' + sails.config.port;
			var signalpath = '/___signal';

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
				// (in v0.10, this will inspect the node_modules in the app itself)
				// '--gdsrc=' + path.join(process.cwd(),'node_modules'),

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
			});


			var errorMsg = '';
			var stackTrace = '';

			// Log output as it comes in to the appropriate log channel
			child.stdout.on('data', function (consoleMsg) {

				// store all the output
				consoleMsg = consoleMsg.toString();
				errorMsg += consoleMsg;

				// Clean out all the whitespace
				var trimmedStackTrace = (typeof stackTrace === 'string') ? stackTrace : '';
				trimmedStackTrace = trimmedStackTrace.replace(/[\n\s]*$/,'');
				trimmedStackTrace = trimmedStackTrace.replace(/^[\n\s]*/,'');
				var trimmedConsoleMsg = (typeof consoleMsg === 'string') ? consoleMsg : '';
				trimmedConsoleMsg = trimmedConsoleMsg.replace(/[\n\s]*$/,'');
				trimmedConsoleMsg = trimmedConsoleMsg.replace(/^[\n\s]*/,'');

				// Remove '--force to continue' message since it makes no sense
				// in this context:
				trimmedConsoleMsg = trimmedConsoleMsg.replace(/Use --force to continue\./i, '');
				trimmedStackTrace = trimmedStackTrace.replace(/Use --force to continue\./i, '');

				// Find the Stack Trace related to this warning
				if (consoleMsg.match(/Use --force to continue/)) {
					stackTrace = errorMsg.substring(errorMsg.lastIndexOf('Running "'));
				// 	sails.log.warn('** Grunt :: Warning **');
				// 	sails.log.warn(errorMsg,trimmedStackTrace);
					return;
				}

				// Handle fatal errors, like missing grunt dependency, etc.
				if (consoleMsg.match(/Fatal error/g)) {
					
					// If no Gruntfile exists, don't crash- just display a warning.
					if (consoleMsg.match(/Unable to find Gruntfile/i)) {
						sails.log.verbose('Gruntfile could not be found.');
						sails.log.verbose('(no grunt tasks will be run.)');
						return;
					}

					Err.fatal.__GruntAborted__(trimmedConsoleMsg, trimmedStackTrace);
					return;
				}

				// Handle fatal Grunt errors by killing Sails process as well
				if (consoleMsg.match(/Aborted due to warnings/)) {
					sails.log.error('** Grunt :: An error occurred. **');
					// sails.log.warn(trimmedStackTrace);
					// sails.emit('hook:grunt:error', trimmedStackTrace);
					Err.fatal.__GruntAborted__(trimmedConsoleMsg, trimmedStackTrace);
					return;
				}

				if (consoleMsg.match(/ParseError/)) {
					sails.log.warn('** Grunt :: Parse Warning **');
					sails.log.warn(trimmedStackTrace);
				}

				// Only display console message if it has content besides whitespace
				else if ( !consoleMsg.match(/^\s*$/) ) {
					sails.log.verbose('Grunt :: ' + trimmedConsoleMsg);
				}
			});

			child.stdout.on('error', function (consoleErr) {
				sails.log.error('Grunt :: ' + consoleErr);
			});
			child.stderr.on('data', function (consoleErr) {
				consoleErr = (typeof consoleErr === 'string') ? consoleErr : '';
				consoleErr = consoleErr.replace(/^[\s\n]*/, '');
				consoleErr = consoleErr.replace(/[\s\n]*$/, '');
				sails.log.error('Grunt :: ' + consoleErr);
			});
			child.stderr.on('error', function (consoleErr) {
				sails.log.error('Grunt :: ' + consoleErr);
			});

			// When process is complete, fire event on `sails`
			child.on('exit', function (code, s) {
				if ( code !== 0 ) return sails.emit('hook:grunt:error');
				sails.emit('hook:grunt:done');
			});

			// Since there's likely a watch task involved, and we may need
			// to flush the whole thing, we need a way to grab hold of the child process
			// So we save a reference to it
			sails.log.verbose('Tracking new grunt child process...');
			sails.childProcesses.push(child);

			// Go ahead and get out of here, since Grunt might sit there backgrounded
			cb_afterTaskStarted();
		}
	};
};
