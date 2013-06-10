var _ = require('lodash');
_.str = require('underscore.string');
var fs = require('fs-extra');
var ejs = require('ejs');
var utils = require('./utils.js');

// Output in directory where cmdline tool was run
var outputPath = '.';

// Make existsSync not crash on older versions of Node
fs.existsSync = fs.existsSync || require('path').existsSync;


// Build mock sails object
var sails = require('./mockSails.js');

// If coffeescript is not installed, fail silently
try {
	require('coffee-script');
	sails.log.verbose('Enabling CoffeeScript...');
}
catch (e) {
	sails.log.verbose('CoffeeScript not installed.');
}

module.exports = function createNewApp(appName, templateLang) {
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
	if (appName.substr(0, 1) === '/') {
		outputPath = appName;
	} else {
		outputPath = outputPath + '/' + appName;
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
	utils.copyBoilerplate('assets', outputPath + '/assets');
	utils.copyBoilerplate('api', outputPath + '/api');
	utils.copyBoilerplate('test', outputPath + '/test');
	utils.copyBoilerplate('config', outputPath + '/config', function () {

		// Generate session secret
		var boilerplatePath = __dirname + '/boilerplates/config/session.js';
		var newSessionConfig = ejs.render(fs.readFileSync(boilerplatePath, 'utf8'), {
			secret: require('../lib/session/generateSecret')()
		});

		fs.writeFileSync(outputPath + '/config/session.js', newSessionConfig, 'utf8');

	});


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
	utils.generateFile('gitignore', outputPath + '/.gitignore');

	// Generate package.json
	sails.log.debug('Generating package.json...');
	fs.writeFileSync(outputPath + '/package.json', JSON.stringify({
		name: appName,
		'private': true,
		version: '0.0.0',
		description: 'a Sails application',
		dependencies: {
			sails: sails.version,
			grunt: '0.4.1',
			optimist: '0.3.4' // TODO: remove this and handle it differently
		},
		scripts: {
			// Include this later when we have "sails test" ready.
			// test: './node_modules/mocha/bin/mocha -b',
			start: 'node app.js',
			debug: 'node debug app.js',
			test: "mocha test/controller/"
		},
		main: 'app.js',
		repository: '',
		author: '',
		license: ''
	}, null, 4));

	// Copy Gruntfile
	sails.log.debug('Generating README.md...');
	utils.generateFile('Gruntfile.js', outputPath + '/Gruntfile.js');

	// Generate README
	sails.log.debug('Generating README.md...');
	fs.writeFileSync(outputPath + '/README.md', '# ' + appName + '\n### a Sails application');

	// Copy dependencies (to avoid having to do a local npm install in new projects)
	utils.generateDir(outputPath + '/node_modules');
	utils.copySailsDependency('optimist', outputPath + '/node_modules');
	utils.copySailsDependency('grunt', outputPath + '/node_modules');
	utils.copySailsDependency('sails-disk', outputPath + '/node_modules');

	// Other grunt dependencies are automatically pulled from sails core deps.

	// Copy Sails itself into new project as a local dependency
	//
	// TODO:	examine using a symbolic link for the node_modules
	// 			instead of copying the directory over directly,
	//			since it would be much quicker, and wouldn't hurt anything
	utils.copySails(outputPath + '/node_modules/sails');
};