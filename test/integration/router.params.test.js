/**
 * Module dependencies
 */

var util = require('util');
var assert = require('assert');
var httpHelper = require('./helpers/httpHelper.js');
var appHelper = require('./helpers/appHelper');




var Err = {
  badResponse: function(response) {
    return 'Wrong server response!  Response :::\n' + util.inspect(response.body);
  }
};




describe('router :: ', function() {
  describe('Parameters', function() {
    var appName = 'testApp';

    before(function(done) {
      appHelper.build(done);
    });

    beforeEach(function(done) {
      appHelper.lift({verbose: false}, function(err, sails) {
        if (err) {throw new Error(err);}
        sailsprocess = sails;
        setTimeout(done, 100);
      });
    });

    afterEach(function(done) {
      sailsprocess.lower(function(){setTimeout(done, 100);});
    });

    after(function() {
      process.chdir('../');
      appHelper.teardown();
    });

    describe('"length" param', function() {

      before(function(){
        require('fs').writeFileSync('config/routes.js', 'module.exports.routes = {"/testLength": function(req,res){res.send(req.param("length"));}};');
      });

      it('when sent as a query param, should respond with the correct value of `length`', function(done) {
        httpHelper.testRoute('get', 'testLength?length=long', function(err, response) {
          if (err) { return done(err); }
          assert(response.body==='long', Err.badResponse(response));
          done();
        });

      });

      it('when sent as a body param, should respond with the correct value of `length`', function(done) {
        httpHelper.testRoute('post', {url: 'testLength', json: {length: 'short'}}, function(err, response) {
          if (err) { return done(err); }
          assert(response.body==='short', Err.badResponse(response));
          done();
        });

      });

    });

  });

});
