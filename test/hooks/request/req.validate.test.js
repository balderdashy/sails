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

  describe('req.validate()', function () {

    it('should not throw when required params are specified in req.query', function (done) {
      var ROUTEADDRESS = '/req_validate0';
      sails.router.bind(ROUTEADDRESS, function (req, res, next) {
        try {
          req.validate({
            foo: 'string'
          });
        }
        catch(e) {
          return res.send(500, e);
        }
        return res.send(200);
      });

      sails.request(ROUTEADDRESS+'?foo=hi', done);
    });

    it('should throw E_INVALID_PARAMS when required params are missing', function (done) {
      var ROUTEADDRESS = '/req_validate1';
      sails.router.bind(ROUTEADDRESS, function (req, res, next) {
        try {
          req.validate({
            bar: 'string'
          });
        }
        catch (e) {
          assert(e.code === 'E_INVALID_PARAMS');
          assert(e.status === 400);
          assert(e.invalidParams);
          assert(e.route);
          assert(e.usage);
          assert(e.toJSON);
          assert(e.inspect);
          res.send(200);
          return done();
        }
        res.send(500);
        return done(new Error('should not have made it here'));
      });
      sails.request(ROUTEADDRESS+'?foo=hi');
    });

    it('should redirect if `redirectTo` is specified', function (done) {
      var ROUTEADDRESS = '/req_validate2';
      sails.router.bind(ROUTEADDRESS, function (req, res, next) {
        req.validate({
          bar: 'string'
        }, '/somewhereElse');
        return res.send(200);
      });

      sails.emit('router:request', {
        url: ROUTEADDRESS,
        query: {
          foo: 'hi'
        }
      }, {
        redirect: function fakeRedirect (dest) {
          assert(dest === '/somewhereElse');
          return done();
        }
      });
    });


    it('should support nested usage', function (done) {
      var ROUTEADDRESS = 'POST /req_validate3';
      sails.router.bind(ROUTEADDRESS, function (req, res, next) {
        try {
          req.validate({
            foo: {
              bar: 'string'
            },
            baz: {
              bing: {
                barge: 'boolean',
                dingy: 'number',
                batwell: 'boolean'
              }
            }
          });
        }
        catch(e) {
          res.send(200);
          return done(util.inspect(e));
        }

        try {
          req.validate({
            foo: {
              bar: 'string'
            },
            baz: {
              bing: {
                barge: 'boolean',
                dingy: 'string',
                batwell: 'boolean'
              }
            }
          });
        }
        catch (e) {
          res.send(200);
          return done();
        }
        res.send(200);
        return done(new Error('Should have thrown'));
      });

      sails.request(ROUTEADDRESS, {
        foo: {
          bar: 'hi'
        },
        baz: {
          bing: {
            barge: false,
            dingy: 131351393,
            batwell: true
          }
        }
      });
    });
  });


});
