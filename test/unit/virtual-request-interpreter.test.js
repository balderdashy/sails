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

  it('should support res.redirect()', function (done) {


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

});
