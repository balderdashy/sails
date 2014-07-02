var assert = require('assert');
var httpHelper = require('./helpers/httpHelper.js');
var appHelper = require('./helpers/appHelper');
var path = require('path');
var fs = require('fs');

describe('i18n ::', function() {

  var appName = 'testApp';

  beforeEach(function(done) {
    appHelper.lift({
      verbose: false
    }, function(err, sails) {
      if (err) {
        throw new Error(err);
      }
      sailsprocess = sails;
      sailsprocess.once('hook:http:listening', done);
    });
  });

  afterEach(function(done) {
    sailsprocess.kill(done);
  });

  before(function(done) {
    this.timeout(5000);
    appHelper.build(done);
  });

  after(function() {
    // console.log('before `chdir ../`' + ', cwd was :: ' + process.cwd());
    process.chdir('../');
    // console.log('after `chdir ../`' + ', cwd was :: ' + process.cwd());
    appHelper.teardown();
  });

  describe('with locales generate by sails-generate-backend', function () {
    it('should say "Welcome" by default', function(done) {
      assert(sailsprocess.__('Welcome') == 'Welcome');
      done();
    });

    it('should say "Welcome" in English', function(done) {
      assert(sailsprocess.__({
        phrase: 'Welcome',
        locale: 'en'
      }) == 'Welcome');
      done();
    });

    it('should say "Bienvenido" in Spanish', function(done) {
      assert(sailsprocess.__({
        phrase: 'Welcome',
        locale: 'es'
      }) == 'Bienvenido');
      done();
    });

    it('should say "Bienvenue" in French', function(done) {
      assert(sailsprocess.__({
        phrase: 'Welcome',
        locale: 'fr'
      }) == 'Bienvenue');
      done();
    });

    it('should say "Willkommen" in German', function(done) {
        //see https://github.com/balderdashy/sails-generate-backend/pull/10
        assert(sailsprocess.__({
            phrase: 'Welcome',
            locale: 'de'
        }) == 'Willkommen' || sailsprocess.__({
            phrase: 'Welcome',
            locale: 'de'
        }) == 'Wilkommen');
        done();
    });
  });
});
describe('i18n Config ::', function() {

  var appName = 'testApp';

  beforeEach(function(done) {
    appHelper.lift({
      verbose: false
    }, function(err, sails) {
      if (err) {
        throw new Error(err);
      }
      sailsprocess = sails;
      sailsprocess.once('hook:http:listening', done);
    });
  });

  afterEach(function(done) {
    sailsprocess.kill(done);
  });

  before(function(done) {
    this.timeout(5000);
    appHelper.build(done);
  });

  after(function() {
    // console.log('before `chdir ../`' + ', cwd was :: ' + process.cwd());
    process.chdir('../');
    // console.log('after `chdir ../`' + ', cwd was :: ' + process.cwd());
    appHelper.teardown();
  });
 
  describe('with locales generate by config', function () {
    
    before(function() {
      var config = "module.exports.i18n = { defaultLocale: 'de',updateFiles : true };";
      fs.writeFileSync(path.resolve('../', appName, 'config/i18n.js'), config);
    });
    
    it('should say "Willkommen" by defaultLocale', function(done) {
      //see https://github.com/balderdashy/sails-generate-backend/pull/10
      assert(sailsprocess.__('Welcome') == 'Willkommen' || sailsprocess.__('Welcome') == 'Wilkommen'); 
      done();
    });
    
    it('should autoupdate the file', function(done) {
      sailsprocess.__('Login');
      fs.readFile(path.resolve('../', appName, 'config/locales/de.json'),'utf8', function read(err, data) {
          if (err) {
              throw err;
          }else{
            var de = JSON.parse(data);
            assert(de['Login'] == 'Login');
            done();
          }
      });
    });
  });
});
