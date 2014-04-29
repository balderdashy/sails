/**
 * Module dependencies
 */

var assert = require('assert');

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

    it('should redirect and use req.flash to store error in session if `redirectTo` is specified', function (done) {
      var ROUTEADDRESS = '/req_validate2';
      var fakeSession = {};
      sails.router.bind(ROUTEADDRESS, function (req, res, next) {
        req.validate({
          bar: 'string'
        }, '/somewhereElse');
      })
      .emit('router:request', {
        url: ROUTEADDRESS,
        query: {
          foo: 'hi'
        },
        session: fakeSession
      }, {
        redirect: function fakeRedirect (dest) {
          assert(dest === '/somewhereElse');
          assert(fakeSession.flash.error);
          done();
        }
      });
    });


    it('should support nested usage', function (done) {
      var ROUTEADDRESS = '/req_validate3';
      sails.router.bind(ROUTEADDRESS, function (req, res, next) {
        assert.doesNotThrow(function () {
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
        });
        assert.throws(function () {
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
        });

        done();
      })
      .emit('router:request', {
        url: ROUTEADDRESS,
        query: {
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
        }
      });
    });
  });


});
