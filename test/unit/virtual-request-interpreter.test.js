/**
 * Module dependencies
 */

var assert = require('assert');
var $Sails = require('../helpers/sails');


describe('virtual request interpreter', function (){

  var app = $Sails.load({
    globals: false,
    log: { level: 'silent' },
    loadHooks: [
      'moduleloader',
      'userconfig',
      'responses'
    ]
  });


  //  ██████╗ ███████╗███████╗   ██████╗ ███████╗██████╗ ██╗██████╗ ███████╗ ██████╗████████╗ ██╗██╗
  //  ██╔══██╗██╔════╝██╔════╝   ██╔══██╗██╔════╝██╔══██╗██║██╔══██╗██╔════╝██╔════╝╚══██╔══╝██╔╝╚██╗
  //  ██████╔╝█████╗  ███████╗   ██████╔╝█████╗  ██║  ██║██║██████╔╝█████╗  ██║        ██║   ██║  ██║
  //  ██╔══██╗██╔══╝  ╚════██║   ██╔══██╗██╔══╝  ██║  ██║██║██╔══██╗██╔══╝  ██║        ██║   ██║  ██║
  //  ██║  ██║███████╗███████║██╗██║  ██║███████╗██████╔╝██║██║  ██║███████╗╚██████╗   ██║   ╚██╗██╔╝
  //  ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝╚═╝  ╚═╝╚══════╝╚═════╝ ╚═╝╚═╝  ╚═╝╚══════╝ ╚═════╝   ╚═╝    ╚═╝╚═╝
  //
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







  //  ██████╗ ███████╗███████╗   ███████╗███████╗███╗   ██╗██████╗  ██╗██╗        ██╗
  //  ██╔══██╗██╔════╝██╔════╝   ██╔════╝██╔════╝████╗  ██║██╔══██╗██╔╝╚██╗       ██║
  //  ██████╔╝█████╗  ███████╗   ███████╗█████╗  ██╔██╗ ██║██║  ██║██║  ██║    ████████╗
  //  ██╔══██╗██╔══╝  ╚════██║   ╚════██║██╔══╝  ██║╚██╗██║██║  ██║██║  ██║    ██╔═██╔═╝
  //  ██║  ██║███████╗███████║██╗███████║███████╗██║ ╚████║██████╔╝╚██╗██╔╝    ██████║
  //  ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝╚══════╝╚══════╝╚═╝  ╚═══╝╚═════╝  ╚═╝╚═╝     ╚═════╝
  //
  //  ██████╗ ███████╗███████╗        ██╗███████╗ ██████╗ ███╗   ██╗ ██╗██╗
  //  ██╔══██╗██╔════╝██╔════╝        ██║██╔════╝██╔═══██╗████╗  ██║██╔╝╚██╗
  //  ██████╔╝█████╗  ███████╗        ██║███████╗██║   ██║██╔██╗ ██║██║  ██║
  //  ██╔══██╗██╔══╝  ╚════██║   ██   ██║╚════██║██║   ██║██║╚██╗██║██║  ██║
  //  ██║  ██║███████╗███████║██╗╚█████╔╝███████║╚██████╔╝██║ ╚████║╚██╗██╔╝
  //  ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝ ╚════╝ ╚══════╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═╝╚═╝
  //
  // For reference, here is the actual behavior when testing w/ express over http:
  // ```
  // return res.send();       // 122b
  // return res.send('');     // 200b (empty body, content length ==> 0)
  // return res.send(0);      // XXXXXXXX WARNING (because deprecated usage-- it sees it as status code only)
  // return res.send(null);   // 163b   (empty body, content length ==> 0)
  // return res.send(false);  // 215b  (sends down the string `false`, content len ==> 5)
  // return res.send(true);   // same as false basically
  // return res.send(45);     // XXXXXXXX WARNING (because deprecated usage-- it sees it as status code only)
  // return res.send("");     // exactly like `''` above
  //
  // return res.json();       // 154b
  // return res.json('');     // 212b (body is `""`- content length ==> 2)
  // return res.json(0);      // (content length ==> 1)
  // return res.json(null);   // null - 214b   (empty body, content length ==> 4)
  // return res.json('null'); // "null" -> 216b   (empty body, content length ==> 6)
  // return res.json(false);  // 215b  (sends down the string `false`, content len ==> 5)
  // return res.json(true);   // same as false basically
  // return res.json(45);     // 212b (content length ==> 2)
  // return res.json('45');   // "45" content len ==> 4
  // return res.json("");     // exactly like `''` above
  // ```


  describe('sending back a string', function (){
    describe('using res.send()', function (){
      it('should be the body', function (done) {
        app.get('/res_sending_back_a_string/1', function (req, res) {
          return res.send('foo');
        });
        app.request('GET /res_sending_back_a_string/1', {}, function (err, resp, data) {
          try {
            assert(!err, err);
            assert.deepEqual(200, resp.statusCode);
            assert.strictEqual(resp.body, 'foo');
            assert.strictEqual(data, 'foo');
          } catch (e) { return done(e); }
          done();
        });
      });
      it('should be the body, even if it is empty string', function (done) {
        app.get('/res_sending_back_a_string/1/B', function (req, res) {
          return res.send('');
        });
        app.request('GET /res_sending_back_a_string/1/B', {}, function (err, resp, data) {
          try {
            assert(!err, err);
            assert.deepEqual(200, resp.statusCode);
            assert.strictEqual(resp.body, undefined);
            assert.strictEqual(data, undefined);
          } catch (e) { return done(e); }
          done();
        });
      });
    });//</describe using res.send()>
    describe('using res.json()', function (){
      it('should be the body', function (done) {
        app.get('/res_sending_back_a_string/2', function (req, res) {
          return res.json('foo');
        });
        app.request('GET /res_sending_back_a_string/2', {}, function (err, resp, data) {
          try {
            assert(!err, err);
            assert.deepEqual(200, resp.statusCode);
            assert.strictEqual(resp.body, 'foo');
            assert.strictEqual(data, 'foo');
          } catch (e) { return done(e); }
          done();
        });
      });
      it('should be the body, even if empty string', function (done) {
        app.get('/res_sending_back_a_string/2/B', function (req, res) {
          return res.json('');
        });
        app.request('GET /res_sending_back_a_string/2/B', {}, function (err, resp, data) {
          try {
            assert(!err, err);
            assert.deepEqual(200, resp.statusCode);
            assert.strictEqual(resp.body, '');
            assert.strictEqual(data, '');
          } catch (e) { return done(e); }
          done();
        });
      });

      it('should stay wrapped in quotes if it was wrapped in quotes', function (done) {
        app.get('/res_sending_back_a_string/3', function (req, res) {
          return res.json('"foo"');
        });
        app.request('GET /res_sending_back_a_string/3', {}, function (err, resp, data) {
          try {
            assert(!err, err);
            assert.deepEqual(200, resp.statusCode);
            assert.strictEqual(resp.body, '"foo"');
            assert.strictEqual(data, '"foo"');
          } catch (e) { return done(e); }
          done();
        });
      });

      it('should stay wrapped in quotes if it was wrapped in quotes, even if it empty string wrapped in quotes', function (done) {
        app.get('/res_sending_back_a_string/3/b', function (req, res) {
          return res.json('""');
        });
        app.request('GET /res_sending_back_a_string/3/b', {}, function (err, resp, data) {
          try {
            assert(!err, err);
            assert.deepEqual(200, resp.statusCode);
            assert.strictEqual(resp.body, '""');
            assert.strictEqual(data, '""');
          } catch (e) { return done(e); }
          done();
        });
      });
    });//</describe using res.json()>
  });//</describe: sending back a string >


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
      it('should be the body, and NOT interpreted as a status code, even when zero is used', function (done) {
        app.get('/res_sending_back_a_number/1/B', function (req, res) {
          return res.send(0);
        });
        app.request('GET /res_sending_back_a_number/1/B', {}, function (err, resp, data) {
          try {
            assert(!err, err);
            assert.deepEqual(200, resp.statusCode);
            assert.strictEqual(resp.body, 0);
            assert.strictEqual(data, 0);
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

      it('should be the body, and NOT interpreted as a status code, even when zero is used', function (done) {
        app.get('/res_sending_back_a_number/2/B', function (req, res) {
          return res.json(0);
        });
        app.request('GET /res_sending_back_a_number/2/B', {}, function (err, resp, data) {
          try {
            assert(!err, err);
            assert.deepEqual(200, resp.statusCode);
            assert.strictEqual(resp.body, 0);
            assert.strictEqual(data, 0);
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

      it('should stay a string, if it was wrapped in quotes, even if it is zero', function (done) {
        app.get('/res_sending_back_a_number/3/B', function (req, res) {
          return res.json('0');
        });
        app.request('GET /res_sending_back_a_number/3/B', {}, function (err, resp, data) {
          try {
            assert(!err, err);
            assert.deepEqual(200, resp.statusCode);
            assert.strictEqual(resp.body, '0');
            assert.strictEqual(data, '0');
          } catch (e) { return done(e); }
          done();
        });
      });
    });//</describe using res.json()>
  });//</describe: sending back a number >





  describe('sending back `null`', function (){
    describe('using res.send()', function (){
      it('should be the body', function (done) {
        app.get('/res_sending_back_the_null_literal/1', function (req, res) {
          return res.send(null);
        });
        app.request('GET /res_sending_back_the_null_literal/1', {}, function (err, resp, data) {
          try {
            assert(!err, err);
            assert.deepEqual(200, resp.statusCode);
            assert.strictEqual(resp.body, null);
            assert.strictEqual(data, null);
          } catch (e) { return done(e); }
          done();
        });
      });
    });//</describe using res.send()>
    describe('using res.json()', function (){
      it('should be the body', function (done) {
        app.get('/res_sending_back_the_null_literal/2', function (req, res) {
          return res.json(null);
        });
        app.request('GET /res_sending_back_the_null_literal/2', {}, function (err, resp, data) {
          try {
            assert(!err, err);
            assert.deepEqual(200, resp.statusCode);
            assert.strictEqual(resp.body, null);
            assert.strictEqual(data, null);
          } catch (e) { return done(e); }
          done();
        });
      });

      it('should stay a string, if it was wrapped in quotes', function (done) {
        app.get('/res_sending_back_the_null_literal/3', function (req, res) {
          return res.json('null');
        });
        app.request('GET /res_sending_back_the_null_literal/3', {}, function (err, resp, data) {
          try {
            assert(!err, err);
            assert.deepEqual(200, resp.statusCode);
            assert.strictEqual(resp.body, 'null');
            assert.strictEqual(data, 'null');
          } catch (e) { return done(e); }
          done();
        });
      });
    });//</describe using res.json()>
  });//</describe: sending back `null` >



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
