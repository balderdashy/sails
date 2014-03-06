var assert = require('assert');
var httpHelper = require('./helpers/httpHelper.js');
var appHelper = require('./helpers/appHelper');

describe('router :: ', function() {
	describe('View routes', function() {
		var appName = 'testApp';

		before(function(done) {
			this.timeout(5000);
			appHelper.build(done);
		});

		beforeEach(function(done) {
			appHelper.lift({verbose: false}, function(err, sails) {
				if (err) {throw new Error(err);}
				sailsprocess = sails;
				setTimeout(done, 100);
			});
		});

		afterEach(function(done) {
			sailsprocess.kill();
			done();
		});

		after(function() {
			// console.log('before `chdir ../`' + ', cwd was :: ' + process.cwd());
			process.chdir('../');
			// console.log('after `chdir ../`' + ', cwd was :: ' + process.cwd());
			appHelper.teardown();
		});

		describe('with default routing', function() {

			it('should respond to a get request to localhost:1342 with welcome page', function(done) {

				httpHelper.testRoute('get', '', function(err, response) {
					if (err) return done(new Error(err));

					assert(response.body.indexOf('not found') < 0);
					done();
				});
			});
		});

		describe('with no specified routing', function() {

			before(function() {
				httpHelper.writeRoutes({});
			});

			it('should respond to get request to :controller with the template at views/:controller/index.ejs', function(done) {

				// Empty router file
				
				httpHelper.testRoute('get', 'viewTest', function(err, response) {
					if (err) return done(new Error(err));

					assert(response.body.indexOf('indexView') !== -1, response.body);
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