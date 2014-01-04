/**
 * Module dependencies
 */
var should = require('should');

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


	describe('with default config', function () {
		
		$Sails.load();
		
		it('hooks should be exposed on the `sails` global', function () {
			this.sails.hooks.should.be.an.Object;
		});
	});


	describe('with default config', function () {
		
		$Sails.load();
		
		it('hooks should be exposed on the `sails` global', function () {
			this.sails.hooks.should.be.an.Object;
		});
	});


});
