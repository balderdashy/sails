var assert = require('assert');
var expect = require('../../_assertions');




/**
 * This mocked implementation of `req` forms the basis for
 * Sails' transport-agnostic support of Connect/Express
 * middleware.
 */
describe('Base Request (`req`)', function (){

	// Mock the request object.
	before(function (){
		this.req = require('../../../lib/router/req');
	});

	it('req', expect.exists('req'));
	it('req.params', expect.exists('req.params'));
	it('req.query', expect.exists('req.query'));
	it('req.body', expect.exists('req.body'));
});