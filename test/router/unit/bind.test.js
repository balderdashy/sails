/**
 * Module dependencies
 */
var supertest = require('supertest');
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
	.test(function () {
		it('should respond as expected', function (done) {
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
		it('should respond as expected', function (done) {
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
		it('should respond to requests (patch /user)', function (done) {
			supertest(this.sails.router._slave)
			.patch('/user')
			.expect(200, { hello: 'world' })
			.end(done);
		});
	});

});





