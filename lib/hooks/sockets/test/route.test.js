/**
 * route.test.js
 *
 */



/**
 * Module dependencies
 */

var _		= require('lodash'),
	assert	= require('assert'),
	_route	= require('../interpreter/route'),
	Sails	= require('../../../app');



describe('#route()', function() {

	// Create simulated socket message
	var messageName	= 'get',
		fn			= function (response) {},
		socket		= {},
		socketReq	= {
			url: '/foo',
			params: {}
		};

	var sails, routeIOMessage;
	before(function prepareMethod (done) {
		sails = new Sails();
		routeIOMessage = _route(sails);
		done();
	});



	it('should not crash', function(done) {
		routeIOMessage (socketReq, fn, socket, messageName);

		done();
	});
});