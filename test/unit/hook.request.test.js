/**
 * Module dependencies
 */

var assert = require('assert');

var $Sails = require('./helpers/sails');
var $Router = require('./helpers/router');


describe('Request hook', function (){

  var sails = $Sails.load({
    globals: false,
    loadHooks: [
      'moduleloader',
      'userconfig',
      'request'
    ]
  });


  it('should expose `req.params.all()`', function (done) {
    var ROUTEADDRESS = '/req_params_all';
    sails.router.bind(ROUTEADDRESS, function (req, res) {
      assert(typeof req.params.all === 'function', 'req.params.all() should be defined when request hook is enabled.');
      done();
    })
    .emit('router:request', {url: ROUTEADDRESS});
  });



  it('should expose `req.validate()`', function (done) {
    var ROUTEADDRESS = '/req_validate';
    sails.router.bind(ROUTEADDRESS, function (req, res) {
      assert(typeof req.validate === 'function', 'req.validate() should be defined when request hook is enabled.');
      done();
    })
    .emit('router:request', {url: ROUTEADDRESS});
  });

});




