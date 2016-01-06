var assert = require('assert');
var fs = require('fs');
var request = require('request');
var appHelper = require('./helpers/appHelper');
var path = require('path');

describe('Starting HTTPS sails server with lift', function() {

  var appName = 'testApp';

  before(function(done) {
    this.timeout(5000);
    appHelper.build(done);
  });

  after(function() {
    process.chdir('../');
    appHelper.teardown();
  });


	describe('using sails.config.ssl.key and sails.config.ssl.cert', function() {

    var sailsServer;

    before(function() {
      var opts = {
        ssl: {
          key: require('fs').readFileSync(require('path').resolve(__dirname, 'cert','sailstest-key.pem')).toString(),
          cert: require('fs').readFileSync(require('path').resolve(__dirname, 'cert','sailstest-cert.pem')).toString()
        }
      };
      fs.writeFileSync(path.resolve('../', appName, 'config/ssl.js'), "module.exports = " + JSON.stringify(opts) + ";");
    });

    after(function(done) {
      if (sailsServer) {
        return sailsServer.lower(done);
      }
      return done();
    });

		it('should start server without error', function(done) {
			appHelper.lift(function(err, _sailsServer) {
        assert(!err);
        sailsServer = _sailsServer;
        return done();
      });

		});

		it('should respond to a request to port 1342 with a 200 status code', function(done) {
      if (!sailsServer) {return done('Bailing due to previous test failure!');}

			request.get({
        url:'https://localhost:1342/',
        ca: require('fs').readFileSync(require('path').resolve(__dirname, 'cert','sailstest-cert.pem')),
      }, function(err, response) {
				assert(!err);
				assert.equal(response.statusCode, 200);
				return done();
			});

		});
	});

  describe('using sails.config.ssl = true and sails.config.http.serverOptions', function() {

    var sailsServer;

    before(function() {
      var opts = {
        ssl: true,
        http: {
          serverOptions: {
            key: require('fs').readFileSync(require('path').resolve(__dirname, 'cert','sailstest-key.pem')).toString(),
            cert: require('fs').readFileSync(require('path').resolve(__dirname, 'cert','sailstest-cert.pem')).toString()
          }
        }
      };
      fs.writeFileSync(path.resolve('../', appName, 'config/ssl.js'), "module.exports = " + JSON.stringify(opts) + ";");
    });

    after(function(done) {
      if (sailsServer) {
        return sailsServer.lower(done);
      }
      return done();
    });

    it('should start server without error', function(done) {
      appHelper.lift(function(err, _sailsServer) {
        assert(!err);
        sailsServer = _sailsServer;
        return done();
      });

    });

    it('should respond to a request to port 1342 with a 200 status code', function(done) {
      if (!sailsServer) {return done('Bailing due to previous test failure!');}

      request.get({
        url:'https://localhost:1342/',
        ca: require('fs').readFileSync(require('path').resolve(__dirname, 'cert','sailstest-cert.pem')),
      }, function(err, response) {
        assert(!err);
        assert.equal(response.statusCode, 200);
        return done();
      });

    });
  });
});
