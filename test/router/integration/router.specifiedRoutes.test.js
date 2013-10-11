var assert = require('assert');
var httpHelper = require('./helpers/httpHelper.js');
var appHelper = require('./helpers/appHelper');

describe('router :: ', function() {
	describe('Specified routes', function() {
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

		describe('with an unspecified http method', function() {

			it('should respond to get requests', function(done) {

				httpHelper.writeRoutes({
					'/testRoute': {
						controller: 'test',
						action: 'verb'
					}
				});

				httpHelper.testRoute('get', 'testRoute', function(err, response) {
					if (err) done(new Error(err));

					assert(response.body === 'get');
					done();
				});
			});

			it('should respond to post requests', function(done) {

				httpHelper.testRoute('post', 'testRoute', function(err, response) {
					if (err) done(new Error(err));

					assert(response.body === 'post');
					done();
				});
			});

			it('should respond to put requests', function(done) {

				httpHelper.testRoute('put', 'testRoute', function(err, response) {
					if (err) done(new Error(err));

					assert(response.body === 'put');
					done();
				});
			});

			it('should respond to delete requests', function(done) {

				httpHelper.testRoute('del', 'testRoute', function(err, response) {
					if (err) done(new Error(err));

					assert(response.body === 'delete');
					done();
				});
			});
		});

		describe('with get http method specified', function() {

			it('should respond to get requests', function(done) {

				httpHelper.writeRoutes({
					'get /testRoute': {
						controller: 'test',
						action: 'verb'
					}
				});

				httpHelper.testRoute('get', 'testRoute', function(err, response) {
					if (err) done(new Error(err));

					assert(response.body === 'get');
					done();
				});
			});

			it('shouldn\'t respond to post requests', function(done) {

				httpHelper.testRoute('post', 'testRoute', function(err, response) {
					if (err) done(new Error(err));

					assert(response.body !== 'post');
					done();
				});
			});
		});

		describe('with post http method specified', function() {

			it('should respond to post requests', function(done) {

				httpHelper.writeRoutes({
					'post /testRoute': {
						controller: 'test',
						action: 'verb'
					}
				});

				httpHelper.testRoute('post', 'testRoute', function(err, response) {
					if (err) done(new Error(err));

					assert(response.body === 'post');
					done();
				});
			});
		});

		describe('with put http method specified', function() {

			it('should respond to put requests', function(done) {

				httpHelper.writeRoutes({
					'put /testRoute': {
						controller: 'test',
						action: 'verb'
					}
				});

				httpHelper.testRoute('put', 'testRoute', function(err, response) {
					if (err) done(new Error(err));

					assert(response.body === 'put');
					done();
				});
			});
		});

		describe('with delete http method specified', function() {

			it('should respond to delete requests', function(done) {

				httpHelper.writeRoutes({
					'delete /testRoute': {
						controller: 'test',
						action: 'verb'
					}
				});

				httpHelper.testRoute('del', 'testRoute', function(err, response) {
					if (err) done(new Error(err));

					assert(response.body === 'delete');
					done();
				});
			});
		});

		describe('with dynamic url paths specified', function() {

			it('should respond to requests that match the url pattern', function(done) {

				httpHelper.writeRoutes({
					'get /test/:category/:size': {
						controller: 'test',
						action: 'dynamic'
					}
				});

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

		it('should be case-insensitive', function(done) {

			httpHelper.writeRoutes({
				'get /testRoute': {
					controller: 'test',
					action: 'verb'
				}
			});

			httpHelper.testRoute('get', 'tEStrOutE', function(err, response) {
				if (err) done(new Error(err));

				assert(response.body === 'get');
				done();
			});
		});

		it('should accept case-insensitive controller key', function(done) {

			httpHelper.writeRoutes({
				'get /testRoute': {
					controller: 'tEsT',
					action: 'verb'
				}
			});

			httpHelper.testRoute('get', 'testRoute', function(err, response) {
				if (err) done(new Error(err));

				assert(response.body === 'get');
				done();
			});
		});

		it('should accept case-insensitive action key', function(done) {

			httpHelper.writeRoutes({
				'get /testRoute': {
					controller: 'test',
					action: 'capiTalleTTers'
				}
			});

			httpHelper.testRoute('get', 'testRoute', function(err, response) {
				if (err) done(new Error(err));

				assert(response.body === 'CapitalLetters');
				done();
			});
		});

	});
});