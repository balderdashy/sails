var assert = require('assert');
var httpHelper = require('./helpers/httpHelper.js');
var appHelper = require('./helpers/appHelper');

describe('View routes', function() {
	var appName = 'testApp';

	before(function(done) {
		appHelper.build(function(err) {
			if (err) return done(err);

			process.chdir(appName);
			done();
		});
	});

	after(function() {
		process.chdir('../');
		appHelper.teardown();
	});

	describe('with default routing', function() {

		it('should respond to a get request to localhost:1337 with welcome page', function(done) {

			httpHelper.testRoute('get', '', function(err, response) {
				if (err) done(new Error(err));

				assert(response.body.indexOf('It works!') !== -1);
				done();
			});
		});
	});

	describe('with no specified routing', function() {

		it('should respond to get request to :controller with the template at views/:controller/index.ejs', function(done) {

			// Empty router file
			httpHelper.writeRoutes({});

			httpHelper.testRoute('get', 'viewTest', function(err, response) {
				if (err) done(new Error(err));

				assert(response.body.indexOf('indexView') !== -1);
				done();
			});
		});

		it('should respond to get request to :controller/:action with the template at views/:controller/:action.ejs', function(done) {

			httpHelper.testRoute('get', 'viewTest/create', function(err, response) {
				if (err) done(new Error(err));

				assert(response.body.indexOf('createView') !== -1);
				done();
			});
		});
	});
});
