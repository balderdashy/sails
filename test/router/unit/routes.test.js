/**
 * Module dependencies
 */

var assert = require('assert');




/**
 * Test that the routes loaded in `sails.config.routes` apply properly
 */

describe('Specified routes', function() {

	before(function(done) {
		appHelper.build(function(err) {
			if (err) return done(err);
			process.chdir(appName);
			done();
		});
	});

	after(function() {

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
					}
				]);

				assert(expected === response.body);
				done();
			});
		});
	});
});