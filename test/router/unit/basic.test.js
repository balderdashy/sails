/**
 * Module dependencies
 */
var assert = require('assert');
var expect = require('../../_assertions');
var SailsHelper = require('../../_helpers/sails');


describe('load sails with all hooks disabled', function () {

	SailsHelper.bindLifecycle({
		loadHooks: [],
		log: { level:'error' }
	});

	describe('this.sails', function () {
		it('should exist', expect.exists('sails') );
	});
	describe('this.sails.router', function (){
		it('should exist', expect.exists('sails.router') );
	});

	describe('router', function() {
		it('should not throw when handling `router:request` event', SailsHelper.request('/'));
	});
});


