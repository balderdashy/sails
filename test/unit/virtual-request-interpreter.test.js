/**
 * Module dependencies
 */

var assert = require('assert');
var $Sails = require('../helpers/sails');


describe('virtual request interpreter', function (){

  var app = $Sails.load({
    globals: false,
    log: { level: 'silent' },
    loadHooks: [
      'moduleloader',
      'userconfig',
      'responses'
    ]
  });


  describe('res.redirect()', function (){

    it('should support creamy vanilla usage', function (done) {
      app.get('/res_redirect/1', function (req, res) {
        return res.redirect('/foo/bar');
      });
      app.request('GET /res_redirect/1', {}, function (err, resp, data) {
        assert(!err, err);
        assert.deepEqual(resp.headers.Location, '/foo/bar');
        assert.deepEqual(302, resp.statusCode);
        done();
      });
    });

    it('should honor .status()', function (done) {
      app.get('/res_redirect/2', function (req, res) {
        return res.status(301).redirect('/foo/baz');
      });
      app.request('GET /res_redirect/2', {}, function (err, resp, data) {
        assert(!err, err);
        assert.deepEqual(resp.headers.Location, '/foo/baz');
        assert.deepEqual(301, resp.statusCode);
        done();
      });
    });

    it('should NO LONGER ALLOW a status code to be passed as the first argument', function (done) {
      app.get('/res_redirect/3', function (req, res) {
        try {
          return res.redirect(301, '/foo/baz');
        } catch(e) {
          // Go ahead and throw this again on purpose (so that we test the rest
          // of the unhandled error flow for the VR interpreter)
          throw e;
        }
      });
      app.request('GET /res_redirect/3', {}, function (err, resp, data) {
        try {
          assert(err);
          assert(err.message.match(/Error: The 2\-ary usage of \`res\.redirect\(\)\` is no longer supported/), 'Unexpected error message: '+err.message);
        } catch (e) { return done(e); }
        return done();
      });
    });

    it('should NO LONGER ALLOW the status code being passed in as the second argument EITHER', function (done) {
      app.get('/res_redirect/4', function (req, res) {
        try {
          return res.redirect('/foo/baz', 301);
        } catch(e) {
          // Go ahead and throw this again on purpose (so that we test the rest
          // of the unhandled error flow for the VR interpreter)
          throw e;
        }
      });
      app.request('GET /res_redirect/4', {}, function (err, resp, data) {
        try {
          assert(err);
          assert(err.message.match(/Error: The 2\-ary usage of \`res\.redirect\(\)\` is no longer supported/), 'Unexpected error message: '+err.message);
        } catch (e) { return done(e); }
        return done();
      });
    });

  });

});
