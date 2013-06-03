module.exports = function (taskName, cb) {

	var environment = sails.config.environment;
	var baseurl = 'http://' + sails.config.host + ':' + sails.config.port;
	var signalpath = '/__grunt_api_change_';
	var pathToSails = __dirname + '/../..';

	if (!taskName) {
		taskName = '';
	}

	// Build command to run Gruntfile
	var cmd = 'node ' + pathToSails + '/node_modules/grunt-cli/bin/grunt ' +
				taskName +
				' --gdsrc=' + pathToSails + '/node_modules' +
				' --environment=' + environment +
				' --baseurl=' + baseurl +
				' --signalpath=' + signalpath;

	// Spawn grunt process
	var child = require('child_process').exec(cmd);

	// Log output as it comes in to the appropriate log channel
	child.stdout.on('data', function (consoleMsg) {
		sails.log.verbose('Grunt :: ' + consoleMsg);
	});
	child.stderr.on('data', function (consoleErr) {
		sails.log.error('Grunt :: ' + consoleErr);
	});

	// Go ahead and get out of here, since Grunt might sit there backgrounded
	cb && cb();
};
