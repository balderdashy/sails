/**
 * Module dependencies
 */
var argv		= require('optimist').argv,
	Logger = require('sails/lib/logger')();

// Build logger
var log = new Logger(argv.verbose ? {level: 'verbose'} : undefined);

module.exports = {

	fatal: {

		failedToLoadSails: function (err) {
			log.error(err);
			log.error('Could not load Sails.');
			log.error('Are you using the latest stable version?');
			process.exit(1);
		},

		noPackageJSON: function () {
			log.error('Cannot read package.json in the current directory (' + process.cwd() + ')');
			log.error('Are you sure this is a Sails app?');
			process.exit(1);
		},

		notSailsApp: function () {
			log.error('The package.json in the current directory (' + process.cwd() + ')');
			log.error('does not list Sails as a dependency...');
			log.error('Are you sure this is a Sails app?');
			process.exit(1);
		},

		badLocalDependency: function (pathTo_localSails, requiredVersion) {
			log.error(
				'The local Sails dependency installed at `' + pathTo.localSails + '` ' +
				'has a corrupted, missing, or un-parsable package.json file.'
			);
			log.error('You may consider running:');
			log.error('rm -rf ' + pathTo_localSails + ' && npm install sails@' + app.dependencies.sails);
			process.exit(1);
		}

	},

	warn: {

		incompatibleLocalSails: function ( requiredVersion, localVersion ) {
			log.warn('Trying to lift sails in',require('path').resolve(process.cwd(),'node_modules/sails') +'...');
			log.warn('But the package.json in the current directory indicates a dependency on Sails ' + requiredVersion);
			log.warn('and the locally installed Sails is ' + localVersion + '!');
			log.warn('If you run into problems, you may consider reinstalling Sails locally:');
			log.warn('> npm install sails@' + requiredVersion);
			console.log();
		}
	}

};