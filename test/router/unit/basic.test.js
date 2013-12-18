/**
 * Module dependencies
 */
var $Sails = require('../../_helpers/sails');
var should = require('should');


describe('`sails.router`', function() {
	$Sails.allHooksDisabled();

	it('should be exposed on the `sails` global', function () {
		this.sails
			.router
			._slave
			.routes
				.should.be.ok;
	});
});
