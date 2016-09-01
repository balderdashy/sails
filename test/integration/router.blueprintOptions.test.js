/**
 * Module dependencies
 */

var assert = require('assert');
var _ = require('lodash');
var httpHelper = require('./helpers/httpHelper.js');
var appHelper = require('./helpers/appHelper');
var bootstrap31FakeUsers = require('./fixtures/users.js');



describe('router :: Blueprint option routes ::', function() {


  //  ███████╗██╗██╗  ██╗████████╗██╗   ██╗██████╗ ███████╗███████╗
  //  ██╔════╝██║╚██╗██╔╝╚══██╔══╝██║   ██║██╔══██╗██╔════╝██╔════╝
  //  █████╗  ██║ ╚███╔╝    ██║   ██║   ██║██████╔╝█████╗  ███████╗
  //  ██╔══╝  ██║ ██╔██╗    ██║   ██║   ██║██╔══██╗██╔══╝  ╚════██║
  //  ██║     ██║██╔╝ ██╗   ██║   ╚██████╔╝██║  ██║███████╗███████║
  //  ╚═╝     ╚═╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝
  //
  var ROUTES_CONFIG = {
    'POST /pet': {
      blueprint: 'find'
    },
    'GET /users': {
      blueprint: 'find',
      model: 'user'
    },
    'GET /users2': {
      blueprint: 'find',
      model: 'user',
      limit: 5
    },
    'GET /users3': {
      blueprint: 'find',
      model: 'user',
      limit: 5,
      populate_limit: 3
    },
    'GET /users4': {
      blueprint: 'find',
      model: 'user',
      limit: 5,
      populate_pets_limit: 3
    },
    'GET /users5': {
      blueprint: 'find',
      model: 'user',
      associations: ['profile']
    },
    'GET /users6': {
      blueprint: 'find',
      model: 'user',
      associations: ['pets']
    }
  };



  //  ██╗     ██╗███████╗███████╗ ██████╗██╗   ██╗ ██████╗██╗     ███████╗
  //  ██║     ██║██╔════╝██╔════╝██╔════╝╚██╗ ██╔╝██╔════╝██║     ██╔════╝
  //  ██║     ██║█████╗  █████╗  ██║      ╚████╔╝ ██║     ██║     █████╗
  //  ██║     ██║██╔══╝  ██╔══╝  ██║       ╚██╔╝  ██║     ██║     ██╔══╝
  //  ███████╗██║██║     ███████╗╚██████╗   ██║   ╚██████╗███████╗███████╗
  //  ╚══════╝╚═╝╚═╝     ╚══════╝ ╚═════╝   ╚═╝    ╚═════╝╚══════╝╚══════╝
  //
  var sailsAppInstance;
  before(function (done) {

    // Build the `testApp` directory
    appHelper.build(function(err) {
      if (err) { return done(err); }

      // Rebuild the `config/routes.js` file.
      httpHelper.writeRoutes(ROUTES_CONFIG);

      // Fire it up.
      appHelper.lift(function (err, sails) {
        if (err) { return done(err); }

        // Expose Sails app instance via closure so it can be lowered in the `after()` Mocha callback.
        sailsAppInstance = sails;

        // Add 31 users with 31 pets each
        bootstrap31FakeUsers(sails, done);

      });//</after lifting>
    });//</after building testApp>
  });//</before>

  after(function (done) {
    sailsAppInstance.lower(function (err) {
      if (err) { return done(err); }

      // cd up (out of testApp) into the top-level directory of the Sails repo.
      process.chdir('../');
      // Then rm -rf `testApp/`.
      appHelper.teardown();

      // This setTimeout is just here to create entropy and try to hunt down race conditions.
      setTimeout(function(){
        return done();
      }, 100);

    });//</sailsAppInstance.lower()>
  });//</after>






  //  ████████╗███████╗███████╗████████╗███████╗
  //  ╚══██╔══╝██╔════╝██╔════╝╚══██╔══╝██╔════╝
  //     ██║   █████╗  ███████╗   ██║   ███████╗
  //     ██║   ██╔══╝  ╚════██║   ██║   ╚════██║
  //     ██║   ███████╗███████║   ██║   ███████║
  //     ╚═╝   ╚══════╝╚══════╝   ╚═╝   ╚══════╝
  //
  describe('a get request to /user', function() {

    var users;
    before(function(done) {
      httpHelper.testRoute('get', {
        url: 'user',
        json: true
      }, function(err, response) {
        if (err) { return done(err); }
        users = response.body;
        return done();
      });
    });

    it('should return an array of 10 users (sails.config.blueprints.defaultLimit)', function() {
      assert(users.length === 10, 'Expected 10 users, got ' + users.length);
    });

    it('...each of which should have an array of 10 pets (sails.config.blueprints.defaultLimit)', function() {
      users.forEach(function(user) {
        assert(user.pets.length === 10, 'Expected 10 pets for user ' + user.name + '; got ' + user.pets.length);
      });
    });

    it('...and a user profile.', function() {
      users.forEach(function(user) {
        assert(user.profile.zodiac === (user.name + '_zodiac'), 'Expected profile zodiac `' + user.name + '_zodiac' + '` for user ' + user.name + '; got ' + user.profile.zodiac);
      });
    });

  });



  describe('a post request to /pet with option {blueprint: "find"}', function() {

    it('should default to using the Pet model', function(done) {

      httpHelper.testRoute('post', {
        url: 'pet',
        json: true
      }, function(err, response) {
        assert(response.body[0].isPet === true, 'Expected a pet record; got: ' + JSON.stringify(response.body[0]));
        return done();
      });

    });

  });

  describe('a get request to /users, with options {blueprint: "find", model: "user"}', function() {

    var users;
    before(function(done) {
      httpHelper.testRoute('get', {
        url: 'users',
        json: true
      }, function(err, response) {
        if (err) { return done(err); }
        users = response.body;
        return done();
      });
    });

    it('should return an array of 10 users (sails.config.blueprints.defaultLimit)', function() {
      assert(users.length === 10, 'Expected 10 users, got ' + users.length);
    });

    it('...each of which should have an array of 10 pets (sails.config.blueprints.defaultLimit)', function() {
      users.forEach(function(user) {
        assert(user.pets.length === 10, 'Expected 10 pets for user ' + user.name + '; got ' + user.pets.length);
      });
    });

    it('...and a user profile.', function() {
      users.forEach(function(user) {
        assert(user.profile.zodiac === (user.name + '_zodiac'), 'Expected profile zodiac `' + user.name + '_zodiac' + '` for user ' + user.name + '; got ' + user.profile.zodiac);
      });
    });

  });

  describe('a get request to /users2, with options {blueprint: "find", model: "user", limit: 5}', function() {

    var users;
    before(function(done) {
      httpHelper.testRoute('get', {
        url: 'users2',
        json: true
      }, function(err, response) {
        if (err) { return done(err); }
        users = response.body;
        return done();
      });
    });

    it('should return an array of 5 users', function() {
      assert(users.length === 5, 'Expected 5 users, got ' + users.length);
    });

    it('...each of which should have an array of 5 pets', function() {
      users.forEach(function(user) {
        assert(user.pets.length === 5, 'Expected 5 pets for user ' + user.name + '; got ' + user.pets.length);
      });
    });

    it('...and a user profile.', function() {
      users.forEach(function(user) {
        assert(user.profile.zodiac === (user.name + '_zodiac'), 'Expected profile zodiac `' + user.name + '_zodiac' + '` for user ' + user.name + '; got ' + user.profile.zodiac);
      });
    });

  });

  describe('a get request to /users3, with options {blueprint: "find", model: "user", limit: 5, populate_limit: 3}', function() {

    var users;
    before(function(done) {
      httpHelper.testRoute('get', {
        url: 'users3',
        json: true
      }, function(err, response) {
        if (err) { return done(err); }
        users = response.body;
        return done();
      });
    });

    it('should return an array of 5 users', function() {
      assert(users.length === 5, 'Expected 5 users, got ' + users.length);
    });

    it('...each of which should have an array of 3 pets', function() {
      users.forEach(function(user) {
        assert(user.pets.length === 3, 'Expected 3 pets for user ' + user.name + '; got ' + user.pets.length);
      });
    });

    it('...and a user profile.', function() {
      users.forEach(function(user) {
        assert(user.profile.zodiac === (user.name + '_zodiac'), 'Expected profile zodiac `' + user.name + '_zodiac' + '` for user ' + user.name + '; got ' + user.profile.zodiac);
      });
    });

  });

  describe('a get request to /users4, with options {blueprint: "find", model: "user", limit: 5, populate_pets_limit: 3}', function() {

    var users;
    before(function(done) {
      httpHelper.testRoute('get', {
        url: 'users4',
        json: true
      }, function(err, response) {
        if (err) { return done(err); }
        users = response.body;
        return done();
      });
    });

    it('should return an array of 5 users', function() {
      assert(users.length === 5, 'Expected 5 users, got ' + users.length);
    });

    it('...each of which should have an array of 3 pets', function() {
      users.forEach(function(user) {
        assert(user.pets.length === 3, 'Expected 3 pets for user ' + user.name + '; got ' + user.pets.length);
      });
    });

    it('...and a user profile.', function() {
      users.forEach(function(user) {
        assert(user.profile.zodiac === (user.name + '_zodiac'), 'Expected profile zodiac `' + user.name + '_zodiac' + '` for user ' + user.name + '; got ' + user.profile.zodiac);
      });
    });

  });

  describe('a get request to /users4', function() {
    var url = 'users4';
    var method = 'get';

    describe('with query param populate=[]', function() {
      var users;
      before(function(done) {
        httpHelper.testRoute(method, {
          url: url,
          qs: {populate: '[]'},
          json: true
        }, function(err, response) {
          if (err) { return done(err); }
          users = response.body;
          return done();
        });
      });

      it('should return an array of 5 users', function() {
        assert(users.length === 5, 'Expected 5 users, got ' + users.length);
      });
      it('...each of which should have no pets', function() {
        users.forEach(function(user) {
          assert(!user.hasOwnProperty('pets'), 'Expected pets not to be populated for user ' + user.name + '; got ' + JSON.stringify(user.pets));
        });
      });
      it('...and have only a profile ID', function() {
        users.forEach(function(user) {
          assert(typeof user.profile === 'number', 'Expected profile not to be populated for user `' + user.name + '`; got ' + JSON.stringify(user.profile));
        });
      });
    });

    describe('with query param populate=[pets]', function() {
      var users;
      before(function(done) {
        httpHelper.testRoute(method, {
          url: url,
          qs: {populate: '[pets]'},
          json: true
        }, function(err, response) {
          if (err) { return done(err); }
          users = response.body;
          return done();
        });
      });

      it('should return an array of 5 users', function() {
        assert(users.length === 5, 'Expected 5 users, got ' + users.length);
      });
      it('...each of which should have an array of 3 pets', function() {
        users.forEach(function(user) {
          assert(user.pets.length === 3, 'Expected 3 pets for user ' + user.name + '; got ' + user.pets.length);
        });
      });
      it('...and have only a profile ID', function() {
        users.forEach(function(user) {
          assert(typeof user.profile === 'number', 'Expected profile not to be populated for user `' + user.name + '`; got ' + JSON.stringify(user.profile));
        });
      });
    });
    describe('with query param populate=[pets,profile]', function() {
      var users;
      before(function(done) {
        httpHelper.testRoute(method, {
          url: url,
          qs: {populate: '[pets,profile]'},
          json: true
        }, function(err, response) {
          if (err) { return done(err); }
          users = response.body;
          return done();
        });
      });

      it('should return an array of 5 users', function() {
        assert(users.length === 5, 'Expected 5 users, got ' + users.length);
      });
      it('...each of which should have an array of 3 pets', function() {
        users.forEach(function(user) {
          assert(user.pets.length === 3, 'Expected 3 pets for user ' + user.name + '; got ' + user.pets.length);
        });
      });
      it('...and a user profile.', function() {
        users.forEach(function(user) {
          assert(user.profile.zodiac === (user.name + '_zodiac'), 'Expected profile zodiac `' + user.name + '_zodiac' + '` for user ' + user.name + '; got ' + user.profile.zodiac);
        });
      });
    });
    describe('with query param populate=pets', function() {
      var users;
      before(function(done) {
        httpHelper.testRoute(method, {
          url: url,
          qs: {populate: 'pets'},
          json: true
        }, function(err, response) {
          if (err) { return done(err); }
          users = response.body;
          return done();
        });
      });

      it('should return an array of 5 users', function() {
        assert(users.length === 5, 'Expected 5 users, got ' + users.length);
      });
      it('...each of which should have an array of 3 pets', function() {
        users.forEach(function(user) {
          assert(user.pets.length === 3, 'Expected 3 pets for user ' + user.name + '; got ' + user.pets.length);
        });
      });
      it('...and have only a profile ID', function() {
        users.forEach(function(user) {
          assert(typeof user.profile === 'number', 'Expected profile not to be populated for user `' + user.name + '`; got ' + JSON.stringify(user.profile));
        });
      });
    });

    describe('with query param populate=pets,profile', function() {
      var users;
      before(function(done) {
        httpHelper.testRoute(method, {
          url: url,
          qs: {populate: 'pets,profile'},
          json: true
        }, function(err, response) {
          if (err) { return done(err); }
          users = response.body;
          return done();
        });
      });

      it('should return an array of 5 users', function() {
        assert(users.length === 5, 'Expected 5 users, got ' + users.length);
      });
      it('...each of which should have an array of 3 pets', function() {
        users.forEach(function(user) {
          assert(user.pets.length === 3, 'Expected 3 pets for user ' + user.name + '; got ' + user.pets.length);
        });
      });
      it('...and a user profile.', function() {
        users.forEach(function(user) {
          assert(user.profile.zodiac === (user.name + '_zodiac'), 'Expected profile zodiac `' + user.name + '_zodiac' + '` for user ' + user.name + '; got ' + user.profile.zodiac);
        });
      });
    });
  });

  describe('a get request to /users5, with options {blueprint: "find", model: "user", associations: ["profile"]}', function() {

    var users;
    before(function(done) {
      httpHelper.testRoute('get', {
        url: 'users5',
        json: true
      }, function(err, response) {
        if (err) { return done(err); }
        users = response.body;
        return done();
      });
    });

    it('should return an array of 10 users', function() {
      assert(users.length === 10, 'Expected 10 users, got ' + users.length);
    });

    it('...each of which should have no pets', function() {
      users.forEach(function(user) {
        assert(!user.pets, 'Expected no pets for user ' + user.name + '; got ' + JSON.stringify(user.pets));
      });
    });

    it('...and a user profile.', function() {
      users.forEach(function(user) {
        assert(user.profile.zodiac === (user.name + '_zodiac'), 'Expected profile zodiac `' + user.name + '_zodiac' + '` for user ' + user.name + '; got ' + user.profile.zodiac);
      });
    });

  });

  describe('a get request to /users6, with options {blueprint: "find", model: "user", associations: ["pets"]}', function() {

    var users;
    before(function(done) {
      httpHelper.testRoute('get', {
        url: 'users6',
        json: true
      }, function(err, response) {
        if (err) { return done(err); }
        users = response.body;
        return done();
      });
    });

    it('should return an array of 10 users', function() {
      assert(users.length === 10, 'Expected 10 users, got ' + users.length);
    });

    it('...each of which should have 10 pets', function() {
      users.forEach(function(user) {
        assert(user.pets.length === 10, 'Expected 10 pets for user ' + user.name + '; got ' + user.pets.length);
      });
    });

    it('...and just an ID for the user profile.', function() {
      users.forEach(function(user) {
        assert(_.isFinite(user.profile), 'Expected an ID for "profile" attribute of user ' + user.name + '; got ' + JSON.stringify(user.profile));
      });
    });

  });

  describe('a put request to /user/1 should return the updated user with profile and pets populated', function() {

    var users;
    before(function(done) {
      httpHelper.testRoute('put', {
        url: 'user/1',
        json: true,
        body: {
          name: 'bart'
        }
      }, function(err, response) {
        if (err) { return done(err); }
        user = response.body;
        return done();
      });
    });

    it('should return a single user with the updated name', function() {
      assert(user);
      assert.equal(user.name, 'bart');
    });

    it('...which should have 10 populated pets', function() {
      assert(user.pets.length === 10, 'Expected 10 pets for user ' + user.name + '; got ' + user.pets.length);
    });

    it('...and a populated user profile.', function() {
      assert(_.isObject(user.profile), 'Expected an object for "profile" attribute of user ' + user.name + '; got ' + JSON.stringify(user.profile));
    });

  });

  describe('a put request to /user/1 with `populate=false` should return the updated user with just a profile ID and no `pets` property', function() {

    var users;
    before(function(done) {
      httpHelper.testRoute('put', {
        url: 'user/1',
        json: true,
        body: {
          name: 'ron'
        },
        qs: {populate: 'false'},
      }, function(err, response) {
        if (err) { return done(err); }
        user = response.body;
        return done();
      });
    });

    it('should return a single user with the updated name', function() {
      assert(user);
      assert.equal(user.name, 'ron');
    });

    it('...which should have no pets property', function() {
      assert(!user.pets);
    });

    it('...and just a profile ID.', function() {
      assert(
        _.isFinite(user.profile),
        'Expected an ID for `profile` attribute of user ' + user.name + '; got ' + user.profile);
    });

  });

});//</describe (router :: Blueprint option routes)>
