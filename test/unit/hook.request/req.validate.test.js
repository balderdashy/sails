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

  describe('req.validate()', function () {

    it('should not throw when required params are specified in req.query', function (done) {
      var ROUTEADDRESS = '/req_validate0';
      sails.router.bind(ROUTEADDRESS, function (req, res, next) {
        assert.doesNotThrow(function () {
          req.validate({
            foo: 'string'
          });
        });
        done();
      })
      .emit('router:request', {
        url: ROUTEADDRESS,
        query: {
          foo: 'hi'
        }
      });
    });

    it('should throw when required params are missing', function (done) {
      var ROUTEADDRESS = '/req_validate1';
      sails.router.bind(ROUTEADDRESS, function (req, res, next) {
        try {
          req.validate({
            bar: 'string'
          });
        }
        catch (e) {
          done();
        }
      })
      .emit('router:request', {
        url: ROUTEADDRESS,
        query: {
          foo: 'hi'
        }
      });
    });

  });

});
