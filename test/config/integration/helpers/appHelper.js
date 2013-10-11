var fs = require('fs-extra');
var wrench = require('wrench');
var exec = require('child_process').exec;
var path = require('path');
var sailsBin = path.resolve('./bin/sails.js');

// Make existsSync not crash on older versions of Node
fs.existsSync = fs.existsSync || path.existsSync;

/**
 * Uses the Sails binary to create a namespaced test app
 * If no appName is given use 'testApp'
 *
 * It copies all the files in the fixtures folder into their
 * respective place in the test app so you don't need to worry
 * about setting up the fixtures.
 */

module.exports.build = function( /* [appName], done */ ) {
	var args = Array.prototype.slice.call(arguments),
		done = args.pop(),
		appName = 'testApp';

	// Allow App Name to be optional
	if (args.length > 0) appName = args[0];

	// Cleanup old test fixtures
	if (fs.existsSync(appName)) {
		wrench.rmdirSyncRecursive(path.resolve('./', appName));
	}

	exec(sailsBin + ' new ' + appName, function(err) {
		if (err) return done(err);

		var fixtures = wrench.readdirSyncRecursive('./test/config/integration/fixtures');
		if (fixtures.length < 1) return done();

		// If fixtures, copy them to the test app
		fixtures.forEach(function(file) {
			var filePath = path.resolve('./test/config/integration/fixtures', file);

			// Check if file is a directory
			var stat = fs.statSync(filePath);

			// Ignore directories
			if (stat.isDirectory()) return;

			// Copy File to Test App
			var data = fs.readFileSync(filePath);

			// Create file and any missing parent directories in its path
			fs.createFileSync(path.resolve('./', appName, file), data);
			fs.writeFileSync(path.resolve('./', appName, file), data);

		});

		done();
	});
};


/**
 * Remove a Test App
 */

module.exports.teardown = function(appName) {
	appName = appName ? appName : 'testApp';
	var dir = path.resolve('./', appName);
	if (fs.existsSync(dir)) {
		wrench.rmdirSyncRecursive(dir);
	}
};

