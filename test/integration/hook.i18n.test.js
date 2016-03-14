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
  beforeEach(function(done) {
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

  afterEach(function(done) {
    sailsApp.lower(done);
  });






  before(function(done) {
    appHelper.build(done);
  });

  describe('with locales generate by sails-generate-backend', function() {
    it('should say "Welcome" by default', function(done) {
      assert(sailsApp.__('Welcome') == 'Welcome');
      done();
    });

    it('should say "Welcome" in English', function(done) {
      assert(sailsApp.__({
        phrase: 'Welcome',
        locale: 'en'
      }) == 'Welcome');
      done();
    });

    it('should say "Bienvenido" in Spanish', function(done) {
      assert(sailsApp.__({
        phrase: 'Welcome',
        locale: 'es'
      }) == 'Bienvenido');
      done();
    });

    it('should say "Bienvenue" in French', function(done) {
      assert(sailsApp.__({
        phrase: 'Welcome',
        locale: 'fr'
      }) == 'Bienvenue');
      done();
    });

    it('should say "Willkommen" in German', function(done) {
      //see https://github.com/balderdashy/sails-generate-backend/pull/10
      assert(sailsApp.__({
        phrase: 'Welcome',
        locale: 'de'
      }) == 'Willkommen' || sailsApp.__({
        phrase: 'Welcome',
        locale: 'de'
      }) == 'Wilkommen');
      done();
    });
  });

  after(function() {
    process.chdir('../');
    appHelper.teardown();
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
  beforeEach(function(done) {
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

  afterEach(function(done) {
    sailsApp.lower(done);
  });



  before(function(done) {
    appHelper.build(done);
  });

  describe('with locales generate by config', function() {

    before(function() {
      var config = "module.exports.i18n = { defaultLocale: 'de',updateFiles : true };";
      fs.writeFileSync(path.resolve('../', appName, 'config/i18n.js'), config);
    });

    it('should say "Willkommen" by defaultLocale', function(done) {
      //see https://github.com/balderdashy/sails-generate-backend/pull/10
      assert(sailsApp.__('Welcome') == 'Willkommen' || sailsApp.__('Welcome') == 'Wilkommen');
      done();
    });

    it('should autoupdate the file', function(done) {
      sailsApp.__('Login');
      fs.readFile(path.resolve('../', appName, 'config/locales/de.json'), 'utf8', function read(err, data) {
        if (err) {
          throw err;
        } else {
          var de = JSON.parse(data);
          assert(de['Login'] == 'Login');
          done();
        }
      });
    });
  });

  after(function() {
    process.chdir('../');
    appHelper.teardown();
  });
});


