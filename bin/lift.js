var _ = require('lodash');
_.str = require('underscore.string');
var fs = require('fs-extra');
var forever = require('forever');

// Make existsSync not crash on older versions of Node
fs.existsSync = fs.existsSync || require('path').existsSync;

// Build mock sails object
var sails = require('./mockSails.js');


// Known errors
var errors = {
	badLocalSails: function(requiredVersion) {
		return 'You may consider reinstalling Sails locally (npm install sails@' + requiredVersion + ').';
	}
};

// Read package.json file in specified path

function getPackage(path) {
	path = _.str.rtrim(path, '/');
	var packageJson = fs.readFileSync(path + '/package.json', 'utf-8');
	try {
		packageJson = JSON.parse(packageJson);
	} catch (e) {
		return false;
	}
	return packageJson;
}

module.exports = function(argv) {
	
	var localSailsPath = sails.config.appPath + '/node_modules/sails';

	// Check project package.json for sails.js dependency version and
	// If no package.json file exists, don't try to start the server
	if (fs.existsSync(sails.config.appPath + '/package.json')) {
		appPackageJson = getPackage(sails.config.appPath);
	} else {
		sails.log.error('Cannot read package.json in the current directory.  ' +
			'It could be missing or corrupt.  ' +
			'Are you sure this is a sails app?');
		process.exit(1);
	}

	// If sails dependency unspecified, allow anything, but throw a warning
	var requiredSailsVersion = 0;
	if (!(appPackageJson.dependencies && appPackageJson.dependencies.sails)) {
		sails.log.warn('The app in the current directory does not list sails as a dependency.');
	} else {
		requiredSailsVersion = appPackageJson.dependencies && appPackageJson.dependencies.sails;
	}

	// check if node_modules/sails exists in current directory
	if (fs.existsSync(localSailsPath)) {

		// check package.json INSIDE local install of Sails
		// No package.json means local sails means it must be corrupted
		if (!fs.existsSync(localSailsPath + '/package.json')) {
			sails.log.error('Locally installed Sails.js has corrupted or missing package.json file.');
			sails.log.error(errors.badLocalSails(requiredSailsVersion));
			process.exit(1);
		}

		// Read package.json to detect version
		var localSailsPackage = fs.readFileSync(localSailsPath + '/package.json', 'utf-8');
		try {
			localSailsPackage = JSON.parse(localSailsPackage);
		} catch (e) {
			sails.log.error('Unable to parse package.json in local node_modules/sails!\n');
			sails.log.error(errors.badLocalSails(requiredSailsVersion));
			process.exit(1);
		}

		// Error out if it has the wrong version in its package.json

		// TODO: use npm's native version comparator
		if (requiredSailsVersion !== localSailsPackage.version) {
			sails.log.error('This app specifies Sails version ' + requiredSailsVersion + ', but local node_modules/sails version is ' + localSailsPackage.version);
			sails.log.error(errors.badLocalSails(requiredSailsVersion));
		}


		// If we made it this far, we're good to go-- fire 'er up, chief
		require(sails.config.appPath + '/node_modules/sails/lib/sails.js').lift(argv);

	}
	// otherwise, copy the global installation of sails locally
	else {
		var globalSailsPath = __dirname + '/../';
		require('../lib/sails').lift(argv);

		// sails.log.verbose("Installing Sails in this project...");
		// fs.mkdirsSync(localSailsPath);
		// fs.copy(globalSailsPath, localSailsPath, function(err) {
		// 	if(err) throw new Error(err);
		// });
	}
};
