/**
* init.test.js
*
* This module is just a basic sanity check to make sure everything kicks off properly
*
*
*/

// Dependencies
var _ = require('underscore');
var parley = require('parley');
var assert = require("assert");
var buildDictionary = require('../buildDictionary.js');
var bootstrap = require('./bootstrap.test.js');

describe('waterline', function() {

	// Bootstrap waterline with default adapters and bundled test collections
	before(bootstrap.init);

	describe('#initialize() and sync()', function() {
		it('should work without firing an error', function(done) {
			done();
		});
	});

	// When this suite of tests is complete, shut down waterline to allow other tests to run without conflicts
	after(bootstrap.teardown);
});
