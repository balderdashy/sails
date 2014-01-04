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
		it('should expose at least the expected core hooks', function () {
			this.sails.hooks.should.have
			.properties(constants.EXPECTED_DEFAULT_HOOKS);
		});
	});



	describe('configured with a custom hook called `someCustomHook`', function () {
		$Sails.load({
			hooks: { someCustomHook: customHooks.NOOP }
		});

		it('should expose `someCustomHook`', function () {
			this.sails.hooks.should.have
			.property('someCustomHook');
		});
		it('should also expose the expected core hooks', function () {
			this.sails.hooks.should.have
			.properties(constants.EXPECTED_DEFAULT_HOOKS);
		});
	});



	describe('configured with a missing hook dependency', function () {
		// $Sails.load();
	});



	describe('configured with a circular hook dependency', function () {
		// $Sails.load();
	});


});
