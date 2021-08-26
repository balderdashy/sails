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

      it('can initialise connect-mongo - expects connection strategy error', function (done) {
        app.lift({
          environment: 'development',
          log: {level: 'silent'},
          session: {
            adapter: 'mongo',
            url: '', // leave blank since only startup is being tested
          },
        }, function (err) {
          assert.equal(err.message.includes('Connection strategy not found'), true);
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

      it('can initialise connect-mongo - ', function (done) {
        app.lift({
          environment: 'development',
          log: {level: 'silent'},
          session: {
            // secret: 'abc123',
            adapter: 'mongo',
            mongoUrl: 'url', // leave blank since only start up needs to be tested
          },
        }, function (err) {
          assert.equal(err, undefined);
          return done();
        });
      });

    });

  });

});
