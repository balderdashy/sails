/**
 * Module dependencies
 */
var assert	= require('assert'),
	fs		= require('fs'),
	wrench	= require('wrench'),
	exec	= require('child_process').exec,
	_		= require('lodash'),
	util	= require('util');



/**
 * Module errors
 */
var Err = {
	UnexpectedGeneratedFiles: function (diff) {
		return new Error('Generated files don\'t match expected files.\n' + 
			'Diff ::\n' +
			util.inspect(diff)
		);
	}
};




describe('New app generator', function() {
	var sailsbin = './bin/sails.js';
	var appName = 'testApp';
	var defaultTemplateLang = 'ejs';

	beforeEach(function(done) {
		fs.exists(appName, function(exists) {
			if (exists) {
				wrench.rmdirSyncRecursive(appName);
			}
			done();
		});
	});

	afterEach(function(done) {
		fs.exists(appName, function(exists) {
			if (exists) {
				wrench.rmdirSyncRecursive(appName);
			}
			done();
		});
	});

	describe('sails new <appname>', function() {

		it('should create new app in new folder', function(done) {

			exec(sailsbin + ' new ' + appName, function(err) {
				if (err) { done(new Error(err)); }

				assert(checkGeneratedFiles(appName, defaultTemplateLang), 'generated files don\'t match expected files');
				done();
			});
		});

		it('should not overwrite a folder', function(done) {
			exec('mkdir ' + appName, function(err) {
				if (err) { done(new Error(err)); }

				exec(sailsbin + ' new ' + appName, function(err) {
					assert.equal(err.code, 1);
					done();
				});
			});
		});
	});

	describe('sails new .', function() {

		it('should create new app in existing folder', function(done) {

			// make app folder and move into directory
			fs.mkdirSync(appName);
			process.chdir(appName);

			exec( '.' + sailsbin + ' new .', function(err) {
				if (err) { done(new Error(err)); }

				// move from app to its parent directory
				process.chdir('../');

				assert(checkGeneratedFiles(appName, defaultTemplateLang), 'generated files don\'t match expected files');
				done();
			});
		});

		it('should not overwrite a folder', function(done) {
			exec('mkdir ' + appName, function(err) {
				if (err) { done(new Error(err)); }

				exec( '.' + sailsbin + ' new ' + appName, function(err) {
					assert.equal(err.code, 127); // Command fails
					done();
				});
			});
		});
	});

	describe('sails new with no template option', function() {

		it('should create new app with ejs templates', function(done) {

			exec(sailsbin + ' new ' + appName, function(err) {
				if (err) { done(new Error(err)); }

				assert(checkGeneratedFiles(appName, 'ejs'), 'generated files don\'t match expected files');

				var viewConfig = fs.readFileSync('./' + appName + '/config/views.js', 'utf8');
				assert(viewConfig.indexOf('ejs') !== -1, 'configuration file is incorrect');
				done();
			});
		});
	});

	describe('sails new <appname> with options --template=ejs', function() {

		it('should create new app with ejs templates', function(done) {

			exec(sailsbin + ' new ' + appName + ' --template=ejs', function(err) {
				if (err) { done(new Error(err)); }

				assert(checkGeneratedFiles(appName, 'ejs'), 'generated files don\'t match expected files');

				var viewConfig = fs.readFileSync('./' + appName + '/config/views.js', 'utf8');
				assert(viewConfig.indexOf('ejs') !== -1, 'configuration file is incorrect');
				done();
			});
		});
	});

	describe('sails new <appname> with options --template=jade', function() {

		it('should create new app with jade templates', function(done) {

			exec(sailsbin + ' new ' + appName + ' --template=jade', function(err) {
				if (err) { done(new Error(err)); }

				assert(checkGeneratedFiles(appName, 'jade'), 'generated files don\'t match expected files');

				var viewConfig = fs.readFileSync('./' + appName + '/config/views.js', 'utf8');
				assert(viewConfig.indexOf('jade') !== -1, 'configuration file is incorrect');
				done();
			});
		});
	});

	describe('sails new <appname> with options --template=handlebars', function() {

		it('should create new app with handlebars templates', function(done) {

			exec(sailsbin + ' new ' + appName + ' --template=handlebars', function(err) {
				if (err) { done(new Error(err)); }

				assert(checkGeneratedFiles(appName, 'handlebars'), 'generated files don\'t match expected files');

				var viewConfig = fs.readFileSync('./' + appName + '/config/views.js', 'utf8');
				assert(viewConfig.indexOf('hbs') !== -1, 'configuration file is incorrect');
				done();
			});
		});
	});
});

function checkGeneratedFiles(appName, templateLang) {
	
	var expectedFiles = [
		'.gitignore',
		'api',
		'app.js',
		'assets',
		'config',
		'Gruntfile.js',
		'package.json',
		'README.md',
		'views',
		'api/adapters',
		'api/controllers',
		'api/models',
		'api/policies',
		'api/services',
		'api/adapters/.gitkeep',
		'api/controllers/.gitkeep',
		'api/models/.gitkeep',
		'api/policies/isAuthenticated.js',
		'api/services/.gitkeep',
		'assets/favicon.ico',
		'assets/images',
		'assets/js',
		'assets/robots.txt',
		'assets/styles',
		'assets/images/.gitkeep',
		'assets/js/.gitkeep',
		'assets/js/app.js',
		'assets/js/sails.io.js',
		'assets/js/socket.io.js',
		'assets/styles/.gitkeep',
		'config/400.js',
		'config/403.js',
		'config/404.js',
		'config/500.js',
		'config/adapters.js',
		'config/bootstrap.js',
		'config/controllers.js',
		'config/cors.js',
		'config/csrf.js',
		'config/i18n.js',
		'config/local.js',
		'config/locales',
		'config/log.js',
		'config/policies.js',
		'config/routes.js',
		'config/session.js',
		'config/sockets.js',
		'config/views.js',
		'config/locales/_README.md',
		'config/locales/en.json',
		'config/locales/es.json',
		'config/locales/fr.json',
		'config/locales/de.json'
	];

	// Add template files of the specified language
	var templateFiles;

	if (templateLang === 'ejs') {

		templateFiles = [
			'views/404.ejs',
			'views/403.ejs',
			'views/500.ejs',
			'views/home',
			'views/layout.ejs',
			'views/home/index.ejs'
		];

	} else if (templateLang === 'jade') {

		templateFiles = [
			'views/404.jade',
			'views/403.jade',
			'views/500.jade',
			'views/home',
			'views/layout.jade',
			'views/home/index.jade'
		];

	} else if (templateLang === 'handlebars') {

		templateFiles = [
			'views/404.hbs',
			'views/500.hbs',
			'views/home',
			'views/layout.hbs',
			'views/home/index.hbs'
		];
	}

	// Compare stringified arrays because [1,2,3] != (and !==) [1,2,3]

	expectedFiles = expectedFiles.concat(templateFiles);

	// Read actual generated files from disk
	var files = wrench.readdirSyncRecursive(appName);

	// Disregard stupid files
	// (fs-specific, OS-specific, editor-specific, yada yada)
	files = _.reject(files, function(f) {
		return f.match(/^node_modules/) || f.match(/.DS_Store/gi) || f.match(/\*~$/); 
	});

	// Generate diff
	var diff = _.difference(files, expectedFiles);

	// Uneven # of files
	if (files.length !== expectedFiles.length) {
		throw Err.UnexpectedGeneratedFiles(diff);
		// return false;
	}

	// Files don't match
	if (diff.length !== 0) {
		throw Err.UnexpectedGeneratedFiles(diff);
		// return false;
	}

	// Everything's ok!
	return true;

}
