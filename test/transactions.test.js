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

	describe('app-level transaction', function() {
		it('should be able to acquire lock', function(done) {
			User.transaction("test", function(err, unlock) {
				unlock();
				done(err);
			});
		});

		it('should NOT allow another lock to be acquired until the first lock is released', function(done) {
			var orderingTest = [];

			// The callback should not fire until the lock is released
			User.transaction('test', function(err,unlock) {
				testAppendLock(err);

				User.transaction('test',function (err,unlock) {
					testAppendLock(err);

					if(	_.isEqual(orderingTest,['lock','unlock','lock'])) done();
					else {
						console.error(orderingTest);
						throw "The lock was acquired by two users at once!";
					}
				});

				// Set timeout to release the lock after a 1/4 of a second
				setTimeout(function() {unlock(testAppendUnlock); }, 250);
			});

			// Note that other code can still run while the semaphore remains gated

			// Appends "unlock" to the orderingTest array and handles any errors
			function testAppendUnlock(err) {
				if (err) throw err;
				orderingTest.push('unlock');
			}
			// Appends "lock" to the orderingTest array and handles any errors
			function testAppendLock(err) {
				if (err) throw err;
				orderingTest.push('lock');
			}
		});

	});
});