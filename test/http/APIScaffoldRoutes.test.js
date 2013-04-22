var assert = require('assert');
var fs = require('fs');
var wrench = require('wrench');
var exec = require('child_process').exec;
var httpHelper = require('./helpers/httpHelper.js');
var sailsBin = './bin/sails.js';

describe('API scaffold routes', function() {
	var appName = 'testApp';

	before(function(done) {

		if (fs.existsSync(appName)) {
			wrench.rmdirSyncRecursive(appName);
		}

		exec(sailsBin + ' new ' + appName, function(err) {
			if (err) done(new Error(err));

			// Get test controller and test model content
			var emptyController = fs.readFileSync('test/http/fixtures/EmptyController.js');
			var testModel = fs.readFileSync('test/http/fixtures/Test.js');

			// Move into app directory and update sailsBin relative path
			process.chdir(appName);

			sailsBin = '.' + sailsBin;

			// Add test controller and test model to app
			fs.writeFileSync('api/controllers/TestController.js', emptyController);
			fs.writeFileSync('api/models/Test.js', testModel);

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

	describe('a get request to /:controller/create', function() {

		it('should return JSON for a newly created instance of the test model', function(done) {

			httpHelper.testRoute('get', {url: 'test/create', json: true}, function(err, response) {
				if (err) done(new Error(err));

				assert(response.body.id === 1);
				done();
			});
		});
	});

	describe('a post request to /:controller/create', function() {

		it('should return JSON for a newly created instance of the test model', function(done) {

			httpHelper.testRoute('post', {url: 'test/create', json: true}, function(err, response) {
				if (err) done(new Error(err));

				assert(response.body.id === 2);
				done();
			});
		});
	});

	describe('a get request to /:controller', function() {

		it('should return JSON for all instances of the test model', function(done) {

			httpHelper.testRoute('get', {url: 'test', json: true}, function(err, response) {
				if (err) done(new Error(err));

				assert(response.body[0].id === 1);
				assert(response.body[1].id === 2);
				done();
			});
		});
	});

	describe('a get request to /:controller/:id', function() {

		it('should return JSON for the instance of the test model with the specified id', function(done) {

			httpHelper.testRoute('get', {url: 'test/1', json: true}, function(err, response) {
				if (err) done(new Error(err));

				assert(response.body.id === 1);
				done();
			});
		});
	});

	describe('a put request to /:controller/:id', function() {

		it('should return JSON for the updated instance of the test model', function(done) {

			httpHelper.testRoute('put', {url: 'test/1?foo=bar', json: true}, function(err, response) {
				if (err) done(new Error(err));

				assert(response.body.foo === 'bar');
				done();
			});
		});
	});

	describe('a delete request to /:controller/:id', function() {

		it('should return JSON for the destroyed instance of the test model', function(done) {

			httpHelper.testRoute('del', {url: 'test/1', json: true}, function(err, response) {
				if (err) done(new Error(err));

				assert(response.body.id === 1);
				done();
			});
		});
	});
});
