/**
 * Module dependencies.
 */

var _ = require('lodash'),
	path = require('path'),
	moduleRootPath = require('root-require').packpath.self(),
	async = require('async'),
	Sails = require('root-require')('lib/app'),
	switcher = require('sails-util/switcher'),
	GenerateModuleHelper = require('../_helpers/module'),
	GenerateFolderHelper = require('../_helpers/folder');
	GenerateJSONHelper = require('../_helpers/jsonfile');

/**
 * Expose `sails new` functionality
 *
 * @param {Object} options
 * @param {Object} [handlers]
 */

module.exports = {


	/**
	 * Generate new Sails app.
	 * 
	 * @param  {[type]} options  [description]
	 * @param  {[type]} handlers [description]
	 * @return {[type]}          [description]
	 */
	generate: function createNewApp( options, handlers ) {
		handlers = switcher(handlers);

		if ( !options.appName ) return handlers.missingAppName();

		// Defaults
		_.defaults(options, {
			viewEngine: 'ejs'
		});


		// Resolve absolute appPath
		var appPath = path.resolve( process.cwd(), options.appName );
		_.defaults(options, {
			appPath: appPath
		});

		var folders = [
			'api',
				'api/adapters',
				'api/blueprints',
				'api/controllers',
				'api/responses',
				'api/models',
				'api/policies',
				'api/services',
			'config',
			'config/locales', // TODO: consider putting this in `views/locales` by default?
			'views',
			'assets',
				'assets/images',
				'assets/js',
				'assets/styles',
				'assets/templates',
			'node_modules',
		];

		var templateFiles = [

			// api/responses/*
			'api/responses/serverError.js',
			'api/responses/badRequest.js',
			'api/responses/notFound.js',
			'api/responses/forbidden.js',

			// api/blueprints/*
			'api/blueprints/find.js',
			'api/blueprints/create.js',
			'api/blueprints/update.js',
			'api/blueprints/destroy.js',

			// api/policies/*
			'api/policies/sessionAuth.js',
			
			// assets/*
			'assets/js/sails.io.js',
			'assets/js/socket.io.js',
			'assets/js/socketio_example.js',

			// config/*
			require('./generators/config.session'),
			require('./generators/config.views'),
			'config/routes.js',
			'config/policies.js',
			'config/cors.js',
			'config/csrf.js',
			'config/log.js',
			'config/local.js',
			'config/i18n.js',
			'config/globals.js',
			'config/express.js',
			'config/sockets.js',
			'config/adapters.js',
			'config/bootstrap.js',
			'config/blueprints.js',

			// config/locales/*
			'config/locales/_README.md',
			'config/locales/en.json',
			'config/locales/es.json',
			'config/locales/de.json',
			'config/locales/fr.json',

			// top-level files
			require('sails-generate-gruntfile'),
			require('./generators/gitignore'),
			require('./generators/README.md'),
			'app.js',


			// views/*
			{
				configure: function (options, sails, handlers) {
					var id = 'homepage';
					handlers.success({
						pathToNew: path.resolve(sails.config.paths.views, id + '.' + options.viewEngine),
						templateFilePath: path.resolve(__dirname, './generators/view', options.viewEngine, id + '.' + options.viewEngine)
					});
				}
			},
			{
				configure: function (options, sails, handlers) {
					var id = '404';
					handlers.success({
						pathToNew: path.resolve(sails.config.paths.views, id + '.' + options.viewEngine),
						templateFilePath: path.resolve(__dirname, './generators/view', options.viewEngine, id + '.' + options.viewEngine)
					});
				}
			},
			{
				configure: function (options, sails, handlers) {
					var id = '500';
					handlers.success({
						pathToNew: path.resolve(sails.config.paths.views, id + '.' + options.viewEngine),
						templateFilePath: path.resolve(__dirname, './generators/view', options.viewEngine, id + '.' + options.viewEngine)
					});
				}
			},
			{
				configure: function (options, sails, handlers) {
					var id = 'layout';
					handlers.success({
						pathToNew: path.resolve(sails.config.paths.views, id + '.' + options.viewEngine),
						templateFilePath: path.resolve(__dirname, './generators/view', options.viewEngine, id + '.' + options.viewEngine)
					});
				}
			}

		];

		

		if (options.dry) {
			log.debug( 'DRY RUN');
			return handlers.success('Would have created a new app `' + options.appName + '` at ' + appPath + '.');
		}
		

		async.auto({

			'sails': function (cb) {
				// Bootstrap sails to get the version
				var sails = new Sails();
				sails.load({
					appPath: options.appPath,
					globals: false,
					loadHooks: ['userconfig', 'moduleloader']
				}, function loadedSails (err) {
					if (err) return cb(err);
					cb(null,sails);
				});
			},

			'package.json': ['sails', function (cb, async_data) {
				cb = switcher(cb);

				var sails = async_data.sails;

				// Override sails version temporarily
				var sailsVersionDependency = '~' + sails.version;
				sailsVersionDependency = 'git://github.com/balderdashy/sails.git#associations';

				// Generate package.json file
				GenerateJSONHelper({
					pathToNew: path.resolve(appPath, 'package.json'),
					data: {
						name: options.appName,
						'private': true,
						version: '0.0.0',
						description: 'a Sails application',
						dependencies: {
							'sails'			: sailsVersionDependency,
							'sails-disk'	: sails.dependencies['sails-disk'],
							'ejs'			: sails.dependencies['ejs'],
							'grunt'			: sails.dependencies['grunt']
						},
						scripts: {
							// TODO: Include this later when we have "sails test" ready.
							// test: './node_modules/mocha/bin/mocha -b',
							start: 'node app.js',
							debug: 'node debug app.js'
						},
						main: 'app.js',
						repository: '',
						author: '',
						license: ''
					}
				}, {
					alreadyExists: function () {
						return cb('A file or folder already exists at the destination path :: ' + path);
					},
					error: cb,
					success: cb.success
				});
			}],

			folders: function(cb) {
				async.each(folders, function(folder, cb) {
					cb = switcher(cb);

					// Build folders
					GenerateFolderHelper({
						pathToNew: path.resolve(appPath,folder),
						gitkeep: true
					}, {
						alreadyExists: function (path) {
							return cb('A file or folder already exists at the destination path :: ' + path);
						},
						error: cb,
						success: cb.success
					});
				}, cb);
			},

			templates: ['folders', 'package.json', function(cb) {
				async.each(templateFiles, function(fileOrGenerator, cb) {
					cb = switcher(cb);

					// Build new options set
					var opts;
					if (typeof fileOrGenerator === "string") {

						// No custom generator exists: just copy file from templates
						opts = _.extend({}/*{force: true}*/, options,{
							generator: {},
							templateFilePath: path.resolve(__dirname,'./templates/' + fileOrGenerator),
							pathToNew: path.resolve(appPath, fileOrGenerator)
						});
					}
					else {

						// Use custom generator
						opts = _.extend({},/*{force: true}*/options,{
							generator: fileOrGenerator
						});
					}

					// Generate module
					GenerateModuleHelper(opts, cb);
				}, cb);
			}],

			/**
			 * Copy required app-level dependencies
			 * (to avoid having to do a local npm install in new projects)
			 * 
			 * NOTE:
			 * This function should eventually be deprecated, IMO.
			 * 
			 * Only reason the need to copy these dependencies has not been removed is that it's complicated:
			 * --> For `ejs` and `sails-disk`, it's because the normal pattern of installing adapters/view engines w/ Sails
			 * is to `npm install` them in the end-user app.
			 * --> For `grunt`, it's because I couldn't figure it out the first time I tried.
			 *
			 * If anyone wants to help w/ this, it'd be a great spot to jump in!
			 */
			copyAppDependencies: ['folders','sails', function (cb, async_data) {

				// Copy dependencies (to avoid having to do a local npm install in new projects)
				//
				// TODO:
				// long term-- remove this completely (see above)
				
				// Don't wait for them to finish
				copyDependency('grunt', moduleRootPath, appPath);
				copyDependency('sails-disk', moduleRootPath, appPath);
				copyDependency('ejs', moduleRootPath, appPath);
				cb();

			}]

		}, handlers);
	}


};







/** 
 * Copy a core Sails dependency to the top-level node_modules directory
 * of the current application---- in a smart way
 *
 * TODO: extrapolate into a separate module
 *
 * @api private
 */
var fs = require('fs-extra');
function copyDependency (moduleName, srcRoot, destRoot, cb) {
	var srcModulePath = path.resolve(srcRoot, 'node_modules', moduleName);
	var destModulePath = path.resolve(destRoot, 'node_modules',moduleName);

	fs.copy(srcModulePath, destModulePath, function(err) {
		if (err) return cb && cb(err);

		// Parse the module's package.json
		var packageJSONPath = path.resolve(srcRoot,'package.json');
		var packageJSON;
		try {
			packageJSON = JSON.parse(fs.readFileSync(packageJSONPath, 'utf-8'));
		} catch (e) {
			// Ignore missing package.json
			packageJSON = {
				dependencies: {}
			};
		}

		// Get actual dependencies in this module's node_modules directory
		var dependencies;
		try {
			dependencies = fs.readdirSync(path.resolve(srcRoot, 'node_modules'));
			// Remove hidden files
			_.without(dependencies, function(val) {
				return val.match(/\..+/);
			});
		} catch (e) {
			// Assume empty dependencies in the event of an error
			dependencies = {};
		}

		// If there are any missing dependencies which are available in the parent package.json
		// copy them from that node_modules directory.
		var missingModules = _.difference(_.keys(packageJSON.dependencies || {}), _.values(dependencies));
		_.each(missingModules, function(missingModuleName) {
			log.verbose('Resolving ' + moduleName + '\'s missing dependency (' + missingModuleName + ') using the version in Sails.');
			copyDependency(missingModuleName, srcRoot, path.resolve(destRoot, 'node_modules', moduleName, 'node_modules'));
		});

		return cb && cb(err);
	});
}






// Using npm to install local deps is very slow!! (even from the cache)
// 
// 
// npm = require('enpeem'),
// 
// var sails = async_data.sails;
				// Build dependency strings
				// The dependencies we should copy over:
				// var dependenciesToCopy = [
				// 	'sails-disk@'+sails.dependencies['sails-disk'],
				// 	'ejs@'+sails.dependencies['ejs'],
				// 	'grunt@'+sails.dependencies['grunt']
				// ];
				// 
// // `cd` into the newly created app and load up npm
// process.chdir(appPath);

// // Just for diagnostics
// // var cmd = 'npm install ' + dependenciesToCopy.join(' ');
// // console.time(cmd);

// // Install dependencies from npm cache
// npm.install( dependenciesToCopy, {
// 	// see: https://github.com/isaacs/npm/issues/2568#issuecomment-30626394
// 	'cache-min': 999999999,
// 	// see: https://github.com/isaacs/npm/pull/4320
// 	loglevel: 'silent'
// }, cb);
// // }, function (err) {
// 	// if (err) return cb(err);
// 	// console.timeEnd(cmd);
// 	// cb();
// // });

	///////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////
	/////   The =old= `sails new`   ///////////////////////////////////////
	///////////////////////////////////////////////////////////////////////
	/////\////\/////\/////\/////\///////// ( for reference) ///////////////
	///////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////



	// // Whether the project is being made in an existing directory or not
	// var existingDirectory;



	// // If app is being created inside the current directory
	// if (options.appName === '.') {

	// 	// The app name is the current directory name
	// 	options.appName = _.last(process.cwd().split('/'));

	// 	// Set the current directory to the parent directory of the new app
	// 	process.chdir('../');

	// 	// This will be checked to determine if a new app directory needs to be made
	// 	existingDirectory = true;
	// }

	// // Check if the options.appName is an absolute path, if so don't prepend './'
	// if (options.appName.substr(0, 1) === '/') {
	// 	outputPath = options.appName;
	// } else {
	// 	outputPath = outputPath + '/' + options.appName;
	// }

	// // If app is being created in new directory
	// if (!existingDirectory) {

	// 	// Check if there is a directory in the current directory with the new
	// 	// app name, log and exit if there is
	// 	utils.verifyDoesntExist(outputPath, 'A file or directory already exists at: ' + outputPath);

	// 	// Create a directory with the specified app name
	// 	utils.generateDir(outputPath);
	// }

	// log.debug('Building new Sails.js app in ' + outputPath + '...');
	// if (options.useLinker) {
	// 	log.info('Using asset linker...');
	// }

	// // options.useLinker will determin the assets dir stucture for the new sails project 
	// if (options.useLinker) {
	// 	utils.copyBoilerplate('linkerAssets', outputPath + '/assets');
	// } else {
	// 	utils.copyBoilerplate('assets', outputPath + '/assets');
	// }

	// // Add these boilerplate dirs regardless
	// utils.copyBoilerplate('api', outputPath + '/api');

	// utils.copyBoilerplate('config', outputPath + '/config', function() {

	

	// 	// Insert view engine and template layout in views config

	// 	var viewsBoilerplatePath = __dirname + '/boilerplates/config/views.js';
	// 	var newViewsConfig = ejs.render(fs.readFileSync(viewsBoilerplatePath, 'utf8'), {
	// 		engine: options.templateLang,
	// 		layout: templateLayout
	// 	});			
	// 	fs.writeFileSync(outputPath + '/config/views.js', newViewsConfig, 'utf8');

	// });

	// // Different stuff for different view engines
	// if (options.templateLang === 'handlebars') options.templateLang = 'hbs';


	// // Disable template layout for jade and haml
	// var templateLayout;
	// if (options.templateLang === 'jade' || options.templateLang === 'haml') {
	// 	templateLayout = false;
	// } else templateLayout = '\'layout\'';

	// utils.copyBoilerplate('views/' + options.templateLang, outputPath + '/views', function() {

	// 	// If using linker, override the layout file with linker layout file
	// 	if (options.useLinker) {

	// 		if (options.templateLang !== 'ejs') {
	// 			log.warn('Automatic asset linking is not implemented for the `' + options.templateLang + '` view ' +
	// 				'engine at this time. You must modify the Gruntfile yourself for this feature to work.');
	// 		}
	// 		utils.copyBoilerplate('linkerLayouts/' + options.templateLang, outputPath + '/views');
	// 	}

	// });	

	// // Default app launcher file (for situations where sails lift isn't good enough)
	// utils.generateFile('app.js', outputPath + '/app.js');

	// // Create .gitignore
	// utils.generateFile('gitignore', outputPath + '/.gitignore');

	// // Generate package.json
	// log.verbose('Generating package.json...');
	// fs.writeFileSync(outputPath + '/package.json', JSON.stringify({
	// 	name: options.appName,
	// 	'private': true,
	// 	version: '0.0.0',
	// 	description: 'a Sails application',
	// 	dependencies: {
	// 		sails			: sails.version,
	// 		grunt			: '0.4.1',
	// 		'sails-disk'	: '~0.9.0',
	// 		ejs				: '0.8.4',
	// 		optimist		: '0.3.4' // TODO: remove this and handle it differently (maybe)
	// 	},
	// 	scripts: {
	// 		// Include this later when we have "sails test" ready.
	// 		// test: './node_modules/mocha/bin/mocha -b',
	// 		start: 'node app.js',
	// 		debug: 'node debug app.js'
	// 	},
	// 	main: 'app.js',
	// 	repository: '',
	// 	author: '',
	// 	license: ''
	// }, null, 4));

	// // Copy Gruntfile
	// log.verbose('Generating Gruntfile...');
	// utils.generateFile('Gruntfile.js', outputPath + '/Gruntfile.js');

	// // Generate README
	// log.verbose('Generating README.md...');
	// fs.writeFileSync(outputPath + '/README.md', '# ' + options.appName + '\n### a Sails application');

	// // Copy dependencies (to avoid having to do a local npm install in new projects)
	// utils.generateDir(outputPath + '/node_modules');
	// utils.copySailsDependency('optimist', outputPath + '/node_modules');
	// utils.copySailsDependency('sails-disk', outputPath + '/node_modules');
	// utils.copySailsDependency('ejs', outputPath + '/node_modules');

	// // Other grunt dependencies are automatically pulled from sails core deps.
	// utils.copySailsDependency('grunt', outputPath + '/node_modules');

	// // Conditionally, copy Sails itself into new project as a local dependency
	// if (options.copySails) {
	// 	utils.copySails(outputPath + '/node_modules/sails', copySails_cb);

	// 	// Using a symbolic link is much quicker than copying the directory over directly, 
	// 	// but it serves no purpose, since the global sails will be used automatically 
	// 	// if no local dependency exists
	// 	// var sailsGlobalInstallPath = __dirname + '/../.';
	// 	// fs.symlinkSync(sailsGlobalInstallPath, outputPath + '/node_modules/sails', 'dir');
	// }
	// else copySails_cb();


	// // Let the user know that `sails new` was successful
	// function copySails_cb (err) {
	// 	console.log('');
	// 	log.info('New app created!');
	// 	return cb(err);
	// }
// };








		// Evaluate options
		// var appName = options.appName;
		// var isLinkerEnabled = options.assetLinker.enabled;
		// var linkerSrc = options.assetLinker.src;

		// log.error('Sorry, `sails new` is currently out of commission.');
		// process.exit(1);