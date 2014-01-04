/**
 * Module dependencies
 */
var should = require('should');

var $Sails = require('./helpers/sails');


describe('app.initializeHooks', function() {
	
	$Sails.load.withAllHooksDisabled();

	it('hooks should be exposed on the `sails` global', function () {
		// console.log(this.sails.hooks);
	});
});
