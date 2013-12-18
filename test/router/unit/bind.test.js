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
	.expect({
		path: '/foo',
		method: 'get'
	});



	$Router.bind('post /bar_baz_beezzz', RESPOND.HELLO)
	.expect({
		path: '/bar_baz_beezzz',
		method: 'post'
	});



	$Router.bind('patch /user', RESPOND.HELLO)
	.expect({
		path: '/user',
		method: 'patch'
	});

});






