/**
 * Module dependencies
 */
var assert = require('assert');
var expect = require('../../_assertions');
var SailsHelper = require('../../_helpers/sails');
var RouterHelper = require('../../_helpers/router');



describe('(load sails with all hooks disabled)\n', function () {

	SailsHelper.bindLifecycle({
		loadHooks: [],
		log: { level:'error' }
	});
	it('this.sails should exist', expect.exists('sails') );
});


describe('`sails.router`', function() {
	SailsHelper.bindLifecycle({
		loadHooks: [],
		log: { level:'error' }
	});
	it('should exist', expect.exists('sails.router') );

	describe('receives a request', function() {
		to('home route (/)', function() {
			before(RouterHelper.request('/'));
			__it('should trigger the default notFound (404) handler');
			__it('should receive a 404 response from default handler', expect.equal('response.status', 404));
			__it('should not receive a reponse body', expect.notExists('response.body'));
		});
	});

	to('a simple fn which calls res.send()', function () {		
		var route = '/simple';
		var fn = function (req, res) { res.send('ok!'); };
		var expectedResponse = { status: 200 };

		__it('binds the route', RouterHelper.bind(route, fn));
		__it('should now exist in the slave router');
		__it('receives a request to the route',RouterHelper.request(route));
		__it('should have called the proper fn');
		__it('should have sent the proper response', expect.equal('response', expectedResponse));
	});

	to('a simple fn which throws', function () {
		var route = '/throws';
		var fn = function (req, res) { throw new Error('heh heh'); };
		var expectedResponse = { status: 500 };

		__it('binds the route', RouterHelper.bind(route, fn));
		__it('should now exist in the slave router');
		__it('receives a request to the route', RouterHelper.request(route));
		__it('should have called the proper fn');
		__it('should have sent the proper response', expect.equal('response', expectedResponse));
	});
});






// private bdd helpers
function __it(name, fn) {
	it('\n\t    ...it ' + name, fn);
}
function to(name,fn) {
	describe('\n\t-- to ' +name+'...', fn);
}
