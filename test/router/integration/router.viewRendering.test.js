var assert = require('assert');
var httpHelper = require('./helpers/httpHelper.js');
var appHelper = require('./helpers/appHelper');

describe('router :: ', function() {
	describe('View routes', function() {
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

		describe('with default routing', function() {

			it('should respond to a get request to localhost:1337 with welcome page', function(done) {

				httpHelper.testRoute('get', '', function(err, response) {
					if (err) return done(new Error(err));

					assert(response.body.indexOf('not found') < 0);
					done();
				});
			});
		});

		describe('with no specified routing', function() {

			it('should respond to get request to :controller with the template at views/:controller/index.ejs', function(done) {

				// Empty router file
				httpHelper.writeRoutes({});

				httpHelper.testRoute('get', 'viewTest', function(err, response) {
					if (err) return done(new Error(err));

					assert(response.body.indexOf('indexView') !== -1);
					done();
				});
			});

			it('should respond to get request to :controller/:action with the template at views/:controller/:action.ejs', function(done) {

				httpHelper.testRoute('get', 'viewTest/create', function(err, response) {
					if (err) return done(new Error(err));

					assert(response.body.indexOf('createView') !== -1);
					done();
				});
			});
		});
	});
});