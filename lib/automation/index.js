module.exports = function (cb) {

	// Build command to run Gruntfile using currently running Sails' grunt dependency
	var cmd = 'node ' + __dirname + '/../../node_modules/grunt-cli/bin/grunt';

	// Spawn grunt process
	require('child_process').exec(cmd, function (err, stdout, stderr) {
		if (err) {
			sails.log.error('Gruntfile encountered fatal error!');
			return sails.log.error(err);
		}
		if (stderr) {
			sails.log.warn('Error output from Gruntfile:');
			sails.log.warn(stderr);
		}

		sails.log.verbose(stdout);

		cb && cb();
	});
};
