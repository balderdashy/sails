var _ = require('lodash');
_.str = require('underscore.string');
var fs = require('fs-extra');
var utils = require('./utils.js');

// Make existsSync not crash on older versions of Node
fs.existsSync = fs.existsSync || require('path').existsSync;

require('coffee-script');

// Build mock sails object
var sails = require('./mockSails.js');

module.exports = function (appName, templateLang) {
	// Whether the project being made in an existing directory or not
	var existingDirectory;

	// If app is being created inside the current directory
	if (appName === '.') {

		// The app name is the current directory name
		appName = _.last(process.cwd().split('/'));

		// Set the current directory to the parent directory of the new app
		process.chdir('../');

		// This will be checked to determine if a new app directory needs to be made
		existingDirectory = true;
	}

	// Check if the appName is an absolute path, if so don't prepend './'
    var outputPath;
	if (appName.substr(0, 1) === '/') {
		outputPath = appName;
	} else {
		outputPath = './' + appName;
	}

	// If app is being created in new directory
	if (!existingDirectory) {

		// Check if there is a directory in the current directory with the new
		// app name, log and exit if there is
		utils.verifyDoesntExist(outputPath, 'A file or directory already exists at: ' + outputPath);

		// Create a directory with the specified app name
		utils.generateDir(outputPath);
	}

	sails.log.info('Generating Sails project (' + appName + ')...');

	// Create default app structure
	utils.copyBoilerplate('public', outputPath + '/public');
	utils.copyBoilerplate('assets', outputPath + '/assets');
	utils.copyBoilerplate('api', outputPath + '/api');
	utils.copyBoilerplate('config', outputPath + '/config');

	// Different stuff for different view engines
	if (templateLang === 'handlebars') templateLang = 'hbs';

	utils.copyBoilerplate('views/' + templateLang, outputPath + '/views');

	var viewConfig = {
		viewEngine: templateLang
	};

	if (templateLang === 'jade' || templateLang === 'haml') {
		viewConfig.layout = false;
	}

	fs.createFileSync(outputPath + '/config/views.js');
	fs.writeFileSync(outputPath + '/config/views.js', 'module.exports = ' +
		JSON.stringify(viewConfig , null, '\t').split('"').join('\'') + ';');


	// Default app launcher file (for situations where sails lift isn't good enough)
	utils.generateFile('app.js', outputPath + '/app.js');

	// Create .gitignore
	utils.generateFile( '/gitignore', outputPath + '/.gitignore');

	// Generate package.json
	sails.log.debug('Generating package.json...');
	fs.writeFileSync(outputPath + '/package.json', JSON.stringify({
		name: appName,
		'private': true,
		version: '0.0.0',
		description: 'a Sails application',
		dependencies: {
			sails: sails.version,
			'optimist': '0.4.0'
		},
		scripts: {
			// Include this later when we have "sails test" ready.
			// test: './node_modules/mocha/bin/mocha -b',
			start: 'node app.js',
			debug: 'node debug app.js'
		},
		main: 'app.js',
		repository: '',
		author: '',
		license: 'MIT'
	}, null, 4));

	// Generate README
	sails.log.debug('Generating README.md...');
	fs.writeFileSync(outputPath + '/README.md', '# ' + appName + '\n### a Sails application');
};
