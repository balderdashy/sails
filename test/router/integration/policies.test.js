var assert = require('assert');
var httpHelper = require('./helpers/httpHelper.js');
var appHelper = require('./helpers/appHelper');
var path = require('path');
var fs = require('fs');

describe('router :: ', function() {

	describe('Policies', function() {
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

		describe('an error in the policy callback', function() {

			before(function() {
				var config = "module.exports.policies = { '*': 'error_policy' };";
				fs.writeFileSync(path.resolve('../', appName, 'config/policies.js'), config);
			});

			it('should return a 500 status code and message using default error handling in config/500.js', function(done) {
				httpHelper.testRoute('get', {
					url: 'test',
					headers: {
						'Content-Type': 'application/json'
					},
					json: true
				}, function(err, response) {
					if (err) return done(new Error(err));
					assert.equal(response.statusCode, 500);
					assert(response.body instanceof Object);
					assert(response.body.errors instanceof Array);
					assert.equal(response.body.errors[0], 'Test Error');
					done();
				});
			});
		});

		describe('custom policies', function() {

			before(function() {
				var policy = {
					'test': {
						'index': 'error_policy'
					}
				};

				var config = "module.exports.policies = " + JSON.stringify(policy);
				fs.writeFileSync(path.resolve('../', appName, 'config/policies.js'), config);
			});

			describe('a get request to /:controller', function() {

				it('should return a proper serverError with a message', function(done) {

					httpHelper.testRoute('get', {
						url: 'test',
						headers: {
							'Content-Type': 'application/json'
						},
						json: true
					}, function(err, response) {
						if (err) return done(err);

						// Assert HTTP status code is correct
						assert.equal(response.statusCode, 500);

						// Assert that response has status: 500
						assert.equal(response.body.status, 500);

						// Assert that response has the proper error message
						assert.equal(response.body.errors[0], 'Test Error');
						done();
					});
				});
			});

			describe('a get request to /:controller/:id', function() {

				it('should return a string', function(done) {

					httpHelper.testRoute('get', {
						url: 'test/1',
						headers: {
							'Content-Type': 'application/json'
						},
						json: true
					}, function(err, response) {
						if (err) return done(err);

						assert.equal(response.body, "find");
						done();
					});
				});
			});
		});

		describe('chaining policies', function() {

			before(function() {
				var policy = {
					'test': {
						'index': ['fake_auth', 'isAuthenticated']
					}
				};

				var config = "module.exports.policies = " + JSON.stringify(policy);
				fs.writeFileSync(path.resolve('../', appName, 'config/policies.js'), config);
			});

			describe('a get request to /:controller', function() {

				it('should return a string', function(done) {

					httpHelper.testRoute('get', {
						url: 'test',
						json: true
					}, function(err, response) {
						if (err) return done(err);

						assert.equal(response.body, "index");
						done();
					});
				});
			});
		});

		describe('chaining wildcard "*" policies', function() {

			before(function() {
				var policy = {
					'test': {
						'*': ['fake_auth', 'isAuthenticated']
					}
				};

				var config = "module.exports.policies = " + JSON.stringify(policy);
				fs.writeFileSync(path.resolve('../', appName, 'config/policies.js'), config);
			});

			describe('a get request to /:controller', function() {

				it('should return a string', function(done) {

					httpHelper.testRoute('get', {
						url: 'test',
						json: true
					}, function(err, response) {
						if (err) return done(err);

						assert.equal(response.body, "index");
						done();
					});
				});
			});
		});

		describe('policies for actions named with capital letters', function() {

			before(function() {
				var policy = {
					'*': false,
					'test': {
						'*': false,
						'CapitalLetters': true
					}
				};

				var config = "module.exports.policies = " + JSON.stringify(policy);
				fs.writeFileSync(path.resolve('../', appName, 'config/policies.js'), config);
			});

			describe('a get request to /:controller', function() {

				it('should return a string', function(done) {

					httpHelper.testRoute('get', {
						url: 'test/CapitalLetters',
						json: true
					}, function(err, response) {
						if (err) return done(err);

						assert.equal(response.body, "CapitalLetters");
						done();
					});
				});
			});
		});

	});


});