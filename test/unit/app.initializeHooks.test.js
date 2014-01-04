/**
 * Module dependencies
 */
var should = require('should');

var constants = require('./fixtures/constants');
var customHooks = require('./fixtures/customHooks');

var $Sails = require('./helpers/sails');



// TIP:
// 
// To get a hold of the `sails` instance as a closure variable
// (i.e. if you're tired of using the mocha context):
// var sails;
// $Sails.get(function (_sails) { sails = _sails; });


describe('app.initializeHooks()', function() {
	
	describe('with no hooks', function () {
		$Sails.load.withAllHooksDisabled();
		it('hooks should be exposed on the `sails` global', function () {
			this.sails.hooks.should.be.an.Object;
		});
	});



	describe('with all core hooks and default config', function () {
		$Sails.load();
		it('should expose hooks on the `sails` global', function () {
			this.sails.hooks.should.be.an.Object;
		});
		it('should expose at least the expected hooks', function () {
			this.sails.hooks.should.have
			.properties(constants.EXPECTED_DEFAULT_HOOKS);
		});
	});



	describe('configured with a custom hook', function () {
		$Sails.load({
			hooks: { myCustomHook: customHooks.NOOP }
		});
	});



	describe('configured with a missing hook dependency', function () {
		// $Sails.load();
	});



	describe('configured with a circular hook dependency', function () {
		// $Sails.load();
	});


});
