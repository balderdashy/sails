/**
 * compoundQueries.test.js
 *
 * This module tests compound operations:
 * findOrCreate()
 *
 */

// Dependencies
var assert = require('assert');


describe('findOrCreate()', function() {

  describe('database records', function() {

    // Create a base user
    before(function(done) {
      User.create({ name: 'findOrCreate()' }, function(err, res) {
        done();
      });
    });

    // Test that the user is found
    it('should find the user', function(done) {
      User.findOrCreate({ name: 'findOrCreate()' }, { name: 'findOrCreate()' }, function(err, res) {
        if(err) return done(new Error(err));
        assert.equal('findOrCreate()', res.name, 'A different record was returned');

        User.findAll({ name: 'findOrCreate()' }, function(err, res) {
          assert.equal(1, res.length, 'More than 1 user returned');
          done();
        });

      });
    });

    // Test that a new user is created
    it('should find the user', function(done) {
      User.findOrCreate({ name: 'new findOrCreate()' }, { name: 'new findOrCreate()' }, function(err, res) {
        if(err) return done(new Error(err));
        assert.equal('new findOrCreate()', res.name, 'A different record was returned');

        User.findAll({ name: 'new findOrCreate()' }, function(err, res) {
          assert.equal(1, res.length, 'More than 1 user returned');
          done();
        });

      });
    });

  });


  it('should add timestamp properties', function(done) {

    User.findOrCreate({ name: 'timestamp test' }, { name: 'timestamp test' }, function(err, res) {
      if(err) return done(new Error(err));
      if(!res) return done(new Error('No result was returned'));

      if(res.createdAt === null) return done(new Error('Did not properly add timestamps'));
      if(res.updatedAt === null) return done(new Error('Did not properly add timestamps'));
      done();
    });

  });

  it('should add default values', function(done) {

    User.findOrCreate({ name: 'defaults test' }, { name: 'defaults test' }, function(err, res) {
      if(err) return done(new Error(err));
      if(!res) return done(new Error('No result was returned'));

      assert.equal(res.favoriteFruit, 'blueberry', 'Default values not being set');
      done();
    });

  });

});