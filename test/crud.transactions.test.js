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
var async = require('async');
var parley = require('parley');
var assert = require("assert");

// Bootstrap waterline and get access to collections, especially User
var bootstrap = require('./bootstrap.test.js');
var User;

describe('transactional CRUD operations :: ', function() {

	// Bootstrap waterline with default adapters and bundled test collections
	before(bootstrap.init);

	// Get User object ready to go before each test
	beforeEach(function() {
		return User = bootstrap.collections.user;
	});

	describe('create', function() {

		it('should create 2 users in series', function(done) {
			async.forEach(_.range(1), function(i, cb) {
				User.create({
					name: 'series_test user 0'
				}, cb);
			}, function(err) {
				if (err) return done(err);

				User.create({
					name: 'series_test user 1'
				}, function(err, user) {
					if (err) return done(err);

					// Now check that both users were created
					User.find({
						or: [{
							name: 'series_test user 0'
						}, {
							name: 'series_test user 1'
						}]
					}, function(err, users) {
						if(users.length != 2) {
							console.error("Users: ");
							console.error(users);
							return done('Proper users were not created!');
						} else done(err);
					});
				});
			});
		});

		it('should create 2 users in parallel', function(done) {
			async.forEach(_.range(2), function(i, cb) {
				User.create({
					name: 'parallel_test user ' + i
				}, cb);
			}, function(err) {
				if (err) return done(err);

				// Now check that both users were created
				User.find({
					or: [{
						name: 'parallel_test user 0'
					}, {
						name: 'parallel_test user 1'
					}]
				}, function(err, users) {
					if(users.length != 2) {
						console.error("Users: ");
						console.error(users);
						return done('Proper users were not created!');
					} else done(err);
				});
			});
		});

		it('should properly autoincrement 10 newly created users', function(done) {
			async.forEach(_.range(10), function(i, cb) {
				User.create({
					name: 'ten_test user ' + i
				}, cb);
			}, function(err) {
				if (err) return done(err);
				
				// Now check that both users were created
				User.find({
					like: {
						name: 'ten_test'
					}
				}, function(err, users) {
					if(users.length != 10) {
						console.error("Users: ");
						console.error(users);
						return done('Proper users were not created!');
					} else done(err);
				});
			});
		});

		// Transactional CRUD

		// it ('should handle 10 simultaneous findOrCreate() requests appropriately ',function (done){})
		// it ('should handle 10 simultaneous updateOrCreate() requests appropriately ',function (done){})
		// it ('should handle 10 simultaneous findAndUpdate() requests appropriately ',function (done){})
		// it ('should handle 10 simultaneous findAndDestroy() requests appropriately ',function (done){})


		// And just in case the adapter being tested requires these are transactions
		// it ('should handle 10 simultaneous update() requests appropriately ',function (done){})
		// it ('should handle 10 simultaneous destroy() requests appropriately ',function (done){})
		
	});

	// When this suite of tests is complete, shut down waterline to allow other tests to run without conflicts
	after(require('./bootstrap.test.js').teardown);
});