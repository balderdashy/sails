/**
 * transactions.test.js
 *
 * This module tests basic CRUD operations on the specified adapter, but in parallel.
 * It simulates simultaneous access to models in the same collection, and then models at the same time.
 * It tests manual app-level locks/mutices, and also the built in atomic operations:
 * autoIncrement(), findOrCreate(), findAndUpdate(), findAndDestroy()
 */
// Dependencies
var _ = require('underscore');
var parley = require('parley');
var assert = require("assert");

describe('transactions', function() {

	// Bootstrap waterline with default adapters and bundled test collections
	before(require('./bootstrap.test.js').init);

	describe('#lock() and unlock()', function() {
		it('should work without an error', function(done) {
			done();
		});
	});
});