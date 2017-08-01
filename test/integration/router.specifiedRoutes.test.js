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
  describe('Specified routes', function() {
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

    describe('an options request', function() {
      before(function() {
        httpHelper.writeRoutes({
          '/*': {
            cors: true,
          },
          '/testRoute': {
            action: 'test/verb',
          },
        });
      });

      it('should respond to OPTIONS requests', function(done) {
        httpHelper.testRoute('options', {
          url: 'testRoute',
          headers: {
            'Access-Control-Request-Method': 'post',
            Origin: 'https://foo.shyp.com'
          },
        }, function(err, response, body) {
          assert.equal(response.statusCode, 200);
          assert.equal(response.headers['access-control-allow-origin'], '*');
          done();
        });
      });
    });

    describe('with an unspecified http method', function() {

      before(function() {
        httpHelper.writeRoutes({
          '/testRoute': {
           action: 'test/verb'
          }
        });
      });

      it('should respond to get requests', function(done) {


        httpHelper.testRoute('get', 'testRoute', function(err, response) {
          if (err) { return done(err); }

          assert(response.body === 'get', Err.badResponse(response));
          done();
        });
      });

      it('should respond to post requests', function(done) {

        httpHelper.testRoute('post', 'testRoute', function(err, response) {
          if (err) { return done(err); }

          assert(response.body === 'post', Err.badResponse(response));
          done();
        });
      });

      it('should respond to put requests', function(done) {

        httpHelper.testRoute('put', 'testRoute', function(err, response) {
          if (err) { return done(err); }

          assert(response.body === 'put', Err.badResponse(response));
          done();
        });
      });

      it('should respond to delete requests', function(done) {

        httpHelper.testRoute('del', 'testRoute', function(err, response) {
          if (err) { return done(err); }

          assert(response.body === 'delete', Err.badResponse(response));
          done();
        });
      });
    });

    describe('with get http method specified', function() {

      before(function() {
        httpHelper.writeRoutes({
          'get /testRoute': {
            action: 'test/verb'
          }
        });
      });

      it('should respond to get requests', function(done) {

        httpHelper.testRoute('get', 'testRoute', function(err, response) {
          if (err) { return done(err); }

          assert(response.body === 'get', Err.badResponse(response));
          done();
        });
      });

      it('shouldn\'t respond to post requests', function(done) {

        httpHelper.testRoute('post', 'testRoute', function(err, response) {
          if (err) { return done(err); }

          assert(response.body !== 'post', Err.badResponse(response));
          done();
        });
      });
    });

    describe('with post http method specified', function() {

      before(function() {
        httpHelper.writeRoutes({
          'post /testRoute': {
            action: 'test/verb'
          }
        });
      });

      it('should respond to post requests', function(done) {

        httpHelper.testRoute('post', 'testRoute', function(err, response) {
          if (err) { return done(err); }

          assert(response.body === 'post', Err.badResponse(response));
          done();
        });
      });
    });

    describe('with put http method specified', function() {

      before(function() {
        httpHelper.writeRoutes({
          'put /testRoute': {
            action: 'test/verb'
          }
        });
      });

      it('should respond to put requests', function(done) {

        httpHelper.testRoute('put', 'testRoute', function(err, response) {
          if (err) { return done(err); }

          assert(response.body === 'put', Err.badResponse(response));
          done();
        });
      });
    });

    describe('with delete http method specified', function() {

      before(function(){
        httpHelper.writeRoutes({
          'delete /testRoute': {
            action: 'test/verb'
          }
        });
      });

      it('should respond to delete requests', function(done) {


        httpHelper.testRoute('del', 'testRoute', function(err, response) {
          if (err) { return done(err); }

          assert(response.body === 'delete', Err.badResponse(response));
          done();
        });
      });
    });

    describe('with dynamic url paths specified', function() {

      before(function() {
        httpHelper.writeRoutes({
          'get /test/:category/:size': {
            action: 'test/dynamic'
          }
        });
      });

      it('should respond to requests that match the url pattern', function(done) {

        httpHelper.testRoute('get', 'test/shirts/large', function(err, response) {
          if (err) { return done(err); }
          var body = JSON.parse(response.body);
          assert.equal(body.category, 'shirts');
          assert.equal(body.size, 'large');
          done();
        });
      });
    });

    describe('should be case-insensitive', function() {

      before(function() {
        httpHelper.writeRoutes({
          'get /testRoute': {
            action: 'test/verb'
          }
        });
      });

      it('', function(done) {
        httpHelper.testRoute('get', 'tEStrOutE', function(err, response) {
          if (err) { return done(err); }

          assert(response.body === 'get', Err.badResponse(response));
          done();
        });
      });
    });

    describe('should accept case-insensitive controller key', function() {

      before(function() {
        httpHelper.writeRoutes({
          'get /testRoute': {
            action: 'tEsT/verb'
          }
        });
      });

      it('', function(done) {
        httpHelper.testRoute('get', 'testRoute', function(err, response) {
          if (err) { return done(err); }

          assert(response.body === 'get', Err.badResponse(response));
          done();
        });
      });
    });

    describe('should accept case-insensitive action key', function() {

      before(function(){
        httpHelper.writeRoutes({
          'get /testRoute': {
            action: 'test/capiTalleTTers'
          }
        });
      });

      it('', function(done) {
        httpHelper.testRoute('get', 'testRoute', function(err, response) {
          if (err) { return done(err); }

          assert(response.body === 'CapitalLetters', Err.badResponse(response));
          done();
        });
      });
    });

    describe('regex routes - get r|^/\\\\d+/(\\\\w+)/(\\\\w+)$|foo,bar', function() {

      before(function(){
        require('fs').writeFileSync('config/routes.js', 'module.exports.routes = {"r|^/\\\\d+/(\\\\w+)/(\\\\w+)$|foo,bar": function(req,res){res.json({foo:req.param("foo"),bar:req.param("bar")});}};');
      });

      it('should match /123/abc/def and put "abc" and "def" in "foo" and "bar" params', function(done) {
        httpHelper.testRoute('get', '123/abc/def', function(err, response) {
          if (err) { return done(err); }
          var body = JSON.parse(response.body);
          assert(body.foo==='abc', Err.badResponse(response));
          assert(body.bar==='def', Err.badResponse(response));
          done();
        });

      });

      it('should match /9/fizzle/fazzle and put "fizzle" and "fazzle" in "foo" and "bar" params', function(done) {
        httpHelper.testRoute('get', '9/fizzle/fazzle', function(err, response) {
          if (err) {return done(new Error(err));}
          var body = JSON.parse(response.body);
          try {
            assert.equal(body.foo, 'fizzle', Err.badResponse(response));
            assert.equal(body.bar, 'fazzle', Err.badResponse(response));
          }
          catch (e) { return done(e); }
          done();
        });

      });

    });

    describe('skipAssets', function() {

      before(function(){
        httpHelper.writeRoutes({
          '/*': {
            skipAssets: true,
            action: 'test/index'
          }
        });
      });

      it('should match /foo', function(done) {

        httpHelper.testRoute('get', 'foo', function(err, response) {
          if (err) { return done(new Error(err)); }
          try { assert.equal(response.body, 'index', Err.badResponse(response)); }
          catch (e) { return done(e); }
          done();
        });

      });

      it('should match /foo?abc=1.2.3', function(done) {

        httpHelper.testRoute('get', 'foo?abc=1.2.3', function(err, response) {
          if (err) { return done(err); }
          try { assert.equal(response.body, 'index', Err.badResponse(response)); }
          catch (e) { return done(e); }
          done();
        });

      });

      it('should match /foo.bar/baz?abc=1.2.3', function(done) {

        httpHelper.testRoute('get', 'foo.bar/baz?abc=1.2.3', function(err, response) {
          if (err) { return done(err); }
          try { assert.equal(response.body, 'index', Err.badResponse(response)); }
          catch (e) { return done(e); }
          done();
        });

      });

      it('should not match /foo.js', function(done) {

        httpHelper.testRoute('get', 'foo.js', function(err, response) {
          if (err) { return done(err); }
          assert(response.statusCode === 404, Err.badResponse(response));
          done();
        });

      });

      it('should not match /js/dependencies/pretend.js', function(done) {

        httpHelper.testRoute('get', 'js/dependencies/pretend.js', function(err, response) {
          if (err) { return done(err); }
          assert(response.statusCode === 404, Err.badResponse(response));
          done();
        });

      });

      it('should not match /js/dependencies/pretend.io.js', function(done) {

        httpHelper.testRoute('get', 'js/dependencies/pretend.io.js', function(err, response) {
          if (err) { return done(err); }
          assert(response.statusCode === 404, Err.badResponse(response));
          done();
        });

      });

      it('should not match /styles/pretendporter.css', function(done) {

        httpHelper.testRoute('get', 'styles/pretendporter.css', function(err, response) {
          if (err) { return done(err); }
          assert(response.statusCode === 404, Err.badResponse(response));
          done();
        });

      });

      it('should not match /foo.bar/foo.js', function(done) {

        httpHelper.testRoute('get', 'foo.js', function(err, response) {
          if (err) { return done(err); }
          assert(response.statusCode === 404, Err.badResponse(response));
          done();
        });

      });

    });

    describe('skipRegex /abc/', function() {

      before(function(){
        var ROUTES_FILE_CONTENTS = 'module.exports.routes = {\'/*\': {skipRegex: /abc/,action: \'test/index\'}};';
        require('fs').writeFileSync('config/routes.js', ROUTES_FILE_CONTENTS);
      });

      it('should match /foo', function(done) {

        httpHelper.testRoute('get', 'foo', function(err, response) {
          if (err) { return done(err); }
          try { assert.equal(response.body, 'index', Err.badResponse(response)); }
          catch (e) { return done(e); }
          done();
        });

      });

      it('should not match /fooabcbar', function(done) {

        httpHelper.testRoute('get', 'fooabcbar', function(err, response) {
          if (err) { return done(err); }
          assert(response.statusCode === 404, Err.badResponse(response));
          done();
        });

      });

    });

    describe('skipRegex [/abc/, /def/]', function() {

      before(function(){
        require('fs').writeFileSync('config/routes.js', 'module.exports.routes = {\'/*\': {skipRegex: [/abc/,/def/],action: \'test/index\'}};');
      });

      it('should match /foo', function(done) {

        httpHelper.testRoute('get', 'foo', function(err, response) {
          if (err) { return done(err); }
          try { assert.equal(response.body, 'index', Err.badResponse(response)); }
          catch (e) { return done(e); }
          done();
        });

      });

      it('should not match /fooabcbar', function(done) {

        httpHelper.testRoute('get', 'fooabcbar', function(err, response) {
          if (err) { return done(err); }
          assert(response.statusCode === 404, Err.badResponse(response));
          done();
        });

      });

      it('should not match /foodefbar', function(done) {

        httpHelper.testRoute('get', 'foodefbar', function(err, response) {
          if (err) { return done(err); }
          assert(response.statusCode === 404, Err.badResponse(response));
          done();
        });

      });

    });

    if (Number(process.version.match(/^v(\d+\.\d+)/)[1]) >= 7.6) {

      describe('Async route handlers :: ', function() {

        describe('ad-hoc functions', function() {

          before(function() {
            require('fs').writeFileSync('config/routes.js', 'module.exports.routes = {"/testasync": async function(req, res, next) { throw new Error("foo!"); } }');
          });

          it('should handle uncaught promises correctly', function(done) {
            httpHelper.testRoute('get', 'testasync', function(err, response) {
              if (err) { return done(err); }
              assert(response.statusCode === 500);
              done();
            });

          });

        });

        describe('actions', function() {

          before(function() {
            require('fs').writeFileSync('config/routes.js', 'module.exports.routes = {"/testasyncerror": "asynctesterr", "/testasyncok": "asynctestok" }');
            require('fs').writeFileSync('api/controllers/asynctesterr.js', 'module.exports = async function(req, res, next) { throw new Error("foo!"); }');
            require('fs').writeFileSync('api/controllers/asynctestok.js', 'module.exports = async function(req, res, next) { var dumb = function() { return new Promise (function(resolve, reject) { setTimeout(function(){ return resolve("foo")}, 100);}); }; var val = await dumb();  return res.send(val) }');
          });

          it('should handle responses correctly', function(done) {
            httpHelper.testRoute('get', 'testasyncok', function(err, response) {
              if (err) { return done(err); }
              assert(response.statusCode === 200);
              assert(response.body === 'foo');
              done();
            });

          });

          it('should handle uncaught promises correctly', function(done) {
            httpHelper.testRoute('get', 'testasyncerror', function(err, response) {
              if (err) { return done(err); }
              assert(response.statusCode === 500);
              done();
            });

          });

        });


      });


    }


  });
});
