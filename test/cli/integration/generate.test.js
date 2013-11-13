var assert = require('assert');
var fs = require('fs');
var wrench = require('wrench');
var exec = require('child_process').exec;
var _ = require('lodash');

// Make existsSync not crash on older versions of Node
fs.existsSync = fs.existsSync || require('path').existsSync;

function capitalize(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

describe('API and adapter generators', function () {
	var sailsBin = './bin/sails.js';
	var appName = 'testApp';

	before(function(done) {

		if (fs.existsSync(appName)) {
			wrench.rmdirSyncRecursive(appName);
		}

		exec(sailsBin + ' new ' + appName, function (err) {
			if (err) done(new Error(err));

			// Move into app directory and update sailsBin relative path
			process.chdir(appName);
			sailsBin = '.' + sailsBin;

			done();
		});
	});

	after(function(done) {

		// return to test directory
		process.chdir('../');

		if (fs.existsSync(appName)) {
			wrench.rmdirSyncRecursive(appName);
		}

		done();
	});

	// Run generator tests for both js and coffee
	languages = [
		{language: 'Javascript', optionStr: '', suffix:'.js'},
		{language: 'CoffeeScript', optionStr: '--coffee', suffix:'.coffee'}
	];

	_.each(languages, function(lang) {

		describe(lang.language + ' generators', function() {

			describe('sails generate model <modelname> ' + lang.optionStr, function () {
				var modelName = 'user';

				it('should throw an error if no model name is specified', function(done) {

					exec(sailsBin + ' generate model', function (err) {
						assert.equal(err.code, 1);
						done();
					});
				});

				it('should create a model file in models folder', function(done) {

					exec(sailsBin + ' generate model ' + modelName + ' ' + lang.optionStr, function (err) {
						if (err) done(new Error(err));

						assert.doesNotThrow(function() {
							fs.readFileSync('./api/models/' + capitalize(modelName) + lang.suffix, 'utf8');
						});

						done();
					});
				});

				it('should throw an error if a model with the same name exists', function(done) {

					exec(sailsBin + ' generate model ' + modelName  + ' ' + lang.optionStr, function (err) {
						assert.equal(err.code, 1);
						done();
					});
				});
			});

			describe('sails generate controller <controllerName> ' + lang.optionStr, function () {
				var controllerName = 'user';

				it('should throw an error if no controller name is specified', function(done) {

					exec(sailsBin + ' generate controller ' + lang.optionStr, function (err) {
						assert.equal(err.code, 1);
						done();
					});
				});

				it('should create a controller file in controllers folder', function(done) {

					exec(sailsBin + ' generate controller ' + controllerName + ' ' + lang.optionStr, function (err) {
						if (err) done(new Error(err));

						assert.doesNotThrow(function() {
							fs.readFileSync('./api/controllers/' + capitalize(controllerName) + 'Controller' + lang.suffix, 'utf8');
						});

						done();
					});
				});

				it('should throw an error if a controller with the same name exists', function(done) {

					exec(sailsBin + ' generate controller ' + controllerName  + ' ' + lang.optionStr , function (err) {
						assert.equal(err.code, 1);
						done();
					});
				});
			});

			describe('sails generate adapter <modelname> ' + lang.optionStr, function () {
				var adapterName = 'mongo';

				it('should throw an error if no adapter name is specified', function(done) {

					exec(sailsBin + ' generate adapter ' + lang.optionStr, function (err) {
						assert.equal(err.code, 1);
						done();
					});
				});

				it('should create a adapter file in adapters folder', function(done) {

					exec(sailsBin + ' generate adapter ' + adapterName + ' ' + lang.optionStr, function (err) {
						if (err) done(new Error(err));

						assert.doesNotThrow(function() {
							fs.readFileSync('./api/adapters/' + capitalize(adapterName) + 'Adapter' + lang.suffix, 'utf8');
						});

						done();
					});
				});

				it('should throw an error if an adapter with the same name exists', function(done) {

					exec(sailsBin + ' generate adapter ' + adapterName  + ' ' + lang.optionStr, function (err) {
						assert.equal(err.code, 1);
						done();
					});
				});
			});

			describe('sails generate <modelname> ' + lang.optionStr, function () {
				var modelName = 'post';

				it('should throw an error if no model name is specified', function(done) {

					exec(sailsBin + ' generate ' + lang.optionStr, function (err) {
						assert.equal(err.code, 1);
						done();
					});
				});

				it('should create a controller and a model file', function(done) {

					exec(sailsBin + ' generate ' + modelName + ' ' + lang.optionStr, function (err) {
						if (err) done(new Error(err));

						assert.doesNotThrow(function() {
							fs.readFileSync('./api/models/' + capitalize(modelName) + lang.suffix, 'utf8');
						});

						assert.doesNotThrow(function() {
							fs.readFileSync('./api/controllers/' + capitalize(modelName) + 'Controller' + lang.suffix, 'utf8');
						});

						done();
					});
				});

				it('should throw an error if a controller file and model file with the same name exists', function(done) {

					exec(sailsBin + ' generate ' + modelName + ' ' + lang.optionStr, function (err) {
						assert.equal(err.code, 1);
						done();
					});
				});
			});
		});
	});
});
