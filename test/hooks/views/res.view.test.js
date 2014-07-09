/**
 * Module dependencies
 */

var assert = require('assert');
var util = require('util');
var Sails = require('../../../lib').constructor;
var RouteFactory = require('root-require')('test/helpers/RouteFactory.helper');


describe('res.view()', function (){

  // Get some mock routes to use in the tests below
  var mockRoutes = RouteFactory('res_view()');

  // Load a Sails app
  var app;
  before(function (done) {
    app = new Sails()
    .load({
      globals: false,
      loadHooks: [
        'moduleloader',
        'userconfig',
        'http',
        'views'
      ]
    }, done);
  });


  it('should exist when the views hook is enabled', function (done) {
    app
    .get(mockRoutes.next(), function (req, res) {
      assert.equal(typeof res.view, 'function', 'res.view() should be defined when request hook is enabled.');
      return res.send(200);
    })
    .request(mockRoutes.current, done);
  });


  it.skip('should work w/ basic usage', function (done) {

    // NOTE:
    // In order to test this using `app.request` (i.e. w/o lifting),
    // we need to finish the `res.render()` functionality in core.

    // TODO: adapt this test accordingly

    app.get(mockRoutes.next(), function (req, res) {
      return res.view('foo');
    })
    .request(mockRoutes.current, function (err, res, body) {
      if (err) return done(err);
      assert.equal(res.statusCode, 200);
      assert.equal(body, VIEW_CONTENTS);
    });
  });

});

