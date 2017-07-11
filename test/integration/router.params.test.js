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

    describe('"touch" param (with no value)', function() {

      before(function(){
        require('fs').writeFileSync('config/routes.js', 'module.exports.routes = {"/testTouch": function(req,res){res.send(typeof req.param("touch") !== "undefined");}};');
      });

      it('when sent as a query param, should respond with a truthy value', function(done) {
        httpHelper.testRoute('get', 'testTouch?touch', function(err, response) {
          if (err) { return done(err); }
          assert(response.body==='true', Err.badResponse(response));
          done();
        });

      });

    });

    describe('req.param() precedence', function() {

      before(function(){
        require('fs').writeFileSync('config/routes.js', 'module.exports.routes = {"/test/:foo": function(req,res){res.json(req.param("foo"));}, "/test": function(req,res){res.json(req.param("foo"));}};');
      });

      it('when sent a value is specified in the query, body and route, route param should take precedence', function(done) {
        httpHelper.testRoute('post', {url: 'test/abc?foo=123', json: {foo: 666}}, function(err, response) {
          if (err) { return done(err); }
          assert(response.body==='abc', Err.badResponse(response));
          done();
        });
      });

      it('when sent a value is specified in the query and body, body should take precedence', function(done) {
        httpHelper.testRoute('post', {url: 'test?foo=123', json: {foo: 666}}, function(err, response) {
          if (err) { return done(err); }
          assert(response.body===666, Err.badResponse(response));
          done();
        });
      });

    });

    describe('req.param() defaults', function() {

      before(function(){
        require('fs').writeFileSync('config/routes.js', 'module.exports.routes = {"/test": function(req,res){res.json(req.param("foo", "bar"));}, "/none": function(req,res){res.json(req.param("foo"));}};');
      });

      it('when a value for a param is specified, that value should be used instead of the default', function(done) {
        httpHelper.testRoute('post', {url: 'test/?foo=123'}, function(err, response) {
          if (err) { return done(err); }
          assert(response.body==='"123"', Err.badResponse(response));
          done();
        });
      });

      it('when no value for a param is specified, the default should be used', function(done) {
        httpHelper.testRoute('post', {url: 'test'}, function(err, response) {
          if (err) { return done(err); }
          assert(response.body==='"bar"', Err.badResponse(response));
          done();
        });
      });

      it('when no value for a param is specified, and there is no default, the param should be undefined', function(done) {
        httpHelper.testRoute('post', {url: 'none'}, function(err, response) {
          if (err) { return done(err); }
          assert(response.body==='', Err.badResponse(response));
          done();
        });
      });


    });

    describe('req.params.allParams', function() {

      before(function(){
        require('fs').writeFileSync('config/routes.js', 'module.exports.routes = {"/testParams/:foo": function(req,res){res.json(req.allParams());}};');
      });

      it('should return the correct param values, accounting for precedence', function(done) {
        httpHelper.testRoute('post', {url: 'testParams/abc?foo=123&baz=999&bar=555&touch', json: {bar: 666}}, function(err, response) {
          if (err) { return done(err); }
          assert.equal(response.body.foo, 'abc');
          assert.equal(response.body.bar, 666);
          assert.equal(response.body.baz, 999);
          assert.equal(response.body.touch, '');
          done();
        });

      });

    });



  });

});
