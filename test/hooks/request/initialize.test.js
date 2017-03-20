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
      try {
        assert(typeof req.allParams === 'function', 'req.allParams() should be defined when request hook is enabled.');
      } catch (e) {
        res.sendStatus(500);
        return done(e);
      }
      res.sendStatus(200);
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
        return res.sendStatus(420);
      }

      return res.sendStatus(200);
    });

    sails.request(ROUTEADDRESS, function (err){
      try {
        assert(err && err.status === 420, new Error('Expecting error: it should no longer be supported'));
      } catch (e) { return done(e); }

      return done();
    });

  });//</it>

});
