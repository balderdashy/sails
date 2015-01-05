/**
 * Test dependencies
 */
var assert = require('assert');
var httpHelper = require('./helpers/httpHelper.js');
var appHelper = require('./helpers/appHelper');
var util = require('util');
var wrench = require('wrench');
var path = require('path');
var fs = require('fs-extra');

describe('hooks :: ', function() {

  var sailsprocess;

  describe('installing a 3rd-party hook', function() {
    var appName = 'testApp';

    before(function() {
      appHelper.teardown();
    });

    describe('into node_modules/sails-hook-shout', function(){

      before(function(done) {
        this.timeout(5000);
        fs.mkdirs(path.resolve(__dirname, "../..", appName, "node_modules"), function(err) {
          if (err) {return done(err);}
          wrench.copyDirSyncRecursive(path.resolve(__dirname, 'fixtures/hooks/installable/shout'), path.resolve(__dirname,'../../testApp/node_modules/sails-hook-shout'));
          process.chdir(path.resolve(__dirname, "../..", appName));
          done();
        });
      });

      after(function() {
        process.chdir('../');
        appHelper.teardown();
      });

      describe('with default settings', function() {

        var sails;

        before(function(done) {
          appHelper.liftQuiet(function(err, _sails) {
            if (err) {return done(err);}
            sails = _sails;
            return done();
          });
        });

        after(function(done) {
          sails.lower(done);
        });

        it('should install a hook into `sails.hooks.shout`', function() {

          assert(sails.hooks.shout);

        });

        it('should use merge the default hook config', function() {

          assert(sails.config.shout.phrase == 'make it rain', sails.config.shout.phrase);

        });

        it('should bind a /shout route that responds with the default phrase', function(done) {
          httpHelper.testRoute('GET', "shout", function(err, resp, body) {
            assert(body == 'make it rain');
            return done();
          });
        });

      });

      describe('with hook-level config options', function() {

        var sails;

        before(function(done) {
          appHelper.liftQuiet({shout: {phrase: "yolo"}}, function(err, _sails) {
            if (err) {return done(err);}
            sails = _sails;
            return done();
          });
        });

        after(function(done) {
          sails.lower(done);
        });

        it('should bind a /shout route that responds with the configured phrase', function(done) {
          httpHelper.testRoute('GET', "shout", function(err, resp, body) {
            assert(body == 'yolo');
            return done();
          });
        });

      });

      describe('setting the config key to `shoutHook`', function() {

        var sails;

        before(function(done) {
          appHelper.liftQuiet({installedHooks: {'sails-hook-shout': {configKey: 'shoutHook'}}, shoutHook: {phrase: 'holla back!'}}, function(err, _sails) {
            if (err) {return done(err);}
            sails = _sails;
            return done();
          });
        });

        after(function(done) {
          sails.lower(done);
        });


        it('should bind a /shout route that responds with the configured phrase', function(done) {
          httpHelper.testRoute('GET', "shout", function(err, resp, body) {
            assert(body == 'holla back!');
            return done();
          });
        });

      });

      describe('setting the hook name to `foobar`', function(){

          var sails;

          before(function(done) {
            appHelper.liftQuiet({installedHooks: {'sails-hook-shout': {name: 'foobar'}}}, function(err, _sails) {
              if (err) {return done(err);}
              sails = _sails;
              return done();
            });
          });

          after(function(done) {
            sails.lower(done);
          });

          it('should install a hook into `sails.hooks.foobar`', function() {

            assert(sails.hooks.foobar);

          });

          it('should use merge the default hook config', function() {

            assert(sails.config.foobar.phrase == 'make it rain', sails.config.foobar.phrase);

          });

          it('should bind a /shout route that responds with the default phrase', function(done) {
            httpHelper.testRoute('GET', "shout", function(err, resp, body) {
              assert(body == 'make it rain');
              return done();
            });
          });

      });

      xdescribe('setting the hook name to `views` (an existing hook)', function(){

          it ('should throw an error', function(done) {
            appHelper.liftQuiet({installedHooks: {'sails-hook-shout': {name: 'views'}}}, function(err, _sails) {
              assert(err && err.code == 'E_INVALID_HOOK_NAME');
              done();
            });
          });

      });


    });

    describe('into node_modules/shouty', function(){

      before(function(done) {
        this.timeout(5000);
        fs.mkdirs(path.resolve(__dirname, "../..", appName, "node_modules"), function(err) {
          if (err) {return done(err);}
          wrench.copyDirSyncRecursive(path.resolve(__dirname, 'fixtures/hooks/installable/shout'), path.resolve(__dirname,'../../testApp/node_modules/shouty'));
          process.chdir(path.resolve(__dirname, "../..", appName));
          done();
        });
      });

      after(function() {
        process.chdir('../');
        appHelper.teardown();
      });

      describe('with default settings', function() {

        var sails;

        before(function(done) {
          appHelper.liftQuiet(function(err, _sails) {
            if (err) {return done(err);}
            sails = _sails;
            return done();
          });
        });

        after(function(done) {
          sails.lower(done);
        });


        it('should install a hook into `sails.hooks.shouty`', function() {
          assert(sails.hooks.shouty);

        });

        it('should use merge the default hook config', function() {

          assert(sails.config.shouty.phrase == 'make it rain', sails.config.shouty.phrase);

        });

        it('should bind a /shout route that responds with the default phrase', function(done) {
          httpHelper.testRoute('GET', "shout", function(err, resp, body) {
            assert(body == 'make it rain');
            return done();
          });
        });

      });

    });

    xdescribe('into node_modules/sails-hook-views', function(){

      before(function(done) {
        this.timeout(5000);
        fs.mkdirs(path.resolve(__dirname, "../..", appName, "node_modules"), function(err) {
          if (err) {return done(err);}
          wrench.copyDirSyncRecursive(path.resolve(__dirname, 'fixtures/hooks/installable/shout'), path.resolve(__dirname,'../../testApp/node_modules/sails-hook-views'));
          process.chdir(path.resolve(__dirname, "../..", appName));
          done();
        });
      });

      after(function() {
        process.chdir('../');
        appHelper.teardown();
      });

      it ('should throw an error', function(done) {
        appHelper.liftQuiet(function(err, _sails) {
          assert(err && err.code == 'E_INVALID_HOOK_NAME');
          done();
        });
      });

    });


    xdescribe('into node_modules/views', function(){

      before(function(done) {
        this.timeout(5000);
        fs.mkdirs(path.resolve(__dirname, "../..", appName, "node_modules"), function(err) {
          if (err) {return done(err);}
          wrench.copyDirSyncRecursive(path.resolve(__dirname, 'fixtures/hooks/installable/shout'), path.resolve(__dirname,'../../testApp/node_modules/views'));
          process.chdir(path.resolve(__dirname, "../..", appName));
          done();
        });
      });

      after(function() {
        process.chdir('../');
        appHelper.teardown();
      });

      it ('should throw an error', function(done) {
        appHelper.liftQuiet(function(err, _sails) {
          assert(err && err.code == 'E_INVALID_HOOK_NAME');
          done();
        });
      });

    });

  });

});
