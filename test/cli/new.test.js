var assert = require('assert');
var fs = require('fs');
var wrench = require('wrench');
var exec = require('child_process').exec;

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

	describe('sails new <appname> with options --template=haml', function() {

		it('should create new app with haml templates', function(done) {

			exec(sailsbin + ' new ' + appName + ' --template=haml', function(err) {
				if (err) { done(new Error(err)); }

				assert(checkGeneratedFiles(appName, 'haml'), 'generated files don\'t match expected files');

				var viewConfig = fs.readFileSync('./' + appName + '/config/views.js', 'utf8');
				assert(viewConfig.indexOf('haml') !== -1, 'configuration file is incorrect');
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
		'README.md',
		'api',
		'app.js',
		'assets',
		'config',
		'package.json',
		'public',
		'views',
		'api/adapters',
		'api/controllers',
		'api/models',
		'api/policies',
		'api/services',
		'api/adapters/.gitkeep',
		'api/controllers/.gitkeep',
		'api/models/.gitkeep',
		'api/policies/authenticated.js',
		'api/services/.gitkeep',
		'assets/js',
		'assets/mixins',
		'assets/styles',
		'assets/templates',
		'assets/js/.gitkeep',
		'assets/mixins/reset.css',
		'assets/mixins/sails.io.js',
		'assets/styles/.gitkeep',
		'assets/templates/.gitkeep',
		'config/adapters.js',
		'config/application.js',
		'config/assets.js',
		'config/bootstrap.js',
		'config/local.ex.js',
		'config/local.js',
		'config/locales',
		'config/policies.js',
		'config/routes.js',
		'config/views.js',
		'config/locales/english.js',
		'public/favicon.ico',
		'public/images',
		'public/robots.txt',
		'public/images/.gitkeep'
	];

	// Add template files of the specified language
	var templateFiles;

	if (templateLang === 'ejs') {

		templateFiles = [
			'views/404.ejs',
			'views/500.ejs',
			'views/home',
			'views/layout.ejs',
			'views/home/index.ejs'
		];

	} else if (templateLang === 'jade') {

		templateFiles = [
			'views/404.jade',
			'views/500.jade',
			'views/home',
			'views/layout.jade',
			'views/home/index.jade'
		];

	} else if (templateLang === 'haml') {

		templateFiles = [
			'views/404.haml',
			'views/500.haml',
			'views/home',
			'views/home/index.haml'
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

	expectedFiles = JSON.stringify(expectedFiles.concat(templateFiles));

	var files = JSON.stringify(wrench.readdirSyncRecursive(appName));

	return files === expectedFiles;
}
