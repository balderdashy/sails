/**
 * Module dependencies
 */
var supertest = require('supertest');

var $Sails = require('../helpers/sails');
var $Router = require('../helpers/router');

// Middleware fixtures
var RESPOND = require('../fixtures/middleware');


describe('Router.bind', function() {

  var sails = $Sails.load.withAllHooksDisabled();



  $Router.bind('get /foo', RESPOND.HELLO)
    .expectBoundRoute({
      path: '/foo',
      method: 'get'
    })
    .test(function() {
      it('should send expected response (get /foo)', function(done) {
        supertest(this.sails.router._privateRouter)
          .get('/foo')
          .expect(200, 'hello world!')
          .end(done);
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
        supertest(this.sails.router._privateRouter)
          .get('/bar')
          .expect(200, 'hello world!')
          .end(done);
      });
    })
    .test(function() {
      it('should send expected response (post /bar)', function(done) {
        supertest(this.sails.router._privateRouter)
          .post('/bar')
          .expect(200, 'hello world!')
          .end(done);
      });
    })
    .test(function() {
      it('should send expected response (put /bar)', function(done) {
        supertest(this.sails.router._privateRouter)
          .put('/bar')
          .expect(200, 'hello world!')
          .end(done);
      });
    })
    .test(function() {
      it('should send expected response (delete /bar)', function(done) {
        supertest(this.sails.router._privateRouter)
          .del('/bar')
          .expect(200, 'hello world!')
          .end(done);
      });
    })
    .test(function() {
      it('should send expected response (patch /bar)', function(done) {
        supertest(this.sails.router._privateRouter)
          .patch('/bar')
          .expect(200, 'hello world!')
          .end(done);
      });
    })
    .test(function() {
      it('should send expected response (options /bar)', function(done) {
        supertest(this.sails.router._privateRouter)
          .options('/bar')
          .expect(200)
          // .expect(200, 'GET,POST,PUT,DELETE,PATCH')
          .end(done);
      });
    })
    .test(function() {
      it('should send a 404 response (copy /bar)', function(done) {
        supertest(this.sails.router._privateRouter)
          .copy('/bar')
          .expect(404)
          .end(done);
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
        supertest(this.sails.router._privateRouter)
          .get('/boop')
          .expect(200, 'hello world!')
          .end(done);
      });
    })
    .test(function() {
      it('should send expected response (post /boop)', function(done) {
        supertest(this.sails.router._privateRouter)
          .post('/boop')
          .expect(200, 'hello world!')
          .end(done);
      });
    })
    .test(function() {
      it('should send expected response (put /boop)', function(done) {
        supertest(this.sails.router._privateRouter)
          .put('/boop')
          .expect(200, 'hello world!')
          .end(done);
      });
    })
    .test(function() {
      it('should send expected response (delete /boop)', function(done) {
        supertest(this.sails.router._privateRouter)
          .del('/boop')
          .expect(200, 'hello world!')
          .end(done);
      });
    })
    .test(function() {
      it('should send expected response (patch /boop)', function(done) {
        supertest(this.sails.router._privateRouter)
          .patch('/boop')
          .expect(200, 'hello world!')
          .end(done);
      });
    })
    .test(function() {
      it('should send expected response (options /boop)', function(done) {
        supertest(this.sails.router._privateRouter)
          .options('/boop')
          .expect(200, 'hello world!')
          .end(done);
      });
    })
    .test(function() {
      it('should send expected response (options /boop)', function(done) {
        supertest(this.sails.router._privateRouter)
          .copy('/boop')
          .expect(200, 'hello world!')
          .end(done);
      });
    });


  $Router.bind('options /blap', RESPOND.GOODBYE)
    .expectBoundRoute({
      path: '/boop',
      method: 'options'
    })
    .test(function() {
      it('should send expected response (options /blap)', function(done) {
        supertest(this.sails.router._privateRouter)
          .options('/blap')
          .expect(200, 'goodbye world!')
          .end(done);
      });
    });


  $Router.bind('post /bar_baz_beezzz', RESPOND.HELLO_500)
    .expectBoundRoute({
      path: '/bar_baz_beezzz',
      method: 'post'
    })
    .test(function() {
      it('should send expected response (post /bar_baz_beezzz)', function(done) {
        supertest(this.sails.router._privateRouter)
          .post('/bar_baz_beezzz')
          .expect(500, 'hello world!')
          .end(done);
      });
    });



  $Router.bind('patch /user', RESPOND.JSON_HELLO)
    .expectBoundRoute({
      path: '/user',
      method: 'patch'
    })
    .test(function() {
      it('should send expected response (patch /user)', function(done) {
        supertest(this.sails.router._privateRouter)
          .patch('/user')
          .expect(200, {
            hello: 'world'
          })
          .end(done);
      });
    });


  $Router
    .test(function() {
      it('should respond with 404 handler', function(done) {
        supertest(this.sails.router._privateRouter)
          .get('/something_undefined')
          .expect(404)
          .end(done);
      });
    });


  $Router.bind('post /something_that_throws', RESPOND.SOMETHING_THAT_THROWS)
    .test(function() {
      it('should respond with 500 handler if something throws', function(done) {
        supertest(this.sails.router._privateRouter)
          .post('/something_that_throws')
          .expect(500)
          .end(done);
      });
    });

});
