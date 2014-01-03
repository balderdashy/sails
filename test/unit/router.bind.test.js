/**
 * Module dependencies
 */
var supertest = require('supertest');
var $Sails = require('../helpers/sails');
var $Router = require('../helpers/router');

// Middleware fixtures
var RESPOND = require('../fixtures/middleware');


describe('Router.bind', function (){

	$Sails.load.withAllHooksDisabled();



	$Router.bind('get /foo', RESPOND.HELLO)
	.expectBoundRoute({
		path: '/foo',
		method: 'get'
	})
	.test(function () {
		it('should send expected response (get /foo)', function (done) {
			supertest(this.sails.router._slave)
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
	.test(function () {
		it('should send expected response (post /bar_baz_beezzz)', function (done) {
			supertest(this.sails.router._slave)
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
	.test(function () {
		it('should send expected response (patch /user)', function (done) {
			supertest(this.sails.router._slave)
			.patch('/user')
			.expect(200, { hello: 'world' })
			.end(done);
		});
	});


	$Router
	.test(function () {
		it('should respond with 404 handler', function (done) {
			supertest(this.sails.router._slave)
			.get('/something_undefined')
			.expect(404)
			.end(done);
		});
	});


	$Router.bind('post /something_that_throws', RESPOND.SOMETHING_THAT_THROWS)
	.test(function () {
		it('should respond with 500 handler if something throws', function (done) {
			supertest(this.sails.router._slave)
			.post('/something_that_throws')
			.expect(500)
			.end(done);
		});
	});

});





