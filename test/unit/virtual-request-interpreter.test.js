/**
 * Module dependencies
 */

var assert = require('assert');
var $Sails = require('../helpers/sails');


describe.only('virtual request interpreter', function (){

  var app = $Sails.load({
    globals: false,
    log: { level: 'silent' },
    loadHooks: [
      'moduleloader',
      'userconfig',
      'responses'
    ]
  });


  describe('res.redirect()', function (){

    it('should support creamy vanilla usage', function (done) {
      app.get('/res_redirect/1', function (req, res) {
        return res.redirect('/foo/bar');
      });
      app.request('GET /res_redirect/1', {}, function (err, resp, data) {
        assert(!err, err);
        assert.deepEqual(resp.headers.Location, '/foo/bar');
        assert.deepEqual(302, resp.statusCode);
        done();
      });
    });

    it('should honor .status()', function (done) {
      app.get('/res_redirect/2', function (req, res) {
        return res.status(301).redirect('/foo/baz');
      });
      app.request('GET /res_redirect/2', {}, function (err, resp, data) {
        assert(!err, err);
        assert.deepEqual(resp.headers.Location, '/foo/baz');
        assert.deepEqual(301, resp.statusCode);
        done();
      });
    });

    it('should NO LONGER ALLOW a status code to be passed as the first argument', function (done) {
      app.get('/res_redirect/3', function (req, res) {
        try {
          return res.redirect(301, '/foo/baz');
        } catch(e) {
          // Go ahead and throw this again on purpose (so that we test the rest
          // of the unhandled error flow for the VR interpreter)
          throw e;
        }
      });
      app.request('GET /res_redirect/3', {}, function (err, resp, data) {
        try {
          assert(err);
          assert(err.message.match(/Error: The 2\-ary usage of \`res\.redirect\(\)\` is no longer supported/), 'Unexpected error message: '+err.message);
        } catch (e) { return done(e); }
        return done();
      });
    });

    it('should NO LONGER ALLOW the status code being passed in as the second argument EITHER', function (done) {
      app.get('/res_redirect/4', function (req, res) {
        try {
          return res.redirect('/foo/baz', 301);
        } catch(e) {
          // Go ahead and throw this again on purpose (so that we test the rest
          // of the unhandled error flow for the VR interpreter)
          throw e;
        }
      });
      app.request('GET /res_redirect/4', {}, function (err, resp, data) {
        try {
          assert(err);
          assert(err.message.match(/Error: The 2\-ary usage of \`res\.redirect\(\)\` is no longer supported/), 'Unexpected error message: '+err.message);
        } catch (e) { return done(e); }
        return done();
      });
    });

  });//</describe: res.redirect()>




  describe('sending back a number', function (){
    describe('using res.send()', function (){
      it('should be the body, and NOT interpreted as a status code', function (done) {
        app.get('/res_sending_back_a_number/1', function (req, res) {
          return res.send(45);
        });
        app.request('GET /res_sending_back_a_number/1', {}, function (err, resp, data) {
          try {
            assert(!err, err);
            assert.deepEqual(200, resp.statusCode);
            assert.strictEqual(resp.body, 45);
            assert.strictEqual(data, 45);
          } catch (e) { return done(e); }
          done();
        });
      });
    });//</describe using res.send()>
    describe('using res.json()', function (){
      it('should be the body, and NOT interpreted as a status code', function (done) {
        app.get('/res_sending_back_a_number/2', function (req, res) {
          return res.json(45);
        });
        app.request('GET /res_sending_back_a_number/2', {}, function (err, resp, data) {
          try {
            assert(!err, err);
            assert.deepEqual(200, resp.statusCode);
            assert.strictEqual(resp.body, 45);
            assert.strictEqual(data, 45);
          } catch (e) { return done(e); }
          done();
        });
      });

      it('should stay a string, if it was wrapped in quotes', function (done) {
        app.get('/res_sending_back_a_number/3', function (req, res) {
          return res.json('45');
        });
        app.request('GET /res_sending_back_a_number/3', {}, function (err, resp, data) {
          try {
            assert(!err, err);
            assert.deepEqual(200, resp.statusCode);
            assert.strictEqual(resp.body, '45');
            assert.strictEqual(data, '45');
          } catch (e) { return done(e); }
          done();
        });
      });
    });//</describe using res.json()>
  });//</describe: sending back a number >



  describe('sending back a boolean', function (){
    describe('using res.send()', function (){
      describe('`true`', function (){
        it('should be the body', function (done) {
          app.get('/res_sending_back_a_boolean/1', function (req, res) {
            return res.send(true);
          });
          app.request('GET /res_sending_back_a_boolean/1', {}, function (err, resp, data) {
            try {
              assert(!err, err);
              assert.deepEqual(200, resp.statusCode);
              assert.strictEqual(resp.body, true);
              assert.strictEqual(data, true);
            } catch (e) { return done(e); }
            done();
          });
        });
      });//</describe: `true`>
      describe('`false`', function (){
        it('should be the body', function (done) {
          app.get('/res_sending_back_a_boolean/2', function (req, res) {
            return res.send(false);
          });
          app.request('GET /res_sending_back_a_boolean/2', {}, function (err, resp, data) {
            try {
              assert(!err, err);
              assert.deepEqual(200, resp.statusCode);
              assert.strictEqual(resp.body, false);
              assert.strictEqual(data, false);
            } catch (e) { return done(e); }
            done();
          });
        });
      });//</describe: `false`>
    });//</describe using res.send()>
    describe('using res.json()', function (){
      describe('`true`', function (){
        it('should be the body', function (done) {
          app.get('/res_sending_back_a_boolean/3', function (req, res) {
            return res.json(true);
          });
          app.request('GET /res_sending_back_a_boolean/3', {}, function (err, resp, data) {
            try {
              assert(!err, err);
              assert.deepEqual(200, resp.statusCode);
              assert.strictEqual(resp.body, true);
              assert.strictEqual(data, true);
            } catch (e) { return done(e); }
            done();
          });
        });

        it('should stay a string, if it was wrapped in quotes', function (done) {
          app.get('/res_sending_back_a_boolean/4', function (req, res) {
            return res.json('true');
          });
          app.request('GET /res_sending_back_a_boolean/4', {}, function (err, resp, data) {
            try {
              assert(!err, err);
              assert.deepEqual(200, resp.statusCode);
              assert.strictEqual(resp.body, 'true');
              assert.strictEqual(data, 'true');
            } catch (e) { return done(e); }
            done();
          });
        });
      });//</describe: `true`>
      describe('`false`', function (){
        it('should be the body', function (done) {
          app.get('/res_sending_back_a_boolean/5', function (req, res) {
            return res.json(false);
          });
          app.request('GET /res_sending_back_a_boolean/5', {}, function (err, resp, data) {
            try {
              assert(!err, err);
              assert.deepEqual(200, resp.statusCode);
              assert.strictEqual(resp.body, false);
              assert.strictEqual(data, false);
            } catch (e) { return done(e); }
            done();
          });
        });

        it('should stay a string, if it was wrapped in quotes', function (done) {
          app.get('/res_sending_back_a_boolean/6', function (req, res) {
            return res.json('false');
          });
          app.request('GET /res_sending_back_a_boolean/6', {}, function (err, resp, data) {
            try {
              assert(!err, err);
              assert.deepEqual(200, resp.statusCode);
              assert.strictEqual(resp.body, 'false');
              assert.strictEqual(data, 'false');
            } catch (e) { return done(e); }
            done();
          });
        });
      });//</describe: `false`>

    });//</describe using res.json()>
  });//</describe: sending back a boolean >

});//</describe: VR interpreter>
