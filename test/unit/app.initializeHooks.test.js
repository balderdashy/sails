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



	describe('configured with a custom hook called `noop`', function () {
		$Sails.load({
			hooks: { noop: customHooks.NOOP }
		});

		it('should expose `noop`', function () {
			this.sails.hooks.should.have
			.property('noop');
		});
		it('should also expose the expected core hooks', function () {
			this.sails.hooks.should.have
			.properties(constants.EXPECTED_DEFAULT_HOOKS);
		});
	});



	describe('configured with a hook (`noop2`), but not its dependency (`noop`)', function () {
		$Sails.load.expectFatalError({
			log: { level: 'silent' },
			hooks: {
				noop2: customHooks.NOOP2
			}
		});
	});



	describe('configured with a malformed hook', function () {
		$Sails.load.expectFatalError({
			log: { level: 'silly' },
			hooks: {
				badHook: customHooks.SPOILED_HOOK
			}
		});
	});



	describe('configured with a circular hook dependency', function () {
		$Sails.load.expectFatalError({
			log: { level: 'info' },
			hooks: {
				noop: customHooks.NOOP, 
				noop3: customHooks.NOOP3
			}
		});
		$Sails.load.expectFatalError({
			log: { level: 'silly' },
			hooks: {
				noop4: customHooks.NOOP4, 
				noop5: customHooks.NOOP5
			}
		});
	});


});
