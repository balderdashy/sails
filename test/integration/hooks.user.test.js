/**
 * Test dependencies
 */
var assert = require('assert');
var httpHelper = require('./helpers/httpHelper.js');
var appHelper = require('./helpers/appHelper');
var util = require('util');
var path = require('path');
var fs = require('fs-extra');
var _  = require('@sailshq/lodash');

describe('hooks :: ', function() {

  var sailsprocess;

  describe('defining a user hook', function() {
    var appName = 'testApp';

    before(function() {
      appHelper.teardown();
    });

    describe('in api/hooks/shout', function(){

      before(function(done) {
        fs.mkdirs(path.resolve(__dirname, '../..', appName, 'api/hooks'), function(err) {
          if (err) {return done(err);}
          fs.copySync(path.resolve(__dirname, 'fixtures/hooks/installable/shout/index.js'), path.resolve(__dirname,'../../testApp/api/hooks/shout/index.js'));
          process.chdir(path.resolve(__dirname, '../..', appName));
          done();
        });
      });

      after(function() {
        process.chdir('../');
        // Sleep for 500ms--otherwise we get timing errors for this test on Windows
        setTimeout(function() {
          appHelper.teardown();
        }, 500);
      });

      describe('with default settings', function() {

        var sails;

        before(function(done) {
          appHelper.liftQuiet({hooks: {pubsub: false}}, function(err, _sails) {
            if (err) {return done(err);}
            sails = _sails;
            return done();
          });
        });

        after(function(done) {
          sails.lower(function(){setTimeout(done, 100);});
        });

        it('should install a hook into `sails.hooks.shout`', function() {

          assert(sails.hooks.shout);

        });

        it('should use merge the default hook config', function() {

          assert(sails.config.shout.phrase === 'make it rain', sails.config.shout.phrase);

        });

        it('should bind a /shout route that responds with the default phrase', function(done) {
          httpHelper.testRoute('GET', 'shout', function(err, resp, body) {
            assert(body === 'make it rain');
            return done();
          });
        });

      });

      describe('with hooks.shout set to boolean false', function() {

        var sails;

        before(function(done) {
          appHelper.liftQuiet({hooks: {shout: false, pubsub: false}}, function(err, _sails) {
            if (err) {return done(err);}
            sails = _sails;
            return done();
          });
        });

        after(function(done) {
          sails.lower(function(){setTimeout(done, 100);});
        });

        it('should not install a hook into `sails.hooks.shout`', function() {

          assert(_.isUndefined(sails.hooks.shout));

        });

      });


      describe('with hooks.shout set to the string "false"', function() {

        var sails;

        before(function(done) {
          appHelper.liftQuiet({hooks: {shout: 'false', pubsub: false}}, function(err, _sails) {
            if (err) {return done(err);}
            sails = _sails;
            return done();
          });
        });

        after(function(done) {
          sails.lower(function(){setTimeout(done, 100);});
        });

        it('should not install a hook into `sails.hooks.shout`', function() {

          assert(_.isUndefined(sails.hooks.shout));

        });

      });

      describe('with hook-level config options', function() {

        var sails;

        before(function(done) {
          appHelper.liftQuiet({shout: {phrase: 'yolo'}, hooks:{pubsub: false}}, function(err, _sails) {
            if (err) {return done(err);}
            sails = _sails;
            return done();
          });
        });

        after(function(done) {
          sails.lower(function(){setTimeout(done, 100);});
        });

        it('should bind a /shout route that responds with the configured phrase', function(done) {
          httpHelper.testRoute('GET', 'shout', function(err, resp, body) {
            assert(body === 'yolo');
            return done();
          });
        });

      });

    });

    if (Number(process.version.match(/^v(\d+\.\d+)/)[1]) >= 7.6) {

      describe('with an asynchronous initialize function', function() {

        before(function(done) {
          fs.mkdirs(path.resolve(__dirname, '../..', appName, 'api/hooks'), function(err) {
            if (err) {return done(err);}
            fs.copySync(path.resolve(__dirname, 'fixtures/hooks/installable/async/index.js.txt'), path.resolve(__dirname,'../../testApp/api/hooks/async/index.js'));
            process.chdir(path.resolve(__dirname, '../..', appName));
            done();
          });
        });

        after(function(done) {
          process.chdir('../');
          // Sleep for 500ms--otherwise we get timing errors for this test on Windows
          setTimeout(function() {
            appHelper.teardown();
            return done();
          }, 500);
        });

        describe('that runs succesfully', function() {

          var sails;

          before(function(done) {
            appHelper.liftQuiet({hooks: {pubsub: false}}, function(err, _sails) {
              if (err) {return done(err);}
              sails = _sails;
              return done();
            });
          });

          after(function(done) {
            sails.lower(done, 100);
          });

          it('should run the initialize function successfully', function() {

            assert.equal(sails.hooks.async.val, 'foo');

          });

        });

        describe('that has an error', function() {

          var sails;

          after(function(done) {
            if (!sails) { return done(); }
            sails.lower(function(){setTimeout(function() {
              process.chdir('../');
              // Sleep for 500ms--otherwise we get timing errors for this test on Windows
              setTimeout(function() {
                appHelper.teardown();
                return done();
              }, 500);
            }, 100);});
          });

          it('should handle the error gracefully', function(done) {

            appHelper.liftQuiet({hooks: {pubsub: false}, custom: {reject: true}}, function(err, _sails) {
              if (err) {
                assert.equal(err, 'foo');
                return done();
              }
              sails = _sails;
              return done(new Error('Should have failed to lift!'));
            });

          });

        });

      });

    }


  });



});
