/**
 * Module dependencies
 */

var assert = require('assert');
var util = require('util');
var $Sails = require('../../helpers/sails');
var $Router = require('../../helpers/router');


describe('Request hook', function (){

  var sails = $Sails.load({
    globals: false,
    loadHooks: [
      'moduleloader',
      'userconfig',
      'request'
    ]
  });

  it('should expose `req.allParams()`', function (done) {
    var ROUTEADDRESS = '/req_allParams';
    sails.router.bind(ROUTEADDRESS, function (req, res) {
      assert(typeof req.allParams === 'function', 'req.allParams() should be defined when request hook is enabled.');
      res.send(200);
      done();
    })
    .emit('router:request', {url: ROUTEADDRESS});
  });


  // NO LONGER SUPPORTED
  it('should expose `req.validate()`-- but calling it should always fail', function (done) {
    var ROUTEADDRESS = '/req_validate';
    sails.router.bind(ROUTEADDRESS, function (req, res, next) {
      assert(typeof req.validate === 'function', 'req.validate() should be defined when request hook is enabled.');

      try {
        req.validate('foo');
      }
      catch (e) {
        return res.send(420);
      }

      return res.send(200);
    });

    sails.request(ROUTEADDRESS, function (err){
      try {
        assert(err && err.status === 420, new Error('Expecting error: it should no longer be supported'));
      } catch (e) { return done(e); }

      return done();
    });

  });//</it>

});
