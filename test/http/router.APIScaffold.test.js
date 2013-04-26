var assert = require('assert');
var httpHelper = require('./helpers/httpHelper.js');
var appHelper = require('./helpers/appHelper');

describe('API scaffold routes', function() {
	var appName = 'testApp';

	before(function(done) {
    appHelper.build(function(err) {
      if(err) return done(err);
      process.chdir(appName);
      done();
    });
  });

  after(function() {
    process.chdir('../');
    appHelper.teardown();
  });

	describe('a get request to /:controller/create', function() {

		it('should return JSON for a newly created instance of the test model', function(done) {

			httpHelper.testRoute('get', {url: 'empty/create', json: true}, function(err, response) {
				if (err) done(new Error(err));

				assert(response.body.id === 1);
				done();
			});
		});
	});

	describe('a post request to /:controller/create', function() {

		it('should return JSON for a newly created instance of the test model', function(done) {

			httpHelper.testRoute('post', {url: 'empty/create', json: true}, function(err, response) {
				if (err) done(new Error(err));

				assert(response.body.id === 2);
				done();
			});
		});
	});

	describe('a get request to /:controller', function() {

		it('should return JSON for all instances of the test model', function(done) {

			httpHelper.testRoute('get', {url: 'empty', json: true}, function(err, response) {
				if (err) done(new Error(err));

				assert(response.body[0].id === 1);
				assert(response.body[1].id === 2);
				done();
			});
		});
	});

	describe('a get request to /:controller/:id', function() {

		it('should return JSON for the instance of the test model with the specified id', function(done) {

			httpHelper.testRoute('get', {url: 'empty/1', json: true}, function(err, response) {
				if (err) done(new Error(err));

				assert(response.body.id === 1);
				done();
			});
		});
	});

	describe('a put request to /:controller/:id', function() {

		it('should return JSON for the updated instance of the test model', function(done) {

			httpHelper.testRoute('put', {url: 'empty/1?foo=bar', json: true}, function(err, response) {
				if (err) done(new Error(err));

				assert(response.body.foo === 'bar');
				done();
			});
		});
	});

	describe('a delete request to /:controller/:id', function() {

		it('should return JSON for the destroyed instance of the test model', function(done) {

			httpHelper.testRoute('del', {url: 'empty/1', json: true}, function(err, response) {
				if (err) done(new Error(err));

				assert(response.body.id === 1);
				done();
			});
		});
	});
});
