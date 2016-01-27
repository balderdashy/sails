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

  describe('using req.options in multiple requests', function () {

    var opts;
    before(function(done) {
      var ROUTEADDRESS = '/route';
      sails.router.bind(ROUTEADDRESS, function (req, res, next) {
        req.options[req.param('opt')] = true;
        return res.send(200, JSON.stringify(req.options));
      });
      sails.emit('router:request', {
        url: ROUTEADDRESS,
        query: {
          opt: 'foo'
        }
      }, {send: function(){}});
      sails.emit('router:request', {
        url: ROUTEADDRESS,
        query: {
          opt: 'bar'
        }
      }, {
        send: function (_statusCode, body) {
          try {
            opts = JSON.parse(body);
          } catch (e) {}
          return done();
        }
      });
    });

    it('req.options should not be sticky', function () {
      assert(!opts.foo, "req.options.foo from first request carried over to second request!");
    });

  });



});
