/**
 * Module dependencies
 */
var assert = require('assert');
var expect = require('../../_assertions');
var SailsHelper = require('../../_helpers/sails');


describe('router', function() {

	describe('(when sails loaded with no hooks enabled)', function () {
		SailsHelper.bdd({
			loadHooks: [],
			log: { level:'error' }
		});


		describe('sanity check', function () {
			it('double-check that `this.sails` is available', expect.exists('sails') );
			it('`sails.router` should exist', expect.exists('sails.router') );
		});
		

	});

});

