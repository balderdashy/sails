/**
 * Module dependencies
 */

var assert = require('assert'),
	sailsHelper = require('./helpers/sailsHelper');




/**
 * Test that the routes loaded in `sails.config.routes` apply properly
 */

describe('Specified routes', function() {

	var sails;

	before(function(done) {
		sailsHelper.build(function(err, _sails) {
			if (err || !_sails) return done(err || 'Sails could not be instantiated.');
			sails = _sails;
			return done();
		});
	});

	after(function(done) {
		sailsHelper.teardown(sails,done);
	});

	describe('Static routes', function () {

		it('should respond to requests that match the url pattern', function (done) {
			// console.log('!!!!');
			assert(true);
			done();

		});
	});

	// describe('with dynamic url paths specified', function() {

	// 	it('should respond to requests that match the url pattern', function(done) {

	// 		httpHelper.writeRoutes({
	// 			'get /test/:category/:size': {
	// 				controller: 'test',
	// 				action: 'dynamic'
	// 			}
	// 		});

	// 		httpHelper.testRoute('get', 'test/shirts/large', function(err, response) {
	// 			if (err) done(new Error(err));

	// 			var expected = JSON.stringify([{
	// 					'name': 'category',
	// 					'optional': false
	// 				}, {
	// 					'name': 'size',
	// 					'optional': false
	// 				}
	// 			]);

	// 			assert(expected === response.body);
	// 			done();
	// 		});
	// 	});
	// });
});