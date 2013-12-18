/**
 * Module dependencies
 */
var $Sails = require('../../_helpers/sails');
var $Router = require('../../_helpers/router');
var should = require('should');
var _ = require('lodash');
var supertest = require('supertest');


// Fixtures
var RESPOND = {
	HELLO: function (req, res) { res.send('hello world!'); },
	HELLO_500: function (req, res) { res.send(500, 'hello world!'); },

	JSON_HELLO: function (req, res) { res.json({ hello: 'world' }); },
};


describe('Router.bind', function (){
	$Sails.allHooksDisabled();



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






