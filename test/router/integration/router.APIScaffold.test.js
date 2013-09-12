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

			httpHelper.testRoute('post', {url: 'empty/create', json: true, body: {}}, function(err, response) {
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

	describe('with pluralize turned on', function() {

		before(function () {
			httpHelper.writeBlueprint({pluralize: true});
		});

		it('should bind blueprint actions to plural controller names', function(done) {
			httpHelper.testRoute('get', {url: 'empties', json: true}, function(err, response) {
				if (err) done(new Error(err));

				assert(response.body instanceof Array);
				done();
			});
		});

		it('should not bind blueprint actions to singular controller names', function(done) {
			httpHelper.testRoute('get', {url: 'empty', json: true}, function(err, response) {
				if (err) done(new Error(err));

				assert(response.body instanceof Object);
				assert(response.body.status === 404);
				done();
			});
		});
	});

	describe('with JSON-API turned on', function() {

		before(function () {
			httpHelper.writeBlueprint({pluralize: true, jsonAPI: true});
		});

		describe('a post request to /:controller', function() {

			it('should return JSON-API for a newly created instance of the test model', function(done) {

				var body = JSON.stringify({empties: [{test: 555}]});

				httpHelper.testRoute('post', {url: 'empties', json: true, body: body}, function(err, response) {
					if (err) done(new Error(err));

					assert(response.body instanceof Object);
					assert(response.body.empties instanceof Array);
					assert(response.body.empties.length === 1);
					assert(response.body.empties[0].id === 3);
					assert(response.body.empties[0].test === 555);
					done();
				});
			});
		});

		describe('a get request to /:controller with ids query param as string', function() {

			it('should return JSON-API for all instances of the test model with the given ids', function(done) {

				httpHelper.testRoute('get', {url: 'empties', json: true, qs: {ids: '2,3'}}, function(err, response) {
					if (err) done(new Error(err));

					assert(response.body instanceof Object);
					assert(response.body.empties instanceof Array);
					assert(response.body.empties.length === 2);
					assert(response.body.empties[0].id === 2);
					assert(response.body.empties[1].id === 3);
					done();
				});
			});
		});

		describe('a get request to /:controller with ids query param as array', function() {

			it('should return JSON-API for all instances of the test model with the given ids', function(done) {

				httpHelper.testRoute('get', {url: 'empties', json: true, qs: {ids: [2, 3]}}, function(err, response) {
					if (err) done(new Error(err));

					assert(response.body instanceof Object);
					assert(response.body.empties instanceof Array);
					assert(response.body.empties.length === 2);
					assert(response.body.empties[0].id === 2);
					assert(response.body.empties[1].id === 3);
					done();
				});
			});
		});

		describe('a get request to /:controller/:ids', function() {

			it('should return JSON-API for all instances of the test model with the given ids', function(done) {

				httpHelper.testRoute('get', {url: 'empties/2,3', json: true}, function(err, response) {
					if (err) done(new Error(err));

					assert(response.body instanceof Object);
					assert(response.body.empties instanceof Array);
					assert(response.body.empties.length === 2);
					assert(response.body.empties[0].id === 2);
					assert(response.body.empties[1].id === 3);
					done();
				});
			});
		});

		describe('a patch request to /:controller/:id', function() {

			it('should return JSON-API for the updated instance of the test model', function(done) {

				var body = JSON.stringify([{op: 'replace', path: '/empties/0/test', value: 123}]),
					headers = {'Content-Type': 'application/json-patch+json'};

				httpHelper.testRoute('patch', {url: 'empties/3', json: true, body: body, headers: headers}, function(err, response) {
					if (err) done(new Error(err));

					assert(response.body instanceof Object);
					assert(response.body.empties instanceof Array);
					assert(response.body.empties.length === 1);
					assert(response.body.empties[0].id === 3);
					assert(response.body.empties[0].test === 123);
					done();
				});
			});
		});

		describe('a delete request to /:controller/:id', function() {

			it('should return a 204 No Content response', function(done) {

				httpHelper.testRoute('del', {url: 'empties/3', json: true}, function(err, response) {
					if (err) done(new Error(err));

					assert(response.statusCode === 204);
					assert(!response.body);
					done();
				});
			});
		});
	});
});
