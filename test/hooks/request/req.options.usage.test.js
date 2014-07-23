/**
 * Module dependencies
 */

var assert = require('assert');

var $Sails = require('../../helpers/sails');
var $Router = require('../../helpers/router');





describe('Request hook', function (){

  var sails = $Sails.load({
    globals: false,
    log: {
      level: 'silent'
    },
    loadHooks: [
      'moduleloader',
      'userconfig',
      'request',
      'responses'
    ]
  });

  describe('setting req.options.usage', function () {

    it('should call `req.validate(req.options.usage)` and cause server to send 400 response upon receiving invalid params', function (done) {
      var ROUTEADDRESS = '/req_options_usage1';
      sails.router.bind(ROUTEADDRESS, function (req,res,next) {
        req.options.usage = {
          foo: 'integer'
        };
        next();
      })
      .router.bind(ROUTEADDRESS, function (req, res, next) {
        return res.send(500, 'Should never get here');
      })
      .emit('router:request', {
        url: ROUTEADDRESS,
        query: {
          foo: 'nasty string'
        }
      }, {
        send: function (_statusCode, body) {
          var statusCode;

          // Determine order of arguments in this usage
          if ( +statusCode <999 && +statusCode > -1 ) {
            statusCode = _statusCode;
          }
          else {
            statusCode = body;
            body = _statusCode;
          }

          if (statusCode === 400) return done();
          return done(new Error('Incorrect status code sent: '+statusCode+ '\nFull response body:'+body));
        }
      });
    });

    // it('should call `req.validate(req.options.usage)` but still work correctly upon receiving valid params', function (done) {
    //   var ROUTEADDRESS = '/req_options_usage2';
    //   sails.router.bind(ROUTEADDRESS, function (req,res,next) {
    //     req.options.usage = {
    //       foo: 'integer'
    //     };
    //     next();
    //   })
    //   .router.bind(ROUTEADDRESS, function (req, res, next) {
    //     res.send(200);
    //   })
    //   .emit('router:request', {
    //     url: ROUTEADDRESS,
    //     query: {
    //       foo: 123
    //     }
    //   }, {
    //     send: function (statusCode) {
    //       assert(statusCode === 200);
    //       done();
    //     }
    //   });
    // });

  });



});
