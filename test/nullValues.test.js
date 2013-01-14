/**
 * nullValues.test.js
 *
 */
// Dependencies
var _ = require('underscore');
var async = require('async');
var assert = require("assert");

describe('Null values', function() {

	it('should be creatable', function(done) {
		User.create({
			name: null,
			type: 'null value create test'
		}, function(err, user) {
			if (err) return done(err);

			// Now try to find the user using a different key
			User.findAll({
				type: 'null value create test'
			}, function(err, users) {
				if (err) return done(new Error(err));
				if(users.length < 1) return done(new Error('Proper user was not created!'));
				if(users.length > 1) return done(new Error('Too many users created!'));
				else done(err);
			});
		});

	});

	it('should be findable', function(done) {
		// Now check that the user we just created can be found
		// but use the NULL name as the query
		User.findAll({
			name: null,
			type: 'null value create test'
		}, function(err, users) {
			if (err) return done(new Error(err));
			if(users.length < 1) return done(new Error('Proper user was not found!'));
			if(users.length > 1) return done(new Error('Too many users found!'));
			else done(err);
		});
	});
});