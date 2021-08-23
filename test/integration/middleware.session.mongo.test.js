var Sails = require('../../lib').Sails;
var assert = require('assert');
var tmp = require('tmp');
var path = require('path');
var fs = require('fs-extra');

describe('middleware :: ', function () {

  describe('session :: ', function () {

    describe('with mongo v2.0.3 adapter ::', function () {

      var curDir, tmpDir;
      var app = Sails();

      before(function () {
        // Cache the current working directory.
        curDir = process.cwd();
        // Create a temp directory.
        tmpDir = tmp.dirSync({gracefulCleanup: true, unsafeCleanup: true});
        // Switch to the temp directory.
        process.chdir(tmpDir.name);
        // Ensure a symlink to the connect-mongo v2.0.3 adapter.
        fs.ensureSymlinkSync(path.resolve(__dirname, '..', '..', 'node_modules', 'connect-mongo'), path.resolve(tmpDir.name, 'node_modules', 'connect-mongo'));
      });

      after(function () {
        process.chdir(curDir);
        app.lower();
      });

      it('sails can lift', function (done) {
        app.lift({
          environment: 'development',
          log: {level: 'silent'},
          session: {
            adapter: 'mongo',
            url: 'mongodb://mongodb:27017/sessions', // user, password and port optional
          },
        }, function (err) {
          console.log(err);
          assert.equal(err, undefined);
          return done();
        });
      });

    });

    describe('with mongo v4.5.0 adapter ::', function () {

      var curDir, tmpDir;
      var app = Sails();

      before(function () {
        // Cache the current working directory.
        curDir = process.cwd();
        // Create a temp directory.
        tmpDir = tmp.dirSync({gracefulCleanup: true, unsafeCleanup: true});
        // Switch to the temp directory.
        process.chdir(tmpDir.name);
        // Ensure a symlink to the connect-mongo v4.5.0 adapter.
        fs.ensureSymlinkSync(path.resolve(__dirname, '..', '..', 'node_modules', 'connect-mongo-latest'), path.resolve(tmpDir.name, 'node_modules', 'connect-mongo'));
      });

      after(function () {
        process.chdir(curDir);
        app.lower();
      });

      it('sails can lift', function (done) {
        app.lift({
          environment: 'development',
          log: {level: 'silent'},
          session: {
            // secret: 'abc123',
            adapter: 'mongo',
            mongoUrl: 'mongodb://mongodb:27017/sessions', // user, password and port optional
          },
        }, function (err) {
          assert.equal(err, undefined);
          return done();
        });
      });

    });

  });

});
