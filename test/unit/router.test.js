/**
 * Module dependencies
 */
var should = require('should');

var $Sails = require('./helpers/sails');


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
