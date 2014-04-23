/**
 * Module dependencies
 */

var assert = require('assert');

var $Sails = require('../helpers/sails');
var $Router = require('../helpers/router');





describe('Request hook', function (){

  var sails = $Sails.load({
    globals: false,
    log: {
      level: 'silent'
    },
    loadHooks: [
      'moduleloader',
      'userconfig',
      'request'
    ]
  });

  describe('setting req.options.usage', function () {

    it('should call `req.validate(req.options.usage)` and cause server to send 400 response upon receiving invalid params', function (done) {
      var ROUTEADDRESS = '/req_options_usage';
      sails.router.bind('/*', function (req,res,next) {
        req.options.usage = {
          foo: 'integer'
        };
        next();
      })
      .router.bind(ROUTEADDRESS, function (req, res, next) {
        done(new Error('Should never get here'));
      })
      .emit('router:request', {
        url: ROUTEADDRESS,
        query: {
          foo: 'nasty string'
        }
      }, {
        send: function () {
          console.log('ok');
          done();
        }
      });
    });

    it('should call `req.validate(req.options.usage)` but still work correctly upon receiving valid params', function (done) {
      var ROUTEADDRESS = '/req_options_usage';
      sails.router.bind('/*', function (req,res,next) {
        req.options.usage = {
          foo: 'integer'
        };
        next();
      })
      .emit('router:request', {
        url: ROUTEADDRESS,
        query: {
          foo: 123
        }
      }, {
        send: function () {
          console.log('ok');
          done();
        }
      });
    });

  });



});
