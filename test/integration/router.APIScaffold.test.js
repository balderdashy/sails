/**
 * Test dependencies
 */
var assert = require('assert');
var httpHelper = require('./helpers/httpHelper.js');
var appHelper = require('./helpers/appHelper');
var util = require('util');

/**
 * Errors
 */
var Err = {
	badResponse: function(response) {
		return 'Wrong server response!  Response :::\n' + util.inspect(response.body);
	}
};


describe('router :: ', function() {

	describe('API scaffold routes', function() {
		var appName = 'testApp';

		before(function(done) {
			appHelper.build(function(err) {
				// console.log('before chdir ' + appName + ', cwd was :: ' + process.cwd());
				process.chdir(appName);
				// console.log('after chdir ' + appName + ', new cwd is :: ' + process.cwd());
				if (err) return done(err);
				done();
			});
		});

		after(function() {
			// console.log('before `chdir ../`' + ', cwd was :: ' + process.cwd());
			process.chdir('../');
			// console.log('after `chdir ../`' + ', cwd was :: ' + process.cwd());
			appHelper.teardown();
		});

		describe('a get request to /:controller/create', function() {

			it('should return JSON for a newly created instance of the test model', function(done) {

				httpHelper.testRoute('get', {
					url: 'empty/create',
					json: true
				}, function(err, response) {
					if (err) return done(new Error(err));

					assert(response.body.id === 1, Err.badResponse(response));
					done();
				});
			});
		});

		describe('a post request to /:controller/create', function() {

			it('should return JSON for a newly created instance of the test model', function(done) {

				httpHelper.testRoute('post', {
					url: 'empty/create',
					json: true,
					body: {}
				}, function(err, response) {
					if (err) return done(new Error(err));

					assert(response.body.id === 2, Err.badResponse(response));
					done();
				});
			});
		});

		describe('a get request to /:controller', function() {

			it('should return JSON for all instances of the test model', function(done) {

				httpHelper.testRoute('get', {
					url: 'empty',
					json: true
				}, function(err, response) {
					if (err) return done(new Error(err));

					assert(response.body[0].id === 1, Err.badResponse(response));
					assert(response.body[1].id === 2, Err.badResponse(response));
					done();
				});
			});
		});

		describe('a get request to /:controller/:id', function() {

			it('should return JSON for the instance of the test model with the specified id', function(done) {

				httpHelper.testRoute('get', {
					url: 'empty/1',
					json: true
				}, function(err, response) {
					if (err) return done(new Error(err));

					assert(response.body.id === 1, Err.badResponse(response));
					done();
				});
			});
		});

		describe('a put request to /:controller/:id', function() {

			it('should return JSON for the updated instance of the test model', function(done) {

				httpHelper.testRoute('put', {
					url: 'empty/1?foo=bar',
					json: true
				}, function(err, response) {
					if (err) return done(new Error(err));

					assert(response.body.foo === 'bar', Err.badResponse(response));
					done();
				});
			});
		});

		describe('a delete request to /:controller/:id', function() {

			it('should return JSON for the destroyed instance of the test model', function(done) {

				httpHelper.testRoute('del', {
					url: 'empty/1',
					json: true
				}, function(err, response) {
					if (err) return done(new Error(err));

					assert(response.body.id === 1, Err.badResponse(response));
					done();
				});
			});
		});

		describe('with pluralize turned on', function() {

			before(function() {
				httpHelper.writeBlueprint({
					pluralize: true
				});
			});

			it('should bind blueprint actions to plural controller names', function(done) {
				httpHelper.testRoute('get', {
					url: 'empties',
					json: true
				}, function(err, response) {
					if (err) done(new Error(err));

					assert(response.body instanceof Array);
					done();
				});
			});

			it('should not bind blueprint actions to singular controller names', function(done) {
				httpHelper.testRoute('get', {
					url: 'empty',
					json: true
				}, function(err, response) {
					if (err) done(new Error(err));

					assert(response.body instanceof Object);
					assert(response.body.status === 404);
					done();
				});
			});
		});
	});

});