/**
 * crud.transactions.test.js
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


describe('CRUD :: Composite methods and transactions', function (){
	describe ('compound crud',function () {

		it('should successfully run one findOrCreate()', function (done){
			var testName = 'findOrCreate test 0';

			User.findOrCreate({
				name: testName
			}, {
				name: testName
			}, function(err, user) {
				if (err) throw new Error(err);
				if (!user || (user.name !== testName)) {
					return done(new Error('findOrCreate() returned incorrect user!'));
				}

				User.find({name: testName},function(err,user) {
					if (err) throw new Error(err);
					if (!user || (user.name !== testName)) {
						return done(new Error('findOrCreate() returned incorrect user!'));
					}

					done();
				});
			});
		});

		it('should successfully run one findOrCreate() using shorthand', function (done){
			var testName = 'findOrCreate test 1';
			User.findOrCreate({
				name: testName
			}, done);
		});

	});

	describe('create', function() {

		// Basic concurrency (tests auto-increment)
		///////////////////////////////////////////////////

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
					User.findAll({
						or: [{
							name: 'series_test user 0'
						}, {
							name: 'series_test user 1'
						}]
					}, function(err, users) {
						if(users.length != 2) {
							return done(new Error('Proper users were not created!'));
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
				User.findAll({
					or: [{
						name: 'parallel_test user 0'
					}, {
						name: 'parallel_test user 1'
					}]
				}, function(err, users) {
					if(users.length != 2) {
						return done(new Error('Proper users were not created!'));
					} else done(err);
				});
			});
		});

		it('should properly autoincrement 10 newly created users', function(done) {
			async.forEach(_.range(10), function(i, cb) {
				User.create({
					name: 'ten_test user ' + i,
					type: 'ten_test crud.transaction'
				}, cb);
			}, function(err) {
				if (err) return done(new Error(err));
				
				// Now check that both users were created
				User.findAll({
					like: {
						type: 'ten_test '
					}
				},function foundLikeUsers (err, users) {
					if (err) return done(new Error(err));
					if(users.length !== 10) {
						return done(new Error('Proper # of users not created!'));
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
});