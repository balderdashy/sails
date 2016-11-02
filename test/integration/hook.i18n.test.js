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
    appHelper.build(function(err) {
      if (err) {return done(err);}
      appHelper.lift({
        log: { level: 'silent' }
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

  describe('with locales generate by sails-generate-backend', function() {
    it('should say "Welcome" by default', function() {
      assert.equal(sailsApp.__('Welcome'), 'Welcome');
    });

    it('should say "Welcome" in English', function() {
      assert.equal(sailsApp.__({
        phrase: 'Welcome',
        locale: 'en'
      }), 'Welcome');
    });

    it('should say "Bienvenido" in Spanish', function() {
      assert.equal(sailsApp.__({
        phrase: 'Welcome',
        locale: 'es'
      }), 'Bienvenido');
    });

    it('should say "Bienvenue" in French', function() {
      assert.equal(sailsApp.__({
        phrase: 'Welcome',
        locale: 'fr'
      }), 'Bienvenue');
    });

    it('should say "Willkommen" in German', function() {
      //see https://github.com/balderdashy/sails-generate-backend/pull/10
      assert(sailsApp.__({
        phrase: 'Welcome',
        locale: 'de'
      }) === 'Willkommen' || sailsApp.__({
        phrase: 'Welcome',
        locale: 'de'
      }) === 'Wilkommen');
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
        var config = 'module.exports.i18n = { defaultLocale: \'de\',updateFiles : true };';
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
      assert(sailsApp.__('Welcome') === 'Willkommen' || sailsApp.__('Welcome') === 'Wilkommen');
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


