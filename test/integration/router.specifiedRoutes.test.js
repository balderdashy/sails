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
	describe('Specified routes', function() {
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

		describe('with an unspecified http method', function() {

			before(function() {
				httpHelper.writeRoutes({
					'/testRoute': {
						controller: 'test',
						action: 'verb'
					}
				});				
			});
			
			it('should respond to get requests', function(done) {


				httpHelper.testRoute('get', 'testRoute', function(err, response) {
					if (err) done(new Error(err));

					assert(response.body === 'get', Err.badResponse(response));
					done();
				});
			});

			it('should respond to post requests', function(done) {

				httpHelper.testRoute('post', 'testRoute', function(err, response) {
					if (err) done(new Error(err));

					assert(response.body === 'post', Err.badResponse(response));
					done();
				});
			});

			it('should respond to put requests', function(done) {

				httpHelper.testRoute('put', 'testRoute', function(err, response) {
					if (err) done(new Error(err));

					assert(response.body === 'put', Err.badResponse(response));
					done();
				});
			});

			it('should respond to delete requests', function(done) {

				httpHelper.testRoute('del', 'testRoute', function(err, response) {
					if (err) done(new Error(err));

					assert(response.body === 'delete', Err.badResponse(response));
					done();
				});
			});
		});

		describe('with get http method specified', function() {

			before(function() {
				httpHelper.writeRoutes({
					'get /testRoute': {
						controller: 'test',
						action: 'verb'
					}
				});				
			});

			it('should respond to get requests', function(done) {

				httpHelper.testRoute('get', 'testRoute', function(err, response) {
					if (err) done(new Error(err));

					assert(response.body === 'get', Err.badResponse(response));
					done();
				});
			});

			it('shouldn\'t respond to post requests', function(done) {

				httpHelper.testRoute('post', 'testRoute', function(err, response) {
					if (err) done(new Error(err));

					assert(response.body !== 'post', Err.badResponse(response));
					done();
				});
			});
		});

		describe('with post http method specified', function() {

			before(function() {
				httpHelper.writeRoutes({
					'post /testRoute': {
						controller: 'test',
						action: 'verb'
					}
				});
			});

			it('should respond to post requests', function(done) {

				httpHelper.testRoute('post', 'testRoute', function(err, response) {
					if (err) done(new Error(err));

					assert(response.body === 'post', Err.badResponse(response));
					done();
				});
			});
		});

		describe('with put http method specified', function() {

			before(function() {
				httpHelper.writeRoutes({
					'put /testRoute': {
						controller: 'test',
						action: 'verb'
					}
				});
			});

			it('should respond to put requests', function(done) {

				httpHelper.testRoute('put', 'testRoute', function(err, response) {
					if (err) done(new Error(err));

					assert(response.body === 'put', Err.badResponse(response));
					done();
				});
			});
		});

		describe('with delete http method specified', function() {

			before(function(){
				httpHelper.writeRoutes({
					'delete /testRoute': {
						controller: 'test',
						action: 'verb'
					}
				});				
			});

			it('should respond to delete requests', function(done) {


				httpHelper.testRoute('del', 'testRoute', function(err, response) {
					if (err) done(new Error(err));

					assert(response.body === 'delete', Err.badResponse(response));
					done();
				});
			});
		});

		describe('with dynamic url paths specified', function() {

			before(function() {
				httpHelper.writeRoutes({
					'get /test/:category/:size': {
						controller: 'test',
						action: 'dynamic'
					}
				});
			});

			it('should respond to requests that match the url pattern', function(done) {

				httpHelper.testRoute('get', 'test/shirts/large', function(err, response) {
					if (err) done(new Error(err));

					var expected = JSON.stringify([{
						'name': 'category',
						'optional': false
					}, {
						'name': 'size',
						'optional': false
					}]);

					assert(expected === JSON.stringify(JSON.parse(response.body)));
					done();
				});
			});
		});

		describe('should be case-insensitive', function() {

			before(function() {
				httpHelper.writeRoutes({
					'get /testRoute': {
						controller: 'test',
						action: 'verb'
					}
				});
			});

			it('', function(done) {
				httpHelper.testRoute('get', 'tEStrOutE', function(err, response) {
					if (err) done(new Error(err));

					assert(response.body === 'get', Err.badResponse(response));
					done();
				});
			})
		});

		describe('should accept case-insensitive controller key', function() {

			before(function() {
				httpHelper.writeRoutes({
					'get /testRoute': {
						controller: 'tEsT',
						action: 'verb'
					}
				});
			});

			it('', function(done) {
				httpHelper.testRoute('get', 'testRoute', function(err, response) {
					if (err) done(new Error(err));

					assert(response.body === 'get', Err.badResponse(response));
					done();
				});
			});
		});

		describe('should accept case-insensitive action key', function() {

			before(function(){
				httpHelper.writeRoutes({
					'get /testRoute': {
						controller: 'test',
						action: 'capiTalleTTers'
					}
				});
			});

			it('', function(done) {
				httpHelper.testRoute('get', 'testRoute', function(err, response) {
					if (err) done(new Error(err));

					assert(response.body === 'CapitalLetters', Err.badResponse(response));
					done();
				});
			});
		});

	});
});