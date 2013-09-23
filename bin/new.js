module.exports = function(sails) {


	/**
	 * Module dependencies.
	 */

	var _ = require('lodash'),
		utils = require('./utils')(sails),
		fs = utils.fs,
		ejs = require('ejs'),
		Session = require('../lib/session')(sails);


	// Output in directory where cmdline tool was run
	var outputPath = '.';

	// If coffeescript is not installed, fail silently
	try {
		require('coffee-script');
		sails.log.verbose('Enabling CoffeeScript...');
	} catch (e) {
		sails.log.verbose('CoffeeScript not installed.');
	}


	/**
	 * Expose `sails new` functionality
	 */

	return function createNewApp(options) {

		// Whether the project is being made in an existing directory or not
		var existingDirectory;

		// If app is being created inside the current directory
		if (options.appName === '.') {

			// The app name is the current directory name
			options.appName = _.last(process.cwd().split('/'));

			// Set the current directory to the parent directory of the new app
			process.chdir('../');

			// This will be checked to determine if a new app directory needs to be made
			existingDirectory = true;
		}

		// Check if the options.appName is an absolute path, if so don't prepend './'
		if (options.appName.substr(0, 1) === '/') {
			outputPath = options.appName;
		} else {
			outputPath = outputPath + '/' + options.appName;
		}

		// If app is being created in new directory
		if (!existingDirectory) {

			// Check if there is a directory in the current directory with the new
			// app name, log and exit if there is
			utils.verifyDoesntExist(outputPath, 'A file or directory already exists at: ' + outputPath);

			// Create a directory with the specified app name
			utils.generateDir(outputPath);
		}

		sails.log.debug('Building new Sails.js app in ' + outputPath + '...');
		if (options.useLinker) {
			sails.log.info('Using asset linker...');
		}

		// options.useLinker will determin the assets dir stucture for the new sails project 
		if (options.useLinker) {
			utils.copyBoilerplate('linkerAssets', outputPath + '/assets');
		} else {
			utils.copyBoilerplate('assets', outputPath + '/assets');
		}

		// Add these boilerplate dirs regardless
		utils.copyBoilerplate('api', outputPath + '/api');

		utils.copyBoilerplate('config', outputPath + '/config', function() {

			// Generate session secret
			var sessionBoilerplatePath = __dirname + '/boilerplates/config/session.js';
			var newSessionConfig = ejs.render(fs.readFileSync(sessionBoilerplatePath, 'utf8'), {
				secret: Session.generateSecret()
			});
			fs.writeFileSync(outputPath + '/config/session.js', newSessionConfig, 'utf8');

			// Insert view engine and template layout in views config

			var viewsBoilerplatePath = __dirname + '/boilerplates/config/views.js';
			var newViewsConfig = ejs.render(fs.readFileSync(viewsBoilerplatePath, 'utf8'), {
				engine: options.templateLang,
				layout: templateLayout
			});			
			fs.writeFileSync(outputPath + '/config/views.js', newViewsConfig, 'utf8');

		});

		// Different stuff for different view engines
		if (options.templateLang === 'handlebars') options.templateLang = 'hbs';


		// Disable template layout for jade and haml
		var templateLayout;
		if (options.templateLang === 'jade' || options.templateLang === 'haml') {
			templateLayout = false;
		} else templateLayout = '\'layout\'';

		utils.copyBoilerplate('views/' + options.templateLang, outputPath + '/views', function() {

			// If using linker, override the layout file with linker layout file
			if (options.useLinker) {

				if (options.templateLang !== 'ejs') {
					sails.log.warn('Automatic asset linking is not implemented for the `' + options.templateLang + '` view ' +
						'engine at this time. You must modify the Gruntfile yourself for this feature to work.');
				}
				utils.copyBoilerplate('linkerLayouts/' + options.templateLang, outputPath + '/views');
			}

		});	

		// Default app launcher file (for situations where sails lift isn't good enough)
		utils.generateFile('app.js', outputPath + '/app.js');

		// Create .gitignore
		utils.generateFile('gitignore', outputPath + '/.gitignore');

		// Generate package.json
		sails.log.verbose('Generating package.json...');
		fs.writeFileSync(outputPath + '/package.json', JSON.stringify({
			name: options.appName,
			'private': true,
			version: '0.0.0',
			description: 'a Sails application',
			dependencies: {
				sails			: sails.version,
				grunt			: '0.4.1',
				'sails-disk'	: '~0.9.0',
				ejs				: '0.8.4',
				optimist		: '0.3.4' // TODO: remove this and handle it differently (maybe)
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
			license: ''
		}, null, 4));

		// Copy Gruntfile
		sails.log.verbose('Generating Gruntfile...');
		utils.generateFile('Gruntfile.js', outputPath + '/Gruntfile.js');

		// Generate README
		sails.log.verbose('Generating README.md...');
		fs.writeFileSync(outputPath + '/README.md', '# ' + options.appName + '\n### a Sails application');

		// Copy dependencies (to avoid having to do a local npm install in new projects)
		utils.generateDir(outputPath + '/node_modules');
		utils.copySailsDependency('optimist', outputPath + '/node_modules');
		utils.copySailsDependency('sails-disk', outputPath + '/node_modules');
		utils.copySailsDependency('ejs', outputPath + '/node_modules');

		// Other grunt dependencies are automatically pulled from sails core deps.
		utils.copySailsDependency('grunt', outputPath + '/node_modules');

		// Conditionally, copy Sails itself into new project as a local dependency
		if (options.copySails) {
			utils.copySails(outputPath + '/node_modules/sails', copySails_cb);

			// Using a symbolic link is much quicker than copying the directory over directly, 
			// but it serves no purpose, since the global sails will be used automatically 
			// if no local dependency exists
			// var sailsGlobalInstallPath = __dirname + '/../.';
			// fs.symlinkSync(sailsGlobalInstallPath, outputPath + '/node_modules/sails', 'dir');
		}
		else copySails_cb();


		// Let the user know that `sails new` was successful
		function copySails_cb (err) {
			console.log('');
			sails.log.info('New app created!');
		}
	};


};