/**
 * Module dependencies
 */
var $Sails = require('../../_helpers/sails');
var $Router = require('../../_helpers/router');
var should = require('should');
var _ = require('lodash');



describe('sails.router.unbind', function (){

	$Sails.allHooksDisabled();


	$Router.unbind('get /foo')
	.shouldDelete({
		path: '/foo',
		method: 'get'
	});



	$Router.unbind('post /bar_baz_beezzz')
	.shouldDelete({
		path: '/bar_baz_beezzz',
		method: 'post'
	});



	$Router.unbind('patch /user')
	.shouldDelete({
		path: '/user',
		method: 'patch'
	});

});





