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

    it('should allow a status code to be passed as the first argument', function (done) {
      app.get('/res_redirect/2', function (req, res) {
        return res.redirect(301, '/foo/baz');
      });
      app.request('GET /res_redirect/2', {}, function (err, resp, data) {
        assert(!err, err);
        assert.deepEqual(resp.headers.Location, '/foo/baz');
        assert.deepEqual(301, resp.statusCode);
        done();
      });
    });

    it('should tolerate the status code being passed in as the second argument for backwards-compatibility', function (done) {
      app.get('/res_redirect/3', function (req, res) {
        return res.redirect('/foo/bubble', 301);
      });
      app.request('GET /res_redirect/3', {}, function (err, resp, data) {
        assert(!err, err);
        assert.deepEqual(resp.headers.Location, '/foo/bubble');
        assert.deepEqual(301, resp.statusCode);
        done();
      });
    });

  });

});
