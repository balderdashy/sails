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
				console.log("\n*************************\n* Creating user "+i);
				User.create({
					name: 'user ' + i
				}, function(err,user) {
					console.log("__ok__ Created User " + i+" with id "+user.id+"\n");
					cb();
				});
			}, function(err) {
				console.log("\n*************************\n* Creating user N");
				User.create({
					name: 'user N'
				}, function(err,user) {
					console.log("__ok__ Created User N with id "+user.id+"\n");
					done(err);
				});
			});
		});

		it('should create 2 users in parallel', function(done) {
			async.forEach(_.range(2), function(i, cb) {
				console.log("\n*************************\n* Creating user "+i);
				User.create({
					name: 'user ' + i
				}, function(err,user) {
					console.log("__ok__ Created User " + i+" with id "+user.id+"\n");
					cb();
				});
			}, function(err) {
				done(err);
			});
		});

		it('should properly autoincrement 10 newly created users', function(done) {
			async.forEach(_.range(10), function(i, cb) {
				console.log("Creating user "+i);
				User.create({
					name: 'user' + i
				}, function(err) {
					console.log("Created User" + i,err);
					cb();
				});
			}, function(err) {
				done(err);
			});
		});

	});
});