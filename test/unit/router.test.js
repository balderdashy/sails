/**
 * Module dependencies
 */
var should = require('should');

var $Sails = require('../helpers/sails');


describe('`sails.router`', function() {

    var sails = $Sails.load.withAllHooksDisabled();



    it('should be exposed on the `sails` global', function () {
        sails
            .router
            ._privateRouter
            .routes
                .should.be.ok;
    });
});
