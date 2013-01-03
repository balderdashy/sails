/**
 * inQuery.test.js
 *
 * This module tests that IN queries ( i.e. find({attrName: ['val1','val2']},cb) ) are working properly
 */

// Dependencies
var _ = require('underscore');
var parley = require('parley');
var async = require('async');
var assert = require("assert");


describe('IN queries', function() {

	describe('after creating some users, ', function() {

		describe('searching for a set that contains one', function() {

			it('should return the proper user', function(done) {
				var testName = 'IN_query_test';
				var users = [{
					name: testName
				}, {
					name: 'something else'
				}];

				User.createEach(users, function(err) {
					if(err) return done(err);
					User.findAll({
						name: ["foo", testName, "bar", "baz"]
					}, function(err, users) {
						if(err) return done(err);
						if(users.length === 0) return done('IN query did not return anything!');
						if(users.length > 1) return done('IN query returned too many things!');
						if(users[0].name !== testName) return done('IN query returned incorrect user!');
						done(err);
					});
				});
			});
		});

		describe('searching for a set that contains none', function() {

			it('should return NONE', function(done) {
				User.findAll({
					name: ["foo", "bar", "baz"]
				}, function(err, users) {
					if(users.length > 0) return done('IN query returned things when it shouldn\'t have!');
					done(err);
				});
			});
		});
	});
});