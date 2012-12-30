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
var async = require('async');
var assert = require("assert");


describe ('transactions',function () {

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
			User.transaction('test', function(err, unlock1) {
				if(err) return done(err);
				if(!unlock1) throw new Error("No unlock() method provided!");

				testAppendLock();

				User.transaction('test', function(err, unlock2) {
					if(err) return done(err);
					if(!unlock2) throw new Error("No unlock() method provided!");

					testAppendLock();

					// Release lock so other tests can use the 'test' transaction
					unlock2();

					if(_.isEqual(orderingTest, ['lock', 'unlock', 'lock'])) done();
					else {
						console.error(orderingTest);
						throw "The lock was acquired by two users at once!";
					}
				});

				// Set timeout to release the lock after a 1/20 of a second
				setTimeout(function() {
					unlock1(testAppendUnlock);
				}, 50);
			});

			// Note that other code can still run while the semaphore remains gated
			// Appends "unlock" to the orderingTest array and handles any errors


			function testAppendUnlock(err) {
				if(err) throw err;
				orderingTest.push('unlock');
			}
			// Appends "lock" to the orderingTest array and handles any errors


			function testAppendLock(err) {
				if(err) throw err;
				orderingTest.push('lock');
			}
		});


		it('should support 10 simultaneous dummy transactions', function(done) {
			var constellations = ['Andromeda', 'Antlia', 'Apus', 'Aquarius', 'Aquila', 'Ara', 'Aries', 'Auriga', 'Boötes', 'Caelum'];
			dummyTransactionTest(constellations,'constellation',done);
		});

		it('should support 50 simultaneous dummy transactions', function(done) {
			dummyTransactionTest(_.range(50),'number test 1',done);
		});

		it('should support 200 simultaneous dummy transactions', function(done) {
			dummyTransactionTest(_.range(200),'number test 2',done);
		});

		function dummyTransactionTest(items,type,done) {
			async.forEach(items, function(constellation, cb) {
				User.transaction('test_create',function(err,unlock) {
					User.create({
						name: constellation,
						type: type
					},function(err) {
						// Wait a short moment to introduce an element of choas
						setTimeout(function() {
							unlock();
							cb();
						},Math.round(Math.random())*5);
					});
				});
			}, function(err) {
				User.find({ type: type },function (err,users) {
					if(users.length != items.length) {
						console.error("Users: ");
						console.error(users);
						return done('Proper users were not created!');
					}
					done();
				});
			});
		}

		// it ('should timeout if the transaction takes a long time', function (done) {});
		// it('should not be able to release a lock more than once', function (done) {});
	});
});