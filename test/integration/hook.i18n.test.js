/**
 * Test dependencies
 */

var assert = require('assert');
var httpHelper = require('./helpers/httpHelper.js');
var appHelper = require('./helpers/appHelper');
var path = require('path');
var fs = require('fs');




//  ██╗ ██╗ █████╗ ███╗   ██╗    ██╗  ██╗ ██████╗  ██████╗ ██╗  ██╗
//  ██║███║██╔══██╗████╗  ██║    ██║  ██║██╔═══██╗██╔═══██╗██║ ██╔╝
//  ██║╚██║╚█████╔╝██╔██╗ ██║    ███████║██║   ██║██║   ██║█████╔╝
//  ██║ ██║██╔══██╗██║╚██╗██║    ██╔══██║██║   ██║██║   ██║██╔═██╗
//  ██║ ██║╚█████╔╝██║ ╚████║    ██║  ██║╚██████╔╝╚██████╔╝██║  ██╗
//  ╚═╝ ╚═╝ ╚════╝ ╚═╝  ╚═══╝    ╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝
//
//   ██╗ ██████╗ ██╗   ██╗███████╗██████╗  █████╗ ██╗     ██╗     ██╗
//  ██╔╝██╔═══██╗██║   ██║██╔════╝██╔══██╗██╔══██╗██║     ██║     ╚██╗
//  ██║ ██║   ██║██║   ██║█████╗  ██████╔╝███████║██║     ██║      ██║
//  ██║ ██║   ██║╚██╗ ██╔╝██╔══╝  ██╔══██╗██╔══██║██║     ██║      ██║
//  ╚██╗╚██████╔╝ ╚████╔╝ ███████╗██║  ██║██║  ██║███████╗███████╗██╔╝
//   ╚═╝ ╚═════╝   ╚═══╝  ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝
//
describe('i18n ::', function() {

  var appName = 'testApp';

  var sailsApp;
  before(function(done) {
    appHelper.build(done);
  });

  beforeEach(function(done) {
    appHelper.lift({
      log: { level: 'silent' },
      routes: {
        '/test_req_getlocale': function(req, res) {
          res.send(req.getLocale());
        },
        '/test_req_setlocale': function(req, res) {
          req.setLocale('es');
          res.send(req.i18n.__('Welcome'));
        },
        '/test_sails_getlocale': function(req, res) {
          res.send(req._sails.hooks.i18n.getLocale());
        },
        '/test_sails_setlocale': function(req, res) {
          res.send(req._sails.__('Welcome'));
        },

      }
    }, function(err, sails) {
      if (err) {
        return done(err);
      }
      sailsApp = sails;
      return done();
    });
  });

  afterEach(function(done) {
    sailsApp.lower(done);
  });

  after(function() {
    process.chdir('../');
    appHelper.teardown();
  });

  describe('with locales generate by sails-generate-backend', function() {
    it('should say "Welcome" by default', function() {
      assert.equal(sailsApp.__('Welcome'), 'Welcome');
    });

    it('should work using `i18n()` as well as `__()`', function() {
      assert.equal(sailsApp.i18n('Welcome'), 'Welcome');
    });

    it('should say "Welcome" in English', function() {
      sailsApp.hooks.i18n.setLocale('en');
      assert.equal(sailsApp.__('Welcome'), 'Welcome');
    });

    it('should say "Bienvenido" in Spanish', function() {
      sailsApp.hooks.i18n.setLocale('es');
      assert.equal(sailsApp.__('Welcome'), 'Bienvenido');
    });

    it('should support `req.getLocale()` to get the current locale.', function(done) {
      // sailsApp.hooks.i18n.setLocale('es');
      sailsApp.request({url: 'GET /test_req_getlocale', headers: {'Accept-language': 'es'}}, function(err, res, body) {
        if (err) { return done(err); }
        assert.equal(body, 'es');
        return done();
      });
    });

    it('should support `req.setLocale()` to set the current locale.', function(done) {
      sailsApp.request('GET /test_req_setlocale', function(err, res, body) {
        if (err) { return done(err); }
        assert.equal(body, 'Bienvenido');
        return done();
      });
    });

    it('should support `sails.hooks.i18n.getLocale()` to get the current locale.', function(done) {
      sailsApp.hooks.i18n.setLocale('es');
      sailsApp.request('GET /test_sails_getlocale', function(err, res, body) {
        if (err) { return done(err); }
        assert.equal(body, 'es');
        return done();
      });
    });

    it('should support `sails.hooks.i18n.setLocale()` to set the current locale.', function(done) {
      sailsApp.hooks.i18n.setLocale('fr');
      sailsApp.request('GET /test_sails_setlocale', function(err, res, body) {
        if (err) { return done(err); }
        assert.equal(body, 'Bienvenue');
        return done();
      });
    });

    it('should say "Bienvenue" in French', function() {
      sailsApp.hooks.i18n.setLocale('fr');
      assert.equal(sailsApp.__('Welcome'), 'Bienvenue');
    });

    it('should say "Willkommen" in German', function() {
      sailsApp.hooks.i18n.setLocale('de');
      assert.equal(sailsApp.__('Welcome'), 'Willkommen');
    });
  });

});//</describe i18n tests>




//  ██╗ ██╗ █████╗ ███╗   ██╗     ██████╗ ██████╗ ███╗   ██╗███████╗██╗ ██████╗
//  ██║███║██╔══██╗████╗  ██║    ██╔════╝██╔═══██╗████╗  ██║██╔════╝██║██╔════╝
//  ██║╚██║╚█████╔╝██╔██╗ ██║    ██║     ██║   ██║██╔██╗ ██║█████╗  ██║██║  ███╗
//  ██║ ██║██╔══██╗██║╚██╗██║    ██║     ██║   ██║██║╚██╗██║██╔══╝  ██║██║   ██║
//  ██║ ██║╚█████╔╝██║ ╚████║    ╚██████╗╚██████╔╝██║ ╚████║██║     ██║╚██████╔╝
//  ╚═╝ ╚═╝ ╚════╝ ╚═╝  ╚═══╝     ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝     ╚═╝ ╚═════╝
//
describe('i18n Config ::', function() {

  var appName = 'testApp';
  var sailsApp;

  describe('with locales generate by config', function() {

    before(function (done) {
      appHelper.build(function(err) {
        if (err) {return done(err);}
        var config = 'module.exports.i18n = { locales: [\'en\', \'de\'], defaultLocale: \'de\' };';
        fs.writeFileSync(path.resolve('../', appName, 'config/i18n.js'), config);
        appHelper.lift({
          log: {level: 'silent'}
        }, function(err, sails) {
          if (err) {
            return done(err);
          }
          sailsApp = sails;
          return done();
        });
      });
    });

    after(function(done) {
      sailsApp.lower(function() {
        process.chdir('../');
        appHelper.teardown();
        return done();
      });
    });

    it('should say "Willkommen" by defaultLocale', function() {
      //see https://github.com/balderdashy/sails-generate-backend/pull/10
      assert(sailsApp.__('Welcome') === 'Willkommen');
    });

    it('should autoupdate the file', function(done) {
      sailsApp.__('Login');
      fs.readFile(path.resolve('../', appName, 'config/locales/de.json'), 'utf8', function read(err, data) {
        if (err) {
          return done(err);
        }

        var de = JSON.parse(data);
        assert(de['Login'] === 'Login');
        return done();

      });
    });
  });

});


