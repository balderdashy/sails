var assert = require('assert');
var mixinMetadata = require('../../../lib/hooks/request/metadata');
// var Sails = require('../../../lib/app');

describe('Request hook', function () {
  describe('metadata', function () {

    beforeEach(function() {
      this.req = {
        headers: {},
        get: function(key) { return this.headers[key]; },
        app: {
          data: { 'trust proxy': false },
          get: function(key) { return this.data[key]; }
        },
        _sails: {
          hooks: {},
          config: {}
        }
      };
    });

    describe('without a reverse proxy', function() {
      it('should set req.port to 80 for http requests', function() {
        this.req.protocol = 'http';
        this.req.host = 'example.org';
        this.req.headers.Host = 'example.org';
        mixinMetadata(this.req);
        assert.equal(this.req.port, 80);
      });

      it('should set req.port to 443 for https requests', function() {
        this.req.protocol = 'https';
        this.req.host = 'example.org';
        this.req.headers.Host = 'example.org';
        mixinMetadata(this.req);
        assert.equal(this.req.port, 443);
      });

      it('should not add a port to baseUrl on port 80 or 443', function() {
        this.req.protocol = 'http';
        this.req.host = 'example.org';
        this.req.headers.Host = 'example.org';
        mixinMetadata(this.req);
        assert.equal(this.req.baseUrl, 'http://example.org');

        this.req.protocol = 'https';
        this.req.host = 'example.org';
        this.req.headers.Host = 'example.org';
        mixinMetadata(this.req);
        assert.equal(this.req.baseUrl, 'https://example.org');
      });

      it('should add a port to baseUrl on a custom port', function() {
        this.req.protocol = 'http';
        this.req.host = 'example.org';
        this.req.headers.Host = 'example.org:1337';
        mixinMetadata(this.req);
        assert.equal(this.req.baseUrl, 'http://example.org:1337');
      });

      it('should handle running as HTTP on port 443', function() {
        this.req.protocol = 'http';
        this.req.host = 'example.org';
        this.req.headers.Host = 'example.org:443';
        mixinMetadata(this.req);
        assert.equal(this.req.port, 443);
        assert.equal(this.req.baseUrl, 'http://example.org:443');
      });
    });

    describe('with a reverse proxy and app.enable("trust proxy")', function() {

      beforeEach(function() {
        // Fake a situation where trust proxy is enabled
        // (without having set sails.config.http accordingly)
        this.req.app.data['trust proxy'] = true;
      });

      /*
       * In this case, req.protocol as set by Express is aware of the
       * X-Forwarded-Proto header field. The only complication: req.host
       * doesn't include a port number; req.header('host') might be wrong, too,
       * so we can't trust it either.
       */

      it('should handle a simple HTTP case with X-Forwarded-Host', function() {
        this.req.protocol = 'http'; // we assume Express got this right
        this.req.host = 'server.local';
        this.req.headers.Host = 'server.local';
        this.req.headers['X-Forwarded-Host'] = 'example.org';
        mixinMetadata(this.req);
        assert.equal(this.req.port, 80);
        assert.equal(this.req.baseUrl, 'http://example.org');
      });

      it('should handle when X-Forwarded-Host is not set', function() {
        this.req.protocol = 'http'; // we assume Express got this right
        this.req.host = 'server.local';
        this.req.headers.Host = 'example.org:81';
        mixinMetadata(this.req);
        assert.equal(this.req.port, 81);
        assert.equal(this.req.baseUrl, 'http://example.org:81');
      });

      it('should handle a simple HTTPS case with X-Forwarded-Host', function() {
        this.req.protocol = 'https'; // we assume Express got this right
        this.req.host = 'server.local';
        this.req.headers.Host = 'server.local';
        this.req.headers['X-Forwarded-Host'] = 'example.org';
        mixinMetadata(this.req);
        assert.equal(this.req.port, 443);
        assert.equal(this.req.baseUrl, 'https://example.org');
      });

      it('should handle running on a nonstandard port', function() {
        this.req.protocol = 'https'; // we assume Express got this right
        this.req.host = 'server.local';
        this.req.headers.Host = 'server.local:10000';
        this.req.headers['X-Forwarded-Host'] = 'example.org';
        mixinMetadata(this.req);
        assert.equal(this.req.port, 443);
        assert.equal(this.req.baseUrl, 'https://example.org');
      });

      it('should handle a list of x-forwarded-host values', function() {
        this.req.protocol = 'https'; // we assume Express got this right
        this.req.host = 'server2.local';
        this.req.headers.Host = 'server2.local:10000';
        this.req.headers['X-Forwarded-Host'] = 'example.org, server1.local';
        mixinMetadata(this.req);
        assert.equal(this.req.port, 443);
        assert.equal(this.req.baseUrl, 'https://example.org');
      });

      it('should handle running on a weird port through a reverse proxy', function() {
        this.req.protocol = 'http';
        this.req.host = 'server.local';
        this.req.headers.Host = 'server.local:1000';
        this.req.headers['X-Forwarded-Host'] = 'example.org:81';
        mixinMetadata(this.req);
        assert.equal(this.req.port, 81);
        assert.equal(this.req.baseUrl, 'http://example.org:81');
      });

      it('should handle running as HTTP on port 443', function() {
        this.req.protocol = 'http';
        this.req.host = 'server.local';
        this.req.headers.Host = 'server.local:443';
        this.req.headers['X-Forwarded-Host'] = 'example.org:443';
        mixinMetadata(this.req);
        assert.equal(this.req.port, 443);
        assert.equal(this.req.baseUrl, 'http://example.org:443');
      });
    });

  });

});
