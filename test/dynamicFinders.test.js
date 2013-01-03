/**
 * dynamicFinders.test.js
 *
 * This module tests that dynamic finders ( i.e. findByFoo() ) are working properly
 */

// Dependencies
var _ = require('underscore');
var parley = require('parley');
var async = require('async');
var assert = require("assert");


describe('dynamic finders',function (){

	describe('findBy', function() {

		it('should return the user with the given name', function(done) {
			var testName = 'dynamic_finder_test_findByName';

			User.create({
				name: testName
			},function (err) {
				if (err) return done(err);
				User.findByName(testName,function(err,user) {
					if (err) return done(err);
					if (!user) return done('Dynamic finder did not return anything!');
					if (user.name !== testName) return done('Dynamic finder returned incorrect user!');
					done(err);
				});
			});
		});
	});

	describe('findAllBy', function() {

		it('should return the users with the given name', function(done) {
			var testName = 'dynamic_finder_test_findAllByName';

			User.create({
				name: testName
			},function (err) {
				if (err) return done(err);
				User.findAllByName(testName,function(err,users) {
					if (err) return done(err);
					if (users.length < 1) return done('Dynamic finder did not return anything!');
					if (users[0].name !== testName) return done('Dynamic finder returned incorrect user!');
					done(err);
				});
			});
		});
	});

	describe('edge cases', function() {

		it('should throw an error if finding by unknown attributes', function(done) {
			var testName = 'dynamic_finder_test_edge_cases';

			User.create({
				name: testName
			},function (err) {
				if (err) return done(err);

				// Some ridiculous dynamic finder
				try {
					User.findByAardvark(testName,done);
					throw new Error('Unexpected behavior-- trying to use a dynamic finder with unknown attribute(s) should cause an error.');
				}
				catch (e) {
					done();
				}
			});
		});
	});
});