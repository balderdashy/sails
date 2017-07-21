/**
 * Module dependencies
 */
var supertest = require('supertest');
var assert = require('assert');

var $Sails = require('../helpers/sails');
var $Router = require('../helpers/router');

// Middleware fixtures
var RESPOND = require('../fixtures/middleware');


describe('Router.bind', function() {

  var sails = $Sails.load.withAllHooksDisabled();

  it('Should not allow routes with :length as a parameter', function() {
    assert.throws(function() {
      this.sails.router.bind('get /foo/:length', RESPOND.HELLO);
    });
    assert.throws(function() {
      this.sails.router.bind('get /foo/:length/foo', RESPOND.HELLO);
    });
  });

  $Router.bind('get /foo', RESPOND.HELLO)
    .expectBoundRoute({
      path: '/foo',
      method: 'get'
    })
    .test(function() {
      $Router.bind('get /FOO', RESPOND.GOODBYE)
        .expectBoundRoute({
          path: '/FOO',
          method: 'get'
        }).test(function() {
          it('should send expected response (get /foo)', function(done) {
            this.sails.request({
              url: '/foo',
              method: 'get'
            }, function(err, res, body) {
              if (err) {
                return done(err);
              }
              res.statusCode.should.be.equal(200);
              body.should.be.equal('hello world!');
              return done();
            });
          });
          it('router should not be case-sensitive', function(done) {
            this.sails.request({
              url: '/FOO',
              method: 'get'
            }, function(err, res, body) {
              if (err) {
                return done(err);
              }
              res.statusCode.should.be.equal(200);
              body.should.be.equal('hello world!');
              return done();
            });
          });
        });
    });

  $Router.bind('get /footarg', {
      target: RESPOND.HELLO
    })
    .expectBoundRoute({
      path: '/footarg',
      method: 'get'
    })
    .test(function() {
      it('should send expected response (get /footarg)', function(done) {
        this.sails.request({
          url: '/footarg',
          method: 'get'
        }, function(err, res, body) {
          if (err) {
            return done(err);
          }
          res.statusCode.should.be.equal(200);
          body.should.be.equal('hello world!');
          return done();
        });
      });
    });

  $Router.bind('get /foofn', {
      fn: RESPOND.HELLO
    })
    .expectBoundRoute({
      path: '/foofn',
      method: 'get'
    })
    .test(function() {
      it('should send expected response (get /foofn)', function(done) {
        this.sails.request({
          url: '/foofn',
          method: 'get'
        }, function(err, res, body) {
          if (err) {
            return done(err);
          }
          res.statusCode.should.be.equal(200);
          body.should.be.equal('hello world!');
          return done();
        });
      });
    });


  $Router.bind('/bar', RESPOND.HELLO)
    .expectBoundRoute({
      path: '/bar',
      method: 'get'
    })
    .expectBoundRoute({
      path: '/bar',
      method: 'put'
    })
    .expectBoundRoute({
      path: '/bar',
      method: 'post'
    })
    .expectBoundRoute({
      path: '/bar',
      method: 'patch'
    })
    .expectBoundRoute({
      path: '/bar',
      method: 'delete'
    })
    .test(function() {
      it('should send expected response (get /bar)', function(done) {
        this.sails.request({
          url: '/bar',
          method: 'get'
        }, function(err, res, body) {
          if (err) {
            return done(err);
          }
          res.statusCode.should.be.equal(200);
          body.should.be.equal('hello world!');
          return done();
        });
      });
    })
    .test(function() {
      it('should send expected response (post /bar)', function(done) {
        this.sails.request({
          url: '/bar',
          method: 'post'
        }, function(err, res, body) {
          if (err) {
            return done(err);
          }
          res.statusCode.should.be.equal(200);
          body.should.be.equal('hello world!');
          return done();
        });
      });
    })
    .test(function() {
      it('should send expected response (put /bar)', function(done) {
        this.sails.request({
          url: '/bar',
          method: 'put'
        }, function(err, res, body) {
          if (err) {
            return done(err);
          }
          res.statusCode.should.be.equal(200);
          body.should.be.equal('hello world!');
          return done();
        });
      });
    })
    .test(function() {
      it('should send expected response (delete /bar)', function(done) {
        this.sails.request({
          url: '/bar',
          method: 'delete'
        }, function(err, res, body) {
          if (err) {
            return done(err);
          }
          res.statusCode.should.be.equal(200);
          body.should.be.equal('hello world!');
          return done();
        });
      });
    })
    .test(function() {
      it('should send expected response (patch /bar)', function(done) {
        this.sails.request({
          url: '/bar',
          method: 'patch'
        }, function(err, res, body) {
          if (err) {
            return done(err);
          }
          res.statusCode.should.be.equal(200);
          body.should.be.equal('hello world!');
          return done();
        });
      });
    })
    .test(function() {
      it('should send expected response (options /bar)', function(done) {
        var sails = this.sails;
        this.sails.request({
          url: '/bar',
          method: 'options'
        }, function(err, res, body) {
          // console.dir(sails.router._privateRouter, {depth: null});
          if (err) {
            return done(err);
          }
          res.statusCode.should.be.equal(200);
          return done();
        });
      });
    })
    .test(function() {
      it('should send a 404 response (copy /bar)', function(done) {
        this.sails.request({
          url: '/bar',
          method: 'copy'
        }, function(err, res, body) {
          err.status.should.be.equal(404);
          return done();
        });
      });
    });

  $Router.bind('all /boop', RESPOND.HELLO)
    .expectBoundRoute({
      path: '/boop',
      method: 'get'
    })
    .expectBoundRoute({
      path: '/boop',
      method: 'put'
    })
    .expectBoundRoute({
      path: '/boop',
      method: 'post'
    })
    .expectBoundRoute({
      path: '/boop',
      method: 'patch'
    })
    .expectBoundRoute({
      path: '/boop',
      method: 'delete'
    })
    .test(function() {
      it('should send expected response (get /boop)', function(done) {
        this.sails.request({
          url: '/boop',
          method: 'get'
        }, function(err, res, body) {
          if (err) {
            return done(err);
          }
          res.statusCode.should.be.equal(200);
          body.should.be.equal('hello world!');
          return done();
        });
      });
    })
    .test(function() {
      it('should send expected response (post /boop)', function(done) {
        this.sails.request({
          url: '/boop',
          method: 'post'
        }, function(err, res, body) {
          if (err) {
            return done(err);
          }
          res.statusCode.should.be.equal(200);
          body.should.be.equal('hello world!');
          return done();
        });
      });
    })
    .test(function() {
      it('should send expected response (put /boop)', function(done) {
        this.sails.request({
          url: '/boop',
          method: 'put'
        }, function(err, res, body) {
          if (err) {
            return done(err);
          }
          res.statusCode.should.be.equal(200);
          body.should.be.equal('hello world!');
          return done();
        });
      });
    })
    .test(function() {
      it('should send expected response (delete /boop)', function(done) {
        this.sails.request({
          url: '/boop',
          method: 'delete'
        }, function(err, res, body) {
          if (err) {
            return done(err);
          }
          res.statusCode.should.be.equal(200);
          body.should.be.equal('hello world!');
          return done();
        });
      });
    })
    .test(function() {
      it('should send expected response (patch /boop)', function(done) {
        this.sails.request({
          url: '/boop',
          method: 'patch'
        }, function(err, res, body) {
          if (err) {
            return done(err);
          }
          res.statusCode.should.be.equal(200);
          body.should.be.equal('hello world!');
          return done();
        });
      });
    })
    .test(function() {
      it('should send expected response (options /boop)', function(done) {
        this.sails.request({
          url: '/boop',
          method: 'options'
        }, function(err, res, body) {
          if (err) {
            return done(err);
          }
          res.statusCode.should.be.equal(200);
          body.should.be.equal('hello world!');
          return done();
        });
      });
    })
    .test(function() {
      it('should send expected response (options /boop)', function(done) {
        this.sails.request({
          url: '/boop',
          method: 'copy'
        }, function(err, res, body) {
          if (err) {
            return done(err);
          }
          res.statusCode.should.be.equal(200);
          body.should.be.equal('hello world!');
          return done();
        });
      });
    });


  $Router.bind('options /blap', RESPOND.GOODBYE)
    .expectBoundRoute({
      path: '/boop',
      method: 'options'
    })
    .test(function() {
      it('should send expected response (options /blap)', function(done) {
        this.sails.request({
          url: '/blap',
          method: 'options'
        }, function(err, res, body) {
          if (err) {
            return done(err);
          }
          res.statusCode.should.be.equal(200);
          body.should.be.equal('goodbye world!');
          return done();
        });
      });
    });


  $Router.bind('post /bar_baz_beezzz', RESPOND.HELLO_500)
    .expectBoundRoute({
      path: '/bar_baz_beezzz',
      method: 'post'
    })
    .test(function() {
      it('should send expected response (post /bar_baz_beezzz)', function(done) {
        this.sails.request({
          url: '/bar_baz_beezzz',
          method: 'post'
        }, function(err, res, body) {
          err.status.should.be.equal(500);
          err.body.should.be.equal('hello world!');
          return done();
        });
      });
    });



  $Router.bind('patch /user', RESPOND.JSON_HELLO)
    .expectBoundRoute({
      path: '/user',
      method: 'patch'
    })
    .test(function() {
      it('should send expected response (patch /user)', function(done) {
        this.sails.request({
          url: '/user',
          method: 'patch'
        }, function(err, res, body) {
          if (err) {
            return done(err);
          }
          res.statusCode.should.be.equal(200);
          body.should.be.instanceOf(Object);
          body.hello.should.be.equal('world');
          return done();
        });
      });
    });

  $Router.bind('   /whitespace1 ', RESPOND.JSON_HELLO)
    .expectBoundRoute({
      path: '/whitespace1',
      method: 'get'
    })
    .test(function() {
      it('should send expected response (get /whitespace1)', function(done) {
        this.sails.request({
          url: '/whitespace1',
          method: 'get'
        }, function(err, res, body) {
          if (err) {
            return done(err);
          }
          res.statusCode.should.be.equal(200);
          body.should.be.instanceOf(Object);
          body.hello.should.be.equal('world');
          return done();
        });
      });
    });

  $Router.bind('  GET   /whitespace2 ', RESPOND.JSON_HELLO)
    .expectBoundRoute({
      path: '/whitespace',
      method: 'get'
    })
    .test(function() {
      it('should send expected response (get /whitespace2)', function(done) {
        this.sails.request({
          url: '/whitespace2',
          method: 'get'
        }, function(err, res, body) {
          if (err) {
            return done(err);
          }
          res.statusCode.should.be.equal(200);
          body.should.be.instanceOf(Object);
          body.hello.should.be.equal('world');
          return done();
        });
      });
      it('should send 404 response (put /whitespace2)', function(done) {
        this.sails.request({
          url: '/whitespace2',
          method: 'put'
        }, function(err, res, body) {
          if (err && err.status === 404) {
            return done();
          } else if (err) {
            return done(err);
          } else {
            return done(new Error('Should have returned 404!'));
          }
        });
      });

    });


  $Router
    .test(function() {
      it('should respond with 404 handler', function(done) {
        this.sails.request({
          url: '/something_undefined',
          method: 'get'
        }, function(err, res, body) {
          err.status.should.be.equal(404);
          return done();
        });
      });
    });


  $Router.bind('post /something_that_throws', RESPOND.SOMETHING_THAT_THROWS)
    .test(function() {
      it('should respond with 500 handler if something throws', function(done) {
        this.sails.request({
          url: '/something_that_throws',
          method: 'post'
        }, function(err, res, body) {
          err.status.should.be.equal(500);
          return done();
        });
      });
    });

});
