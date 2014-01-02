/**
 * Module dependencies
 */
var $Sails = require('../../_helpers/sails');
var $Router = require('../../_helpers/router');

// Middleware fixtures
var RESPOND = require('../../_fixtures/middleware');


describe('Router.bind', function (){

	$Sails.load.withAllHooksDisabled();



	$Router.bind('get /foo', RESPOND.HELLO)
	.expectBoundRoute({
		path: '/foo',
		method: 'get'
	})
	.test(function (server) {
		it('should send expected response (get /foo)', function (done) {
			server
			.get('/foo')
			.expect(200, 'hello world!')
			.end(done);
		});
	});



	$Router.bind('post /bar_baz_beezzz', RESPOND.HELLO_500)
	.expectBoundRoute({
		path: '/bar_baz_beezzz',
		method: 'post'
	})
	.test(function (server) {
		it('should send expected response (post /bar_baz_beezzz)', function (done) {
			server
			.post('/bar_baz_beezzz')
			.expect(500, 'hello world!')
			.end(done);
		});
	});



	$Router.bind('patch /user', RESPOND.JSON_HELLO)
	.expectBoundRoute({
		path: '/user',
		method: 'patch'
	})
	.test(function (server) {
		it('should send expected response (patch /user)', function (done) {
			server
			.patch('/user')
			.expect(200, { hello: 'world' })
			.end(done);
		});
	});


	$Router
	.test(function (server) {
		it('should respond with 404 handler', function (done) {
			server
			.get('/something_undefined')
			.expect(404)
			.end(done);
		});
	});


	$Router.bind('post /something_that_throws', RESPOND.SOMETHING_THAT_THROWS)
	.test(function (server) {
		it('should respond with 500 handler if something throws', function (done) {
			server
			.post('/something_that_throws')
			.expect(500)
			.end(done);
		});
	});

});





