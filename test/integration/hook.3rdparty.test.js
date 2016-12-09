/**
 * Test dependencies
 */
var assert = require('assert');
var httpHelper = require('./helpers/httpHelper.js');
var appHelper = require('./helpers/appHelper');
var util = require('util');
var path = require('path');
var fs = require('fs-extra');
var _ = require('@sailshq/lodash');

describe('hooks :: ', function() {

  var sailsprocess;

  describe('installing a 3rd-party hook', function() {
    var appName = 'testApp';

    // Before each test, remove the test app's package.json from the require cache,
    // so that we can change its dependencies on a per-test basis.
    beforeEach(function() {
      delete require.cache[path.resolve(__dirname, '../..', appName, 'package.json')];
    });

    before(function() {
      appHelper.teardown();
    });

    describe('into node_modules/sails-hook-shout', function(){

      before(function(done) {
        // Add `sails-hook-shout` as a dependency of the test app.
        fs.outputFileSync(path.resolve(__dirname, '../..', appName, 'package.json'), '{"dependencies":{"sails-hook-shout":"0.0.0"}}');
          // Copy the hook into the test app's node_modules folder.
        fs.mkdirs(path.resolve(__dirname, '../..', appName, 'node_modules'), function(err) {
          if (err) {return done(err);}
          fs.copySync(path.resolve(__dirname, 'fixtures/hooks/installable/shout'), path.resolve(__dirname,'../../testApp/node_modules/sails-hook-shout'));
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
          appHelper.liftQuiet(function(err, _sails) {
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

          assert.equal(sails.config.shout.phrase, 'make it rain');

        });

        it('should bind a /shout route that responds with the default phrase', function(done) {
          httpHelper.testRoute('GET', 'shout', function(err, resp, body) {
            assert.equal(body, 'make it rain');
            return done();
          });
        });

      });

      describe('with hooks.shout set to boolean false', function() {

        var sails;

        before(function(done) {
          appHelper.liftQuiet({hooks: {shout: false}}, function(err, _sails) {
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


      describe('with hooks.shout set to the string `false`', function() {

        var sails;

        before(function(done) {
          appHelper.liftQuiet({hooks: {shout: 'false'}}, function(err, _sails) {
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
          appHelper.liftQuiet({shout: {phrase: 'yolo'}}, function(err, _sails) {
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
          sails.lower(function(){setTimeout(done, 100);});
        });


        it('should bind a /shout route that responds with the configured phrase', function(done) {
          httpHelper.testRoute('GET', 'shout', function(err, resp, body) {
            assert(body === 'holla back!');
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
            sails.lower(function(){setTimeout(done, 100);});
          });

          it('should install a hook into `sails.hooks.foobar`', function() {

            assert(sails.hooks.foobar);

          });

          it('should use merge the default hook config', function() {

            assert(sails.config.foobar.phrase === 'make it rain', sails.config.foobar.phrase);

          });

          it('should bind a /shout route that responds with the default phrase', function(done) {
            httpHelper.testRoute('GET', 'shout', function(err, resp, body) {
              assert(body === 'make it rain');
              return done();
            });
          });

      });

      describe('setting the hook name to `security` (an existing hook)', function(){

          var sails;
          before(function(done) {
            appHelper.liftQuiet({installedHooks: {'sails-hook-shout': {name: 'security'}}}, function(err, _sails) {
              sails = _sails;
              done(err);
            });
          });

          after(function(done) {
            sails.lower(function(){setTimeout(done, 100);});
          });

          it('should replace the core `security` hook', function() {
            assert(sails.hooks.security.isShoutyHook);
          });

      });


    });

    describe('into node_modules/shouty', function(){

      before(function(done) {
        // Add `shouty` as a dependency of the test app.
        fs.outputFileSync(path.resolve(__dirname, '../..', appName, 'package.json'), '{"dependencies":{"shouty":"0.0.0"}}');
        fs.mkdirs(path.resolve(__dirname, '../..', appName, 'node_modules'), function(err) {
          if (err) {return done(err);}
          fs.copySync(path.resolve(__dirname, 'fixtures/hooks/installable/shout'), path.resolve(__dirname,'../../testApp/node_modules/shouty'));
          var packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../testApp/node_modules/shouty','package.json')));
          packageJson.name = 'shouty';
          fs.writeFileSync(path.resolve(__dirname,'../../testApp/node_modules/shouty','package.json'), JSON.stringify(packageJson));
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
          sails.lower(function(){setTimeout(done, 100);});
        });


        it('should install a hook into `sails.hooks.shouty`', function() {
          assert(sails.hooks.shouty);

        });

        it('should use merge the default hook config', function() {

          assert(sails.config.shouty.phrase === 'make it rain', sails.config.shouty.phrase);

        });

        it('should bind a /shout route that responds with the default phrase', function(done) {
          httpHelper.testRoute('GET', 'shout', function(err, resp, body) {
            assert(body === 'make it rain');
            return done();
          });
        });

      });

      describe('with `hookName` set to `security` in the package.json', function() {
        var sails;
        before(function(done) {
          delete require.cache[path.resolve(__dirname,'../../testApp/node_modules/shouty','package.json')];
          var packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../testApp/node_modules/shouty','package.json')));
          packageJson.sails.hookName = 'security';
          fs.writeFileSync(path.resolve(__dirname,'../../testApp/node_modules/shouty','package.json'), JSON.stringify(packageJson));
          appHelper.liftQuiet(function(err, _sails) {
            if (err) {return done(err);}
            sails = _sails;
            return done();
          });
        });

        after(function(done) {
          sails.lower(function(){setTimeout(done, 100);});
        });

        it('should replace the core `security` hook', function() {
          assert(sails.hooks.security.isShoutyHook);
        });
      });

    });

    describe('into node_modules/sails-hook-security', function(){

      var sails;
      before(function(done) {
        // Add `sails-hook-security` as a dependency of the test app.
        fs.outputFileSync(path.resolve(__dirname, '../..', appName, 'package.json'), '{"dependencies":{"sails-hook-security":"0.0.0"}}');
        fs.mkdirs(path.resolve(__dirname, '../..', appName, 'node_modules'), function(err) {
          if (err) {return done(err);}
          fs.copySync(path.resolve(__dirname, 'fixtures/hooks/installable/shout'), path.resolve(__dirname,'../../testApp/node_modules/sails-hook-security'));
          var packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../testApp/node_modules/sails-hook-security','package.json')));
          packageJson.name = 'sails-hook-security';
          fs.writeFileSync(path.resolve(__dirname,'../../testApp/node_modules/sails-hook-security','package.json'), JSON.stringify(packageJson));
          process.chdir(path.resolve(__dirname, '../..', appName));
          appHelper.liftQuiet(function(err, _sails) {
            if (err) {return done(err);}
            sails = _sails;
            return done();
          });
        });
      });

      after(function(done) {
        sails.lower(function(err) {
          process.chdir('../');
          appHelper.teardown();
          return done(err);
        });
      });

      it('should replace the core `security` hook', function() {
        assert(sails.hooks.security.isShoutyHook);
      });

    });


    describe('into node_modules/security', function(){

      var sails;
      before(function(done) {
        // Add `security` as a dependency of the test app.
        fs.outputFileSync(path.resolve(__dirname, '../..', appName, 'package.json'), '{"dependencies":{"security":"0.0.0"}}');
        fs.mkdirs(path.resolve(__dirname, '../..', appName, 'node_modules'), function(err) {
          if (err) {return done(err);}
          fs.copySync(path.resolve(__dirname, 'fixtures/hooks/installable/shout'), path.resolve(__dirname,'../../testApp/node_modules/security'));
          var packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../testApp/node_modules/security','package.json')));
          packageJson.name = 'security';
          fs.writeFileSync(path.resolve(__dirname,'../../testApp/node_modules/security','package.json'), JSON.stringify(packageJson));
          process.chdir(path.resolve(__dirname, '../..', appName));
          appHelper.liftQuiet(function(err, _sails) {
            if (err) {return done(err);}
            sails = _sails;
            return done();
          });
        });
      });

      after(function(done) {
        sails.lower(function(err) {
          process.chdir('../');
          appHelper.teardown();
          return done(err);
        });
      });

      it('should replace the core `security` hook', function() {
        assert(sails.hooks.security.isShoutyHook);
      });

    });

    describe('into node_modules/@my-modules/shouty', function(){

      describe('with default settings', function() {

        var sails;
        before(function(done) {
          // Add `@my-modules/shouty` as a dependency of the test app.
          fs.outputFileSync(path.resolve(__dirname, '../..', appName, 'package.json'), '{"dependencies":{"@my-modules/shouty":"0.0.0"}}');
          fs.mkdirs(path.resolve(__dirname, '../..', appName, 'node_modules', '@my-modules'), function(err) {
            if (err) {return done(err);}
            fs.copySync(path.resolve(__dirname, 'fixtures/hooks/installable/shout'), path.resolve(__dirname,'../../testApp/node_modules/@my-modules/shouty'));
            var packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../testApp/node_modules/@my-modules/shouty','package.json')));
            packageJson.name = '@my-modules/shouty';
            fs.writeFileSync(path.resolve(__dirname,'../../testApp/node_modules/@my-modules/shouty','package.json'), JSON.stringify(packageJson));
            process.chdir(path.resolve(__dirname, '../..', appName));
            appHelper.liftQuiet(function(err, _sails) {
              if (err) {return done(err);}
              sails = _sails;
              return done();
            });
          });
        });

        after(function(done) {
          sails.lower(function(err) {
            process.chdir('../');
            appHelper.teardown();
            return done(err);
          });
        });

        it('should install a hook into `sails.hooks.shouty`', function() {
          assert(sails.hooks.shouty);
        });

      });

      describe('with `hookName` set to `security` in the package.json', function() {

        var sails;
        before(function(done) {
          fs.outputFileSync(path.resolve(__dirname, '../..', appName, 'package.json'), '{"dependencies":{"@my-modules/shouty":"0.0.0"}}');
          delete require.cache[path.resolve(__dirname,'../../testApp/node_modules/@my-modules/shouty')];
          delete require.cache[path.resolve(__dirname,'../../testApp/node_modules/@my-modules/shouty','package.json')];
          fs.mkdirs(path.resolve(__dirname, '../..', appName, 'node_modules', '@my-modules'), function(err) {
            if (err) {return done(err);}
            fs.copySync(path.resolve(__dirname, 'fixtures/hooks/installable/shout'), path.resolve(__dirname,'../../testApp/node_modules/@my-modules/shouty'));
            var packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../testApp/node_modules/@my-modules/shouty','package.json')));
            packageJson.sails.hookName = 'security';
            packageJson.name = '@my-modules/shouty';
            fs.writeFileSync(path.resolve(__dirname,'../../testApp/node_modules/@my-modules/shouty','package.json'), JSON.stringify(packageJson));
            process.chdir(path.resolve(__dirname, '../..', appName));
            appHelper.liftQuiet(function(err, _sails) {
              if (err) {return done(err);}
              sails = _sails;
              return done();
            });
          });
        });

        after(function(done) {
          sails.lower(function(err) {
            process.chdir('../');
            appHelper.teardown();
            return done(err);
          });
        });

        it('should replace the core `security` hook', function() {
          assert(sails.hooks.security.isShoutyHook);
        });

      });

    });

    describe('into node_modules/@my-modules/sails-hook-security', function(){

      var sails;
      before(function(done) {
        // Add `@my-modules/sails-hook-security` as a dependency of the test app.
        fs.outputFileSync(path.resolve(__dirname, '../..', appName, 'package.json'), '{"dependencies":{"sails-hook-shout":"0.0.0"}}');
        fs.mkdirs(path.resolve(__dirname, '../..', appName, 'node_modules', '@my-modules'), function(err) {
          if (err) {return done(err);}
          fs.copySync(path.resolve(__dirname, 'fixtures/hooks/installable/shout'), path.resolve(__dirname,'../../testApp/node_modules/@my-modules/sails-hook-security'));
          var packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../testApp/node_modules/@my-modules/sails-hook-security','package.json')));
          fs.writeFileSync(path.resolve(__dirname,'../../testApp/node_modules/@my-modules/sails-hook-security','package.json'), JSON.stringify(packageJson));
          process.chdir(path.resolve(__dirname, '../..', appName));
          appHelper.liftQuiet(function(err, _sails) {
            if (err) {return done(err);}
            sails = _sails;
            return done();
          });
        });
      });

      after(function(done) {
        sails.lower(function(err) {
          process.chdir('../');
          appHelper.teardown();
          return done(err);
        });
      });

      it('should replace the core `security` hook', function() {
        assert(sails.hooks.security.isShoutyHook);
      });

    });

    describe('into node_modules/@my-modules/sails-hook-security, with no corresponding package.json entry', function(){

      var sails;
      before(function(done) {
        fs.mkdirs(path.resolve(__dirname, '../..', appName, 'node_modules', '@my-modules'), function(err) {
          if (err) {return done(err);}
          fs.copySync(path.resolve(__dirname, 'fixtures/hooks/installable/shout'), path.resolve(__dirname,'../../testApp/node_modules/@my-modules/sails-hook-security'));
          var packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../testApp/node_modules/@my-modules/sails-hook-security','package.json')));
          fs.writeFileSync(path.resolve(__dirname,'../../testApp/node_modules/@my-modules/sails-hook-security','package.json'), JSON.stringify(packageJson));
          process.chdir(path.resolve(__dirname, '../..', appName));
          appHelper.liftQuiet(function(err, _sails) {
            if (err) {return done(err);}
            sails = _sails;
            return done();
          });
        });
      });

      after(function(done) {
        sails.lower(function(err) {
          process.chdir('../');
          appHelper.teardown();
          return done(err);
        });
      });

      it('should NOT replace the core `security` hook', function() {
        assert(!sails.hooks.security.isShoutyHook);
      });

    });

    describe('with an invalid package.json file', function(){

      var sails;
      before(function(done) {
        delete require.cache[path.resolve(__dirname,'../../testApp/node_modules/@my-modules/sails-hook-security/package.json')];
        fs.mkdirs(path.resolve(__dirname, '../..', appName, 'node_modules', '@my-modules'), function(err) {
          if (err) {return done(err);}
          fs.copySync(path.resolve(__dirname, 'fixtures/hooks/installable/shout'), path.resolve(__dirname,'../../testApp/node_modules/@my-modules/sails-hook-security'));
          fs.outputFileSync(path.resolve(__dirname,'../../testApp/node_modules/@my-modules/sails-hook-security/package.json'), '{"foo":<%=bar%>}');
          process.chdir(path.resolve(__dirname, '../..', appName));
          return done();
        });
      });

      after(function(done) {
        sails ? sails.lower(function(err) {
          process.chdir('../');
          appHelper.teardown();
          return done(err);
        }): done();
      });

      it('should lift without crashing', function(done) {
        appHelper.liftQuiet(function(err, _sails) {
          if (err) {return done(err);}
          sails = _sails;
          assert(!sails.hooks.security.isShoutyHook);
          return done();
        });
      });

    });

  });



});
