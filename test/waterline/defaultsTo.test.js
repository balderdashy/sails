/**
 * defaultsTo.test.js
 *
 *
 */
// Dependencies
var _ = require('underscore');
var parley = require('parley');
var assert = require("assert");


describe('defaultsTo', function() {

	it('should automatically set default values for unspecified attributes in create', function(cb) {
		User.create({
			name: "Johnny"
		}, function (err, user) {
			if (err) return cb(new Error(err));
			if (!user) return cb(new Error("No user returned by create()."));
			if (user.favoriteFruit !== 'blueberry') return cb(new Error("Favorite fruit default not properly applied!"));
			return cb();
		});
	});

});