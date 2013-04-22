var assert = require('assert');
var fs = require('fs');
var wrench = require('wrench');
var exec = require('child_process').exec;
var httpHelper = require('./helpers/httpHelper.js');
var sailsBin = './bin/sails.js';

describe('Default controller routing', function() {
	var appName = 'testApp';

	before(function(done) {

		if (fs.existsSync(appName)) {
			wrench.rmdirSyncRecursive(appName);
		}

		exec(sailsBin + ' new ' + appName, function(err) {
			if (err) done(new Error(err));

			// Get test controller content
			var testController = fs.readFileSync('test/http/fixtures/TestController.js');

			// Move into app directory and update sailsBin relative path
			process.chdir(appName);
			sailsBin = '.' + sailsBin;

			// Add test controller to app
			fs.writeFileSync('api/controllers/TestController.js', testController);

			// Add empty router file to app
			httpHelper.writeRoutes({});

			done();
		});
	});

	after(function() {

		// return to test directory
		process.chdir('../');

		if (fs.existsSync(appName)) {
			wrench.rmdirSyncRecursive(appName);
		}
	});

	describe('requests to :controller/:method', function() {

		it('should call the specified method of the specified controller', function(done) {

			httpHelper.testRoute('get', 'test/index', function(err, response) {
				if (err) done(new Error(err));

				assert(response.body === 'index');
				done();
			});
		});

	});

	describe('REST default routes', function() {

		describe('a get request to /:controller', function() {

			it('should call the controller index method', function(done) {

				httpHelper.testRoute('get', 'test', function(err, response) {
					if (err) done(new Error(err));

					assert(response.body === 'index');
					done();
				});
			});
		});

		describe('a get request to /:controller/:id', function() {

			it('should call the controller find method', function(done) {

				httpHelper.testRoute('get', 'test/1', function(err, response) {
					if (err) done(new Error(err));

					assert(response.body === 'find');
					done();
				});
			});
		});

		describe('a get request to /:controller/create', function() {

			it('should call the controller create method', function(done) {

				httpHelper.testRoute('get', 'test/create', function(err, response) {
					if (err) done(new Error(err));

					assert(response.body === 'create');
					done();
				});
			});
		});

		describe('a post request to /:controller/create', function() {

			it('should call the controller create method', function(done) {

				httpHelper.testRoute('post', 'test/create', function(err, response) {
					if (err) done(new Error(err));

					assert(response.body === 'create');
					done();
				});
			});
		});

		describe('a put request to /:controller/:id', function() {

			it('should call the controller update method', function(done) {

				httpHelper.testRoute('put', 'test/1', function(err, response) {
					if (err) done(new Error(err));

					assert(response.body === 'update');
					done();
				});
			});
		});

		describe('a delete request to /:controller/:id', function() {

			it('should call the controller destroy method', function(done) {

				httpHelper.testRoute('del', 'test/1', function(err, response) {
					if (err) done(new Error(err));

					assert(response.body === 'destroy');
					done();
				});
			});
		});
	});
});
