/**
 * Module dependencies
 */
var argv = require('optimist').argv,
	cliutil = require('sails-util/cli'),
	Logger = require('captains-log');


// Build logger using command-line arguments
var log = new Logger(cliutil.getCLIConfig(argv).log);

/**
 * Fatal Errors
 */
module.exports = {

	
	failedToLoadSails: function(err) {
		log.error(err);
		log.error('Could not load Sails.');
		log.error('Are you using the latest stable version?');
		process.exit(1);
	},

	noPackageJSON: function() {
		log.error('Cannot read package.json in the current directory (' + process.cwd() + ')');
		log.error('Are you sure this is a Sails app?');
		process.exit(1);
	},

	notSailsApp: function() {
		log.error('The package.json in the current directory does not list Sails as a dependency...');
		log.error('Are you sure `' + process.cwd() + '` is a Sails app?');
		process.exit(1);
	},

	badLocalDependency: function(pathTo_localSails, requiredVersion) {
		log.error(
			'The local Sails dependency installed at `' + pathTo.localSails + '` ' +
			'has a corrupted, missing, or un-parsable package.json file.'
		);
		log.error('You may consider running:');
		log.error('rm -rf ' + pathTo_localSails + ' && npm install sails@' + app.dependencies.sails);
		process.exit(1);
	},

	__GruntAborted__: function ( consoleMsg, stackTrace ) {
		log.error(
			'A Grunt error occurred-- please fix it, then restart ' +
			'Sails to continue watching assets.'
		);
		var relativePublicPath = (require('path').resolve(process.cwd(), './.tmp'));
		var uid = process.getuid && process.getuid() || 'YOUR_COMPUTER_USER_NAME';
		console.log();
		log.error('You might have a malformed LESS or CoffeeScript file...');
		log.error('Or maybe you don\'t have permissions to access the `.tmp` directory?');
		log.error('e.g.');
		log.error(relativePublicPath,'?' );
		log.error();
		log.error('If you think it\'s the latter case, you might try running:');
		log.error('sudo chown -R',uid,relativePublicPath);
		console.log();
		
		return process.exit(1);
	},


	__UnknownPolicy__: function(policy, source, pathToPolicies) {
		source = source || 'config.policies';

		log.error('Unknown policy, "' + policy + '", referenced in `' + source + '`.');
		log.error('Are you sure that policy exists?');
		log.error('It would be located at: `' + pathToPolicies + '/' + policy + '.js`');
		return process.exit(1);
	},

	__InvalidConnection__: function(connection, sourceModelId) {
		log.error('In model (' + sourceModelId + '), invalid connection ::', connection);
		log.error('Must contain an `adapter` key referencing the adapter to use.');
		return process.exit(1);
	},

	__UnknownConnection__: function(connectionId, sourceModelId) {
		log.error('Unknown connection, "' + connectionId + '", referenced in model `' + sourceModelId + '`.');
		log.error('Are you sure that connection exists?  It should be defined in `sails.config.connections`.');

		// var probableAdapterModuleName = connectionId.toLowerCase();
		// if ( ! probableAdapterModuleName.match(/^(sails-|waterline-)/) ) {
		// 	probableAdapterModuleName = 'sails-' + probableAdapterModuleName;
		// }
		// log.error('Otherwise, if you\'re trying to use an adapter named `' + connectionId + '`, please run ' +
		// 	'`npm install ' + probableAdapterModuleName + '@' + sails.majorVersion + '.' + sails.minorVersion + '.x`');
		return process.exit(1);
	},

	__UnknownAdapter__: function(adapterId, sourceModelId, sailsMajorV, sailsMinorV) {
		log.error('Trying to use unknown adapter, "' + adapterId + '", in model `' + sourceModelId + '`.');
		log.error('Are you sure that adapter is installed in this Sails app?');
		log.error('If you wrote a custom adapter with identity="' + adapterId + '", it should be in this app\'s adapters directory.');

		var probableAdapterModuleName = adapterId.toLowerCase();
		if (!probableAdapterModuleName.match(/^(sails-|waterline-)/)) {
			probableAdapterModuleName = 'sails-' + probableAdapterModuleName;
		}
		log.error('Otherwise, if you\'re trying to use an adapter named `' + adapterId + '`, please run ' +
			'`npm install ' + probableAdapterModuleName + '@' + sailsMajorV + '.' + sailsMinorV + '.x`');
		return process.exit(1);
	},

	__InvalidAdapter__: function(attemptedModuleName, supplementalErrMsg) {
		log.error('There was an error attempting to require("' + attemptedModuleName + '")');
		log.error('Is this a valid Sails/Waterline adapter?  The following error was encountered ::');
		log.error(supplementalErrMsg);

		return process.exit(1);
	}
};
