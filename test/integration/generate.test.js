describe('API and adapter generators', function() {

  var assert = require('assert');
  var fs = require('fs-extra');
  var exec = require('child_process').exec;
  var path = require('path');

  // Make existsSync not crash on older versions of Node
  fs.existsSync = fs.existsSync || require('path').existsSync;

  function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  var sailsBin = path.resolve('./bin/sails.js');
  var appName = 'testApp';

  this.slow(1000);

  before(function(done) {

    if (fs.existsSync(appName)) {
      fs.removeSync(appName);
    }

    exec('node ' + sailsBin + ' new ' + appName + ' --fast --traditional --without=lodash,async', function(err) {
      if (err) { return done(new Error(err)); }

      // Move into app directory and update sailsBin relative path
      process.chdir(appName);
      sailsBin = path.resolve('..', sailsBin);

      done();
    });
  }); //</before>

  after(function(done) {

    // return to test directory
    process.chdir('../');

    if (fs.existsSync(appName)) {
      fs.removeSync(appName);
    }

    done();
  });

  describe('sails generate model <modelname>', function() {
    var modelName = 'user';

    it('should throw an error if no model name is specified', function(done) {

      exec('node ' + sailsBin + ' generate model', function(err) {
        assert.equal(err.code, 1);
        done();
      });
    });

    it('should create a model file in models folder', function(done) {

      exec('node ' + sailsBin + ' generate model ' + modelName, function(err) {
        if (err) done(new Error(err));

        assert.doesNotThrow(function() {
          fs.readFileSync('./api/models/' + capitalize(modelName) + '.js', 'utf8');
        });

        done();
      });
    });

    it('should throw an error if a model with the same name exists', function(done) {

      exec('node ' + sailsBin + ' generate model ' + modelName, function(err) {
        assert.equal(err.code, 1);
        done();
      });
    });
  });

  describe('sails generate controller <controllerName>', function() {
    var controllerName = 'user';

    it('should throw an error if no controller name is specified', function(done) {

      exec('node ' + sailsBin + ' generate controller', function(err) {
        assert.equal(err.code, 1);
        done();
      });
    });

    it('should create a controller file in controllers folder', function(done) {

      exec('node ' + sailsBin + ' generate controller ' + controllerName, function(err) {
        if (err) { return done(new Error(err)); }

        assert.doesNotThrow(function() {
          fs.readFileSync('./api/controllers/' + capitalize(controllerName) + 'Controller.js', 'utf8');
        });

        done();
      });
    });

    it('should throw an error if a controller with the same name exists', function(done) {

      exec('node ' + sailsBin + ' generate controller ' + controllerName, function(err) {
        assert.equal(err.code, 1);
        done();
      });
    });
  });

  describe('sails generate adapter <modelname>', function() {
    var adapterName = 'mongo';

    it('should throw an error if no adapter name is specified', function(done) {

      exec('node ' + sailsBin + ' generate adapter', function(err) {
        assert.equal(err.code, 1);
        done();
      });
    });

    it('should create a adapter file in adapters folder', function(done) {

      exec('node ' + sailsBin + ' generate adapter ' + adapterName, function(err) {
        if (err) { return done(err); }

        assert.doesNotThrow(function() {
          fs.readFileSync('./api/adapters/' + adapterName + '/index.js', 'utf8');
        });

        done();
      });
    });

    it('should throw an error if an adapter with the same name exists', function(done) {

      exec('node ' + sailsBin + ' generate adapter ' + adapterName, function(err) {
        assert.equal(err.code, 1);
        done();
      });
    });
  });

  describe('sails generate', function() {
    var modelName = 'post';

    it('should display usage if no generator type is specified', function(done) {

      exec('node ' + sailsBin + ' generate', function(err, msg) {
        if (err) { return done(err); }

        assert.notEqual(msg.indexOf('Usage'), -1);

        done();
      });
    });

  });

  describe('sails generate api <apiname>', function() {

    var apiName = 'foo';

    it('should display usage if no api name is specified', function(done) {

      exec('node ' + sailsBin + ' generate api', function(err, dumb, response) {
        assert.notEqual(response.indexOf('Usage'), -1);
        done();
      });
    });

    it('should create a controller and a model file', function(done) {

      exec('node ' + sailsBin + ' generate api ' + apiName, function(err) {
        if (err) { return done(err); }

        assert.doesNotThrow(function() {
          fs.readFileSync('./api/models/' + capitalize(apiName) + '.js', 'utf8');
        });

        assert.doesNotThrow(function() {
          fs.readFileSync('./api/controllers/' + capitalize(apiName) + 'Controller.js', 'utf8');
        });

        done();
      });
    });

    it('should throw an error if a controller file and model file with the same name exists', function(done) {

      exec('node ' + sailsBin + ' generate api ' + apiName, function(err) {
        assert.equal(err.code, 1);
        done();
      });
    });
  });
});
