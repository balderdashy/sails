/**
 * Module dependencies
 */
var $Sails = require('../helpers/sails');
var should = require('should');


describe('`sails.router`', function() {
	
	$Sails.load.withAllHooksDisabled();



	it('should be exposed on the `sails` global', function () {
		this.sails
			.router
			._slave
			.routes
				.should.be.ok;
	});
});
