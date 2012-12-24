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

// Bootstrap waterline and get access to collections, especially User
var bootstrap = require('./bootstrap.test.js');
var User;

describe('transactions', function() {

	// Bootstrap waterline with default adapters and bundled test collections
	before(bootstrap.init);

	// Get User object ready to go before each test
	beforeEach(function() {
		return User = bootstrap.collections.user;
	});

	describe('static semaphore (collection-wide lock)', function() {

		it('should be able to acquire lock', function(done) {
			User.lock(null, done);
		});

		it('should NOT allow another lock to be acquired until the first lock is released', function(done) {
			// The callback should never fire until the lock is released
			User.lock(null, function (err) {
				if (!err) throw "The lock was acquired by two users at once!";
				else if (err) throw err;
			});

			// Note that other code can still run while the semaphore remains gated
			setTimeout(done,100);
		});

		it('should NOT be able to cancel a lock request if it\'s already been satisfied', function(done){
			User.cancel(null,function (err) {
				if (err) done();
				else throw "Lock acquisition request cancelled when the lock had already been granted!";
			});
		});
	});
});