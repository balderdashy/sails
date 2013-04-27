/**
 * defaultsTo.test.js
 */

// Dependencies
var _ = require('underscore');
var parley = require('parley');
var assert = require("assert");

describe('defaultsTo', function() {

  it('should automatically set default value', function(done) {
    User.create({ name: "Johnny" }, function(err, user) {
      if (err) return done(new Error(err));
      if (!user) return done(new Error("No user returned by create()."));

      assert.equal(user.favoriteFruit, 'blueberry');
      done();
    });
  });

  describe('with boolean type', function() {

    it('should automatically set default value', function(done) {
      User.create({}, function(err, user) {
        if (err) return done(new Error(err));
        if (!user) return done(new Error("No user returned by create()."));

        assert.equal(user.status, 0);
        done();
      });
    });

  });

  describe('with override', function() {

    it('should automatically set default value', function(done) {
      User.create({ favoriteFruit: 'strawberry' }, function(err, user) {
        if (err) return done(new Error(err));
        if (!user) return done(new Error("No user returned by create()."));

        assert.equal(user.favoriteFruit, 'strawberry');
        done();
      });
    });

  });
});