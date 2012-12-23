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


describe('adapter', function() {
	describe('#initialize()', function() {
		it('should initialize and sync without an error', function(done) {
			// Grab included adapters and test models
			var adapters = {};
			var models = buildDictionary(__dirname + '/models', /(.+)\.js$/);

			var $ = new parley();
			var outcome = $(require("../waterline.js"))({
				adapters: adapters,
				collections: models
			});
			$(done)(outcome);
		});
	});
});