module.exports = function (cb) {

	// Build command to run Gruntfile using currently running Sails' grunt dependency
	var cmd = 'node ' + __dirname + '/../../node_modules/grunt-cli/bin/grunt';

	// Spawn grunt process
	require('child_process').exec(cmd, function (err, stdout, stderr) {
		if (err) {
			sails.log.error('Gruntfile encountered fatal error!');
			sails.log.error(err);
			sails.log.error(stderr);
			sails.log.error(stdout);
			return;
		}
		if (stderr) {
			sails.log.warn('Error output from Gruntfile:');
			sails.log.warn(stderr);
		}

		sails.log.verbose(stdout);

	});

	// Go ahead and get out of here, since Grunt might sit there backgrounded
	cb && cb();
};
