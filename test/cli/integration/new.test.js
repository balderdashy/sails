var assert = require('assert');
var fs = require('fs');
var wrench = require('wrench');
var exec = require('child_process').exec;
var _ = require('lodash');

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

		it('should merge existing package.json', function(done) {
      
			// make app folder and move into directory
			fs.mkdirSync(appName);
			process.chdir(appName);

			fs.writeFileSync('./package.json', JSON.stringify({
				'name': 'Custom App Name'
			}));

			exec( '.' + sailsbin + ' new .', function(err) {
				if (err) { done(new Error(err)); }

				var packageContent = fs.readFileSync('./package.json', 'utf8');
				assert(packageContent.indexOf('Custom App Name') !== -1, 'package.json was not merged correctly');

				// move from app to its parent directory
				process.chdir('../');

				done();
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
		'assets/styles',
		'assets/js/.gitkeep',
		'assets/styles/.gitkeep',
		'config/adapters.js',
		'config/bootstrap.js',
		'config/io.js',
		'config/local.js',
		'config/locales',
		'config/policies.js',
		'config/routes.js',
		'config/session.js',
		'config/views.js',
		'config/locales/default.js'
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
			'views/layout.jade'
		];

	}

	var filesExist = true;

	expectedFiles = expectedFiles.concat(templateFiles);

	_.each(expectedFiles, function (filename) {
		return filesExist = fs.existsSync('./' + appName + '/' + filename);
	});

	return filesExist;
}
