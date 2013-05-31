module.exports = function (cb) {

	// Build command to run Gruntfile using currently running Sails' grunt dependency
	var pathToSails = __dirname + '/../..';
	var cmd = 'node ' + pathToSails + '/node_modules/grunt-cli/bin/grunt --gdsrc=' + pathToSails + '/node_modules';

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
