/**
 * Module dependencies
 */
var assert = require('assert');
var should = require('should');   // https://github.com/visionmedia/should.js/


var buildReq = require('root-require')('lib/router/req');


/**
 * This mocked implementation of `req` forms the basis for
 * Sails' transport-agnostic support of Connect/Express
 * middleware.
 */
describe('Base Request (`req`)', function (){

  describe('with empty request', function() {

    var req;


    // Mock the request object.
    before(function (){
      req = buildReq();
      req.should.be.an.Object;
      this.req = req;
    });


    it('.body', function () {
      req.body.should.be.an.Object;
      req.body.should.be.empty;
    });

    it('.params', function () {
      req.params.should.be.an.Array;
      req.params.should.be.empty;
    });

    it('.query', function (){
      req.query.should.be.an.Object;
      req.query.should.be.empty;
    });

    it('.param()', function () {
      should(req.param('foo'))
        .not.be.ok;
    });
  });


  describe('with url /hello?abc=123&foo=bar', function() {

    var req;


    // Mock the request object.
    before(function (){
      req = buildReq({url: '/hello?abc=123&foo=bar'});
      req.should.be.an.Object;
      this.req = req;
    });


    it('.body', function () {
      req.body.should.be.an.Object;
      req.body.should.be.empty;
    });

    it('.params', function () {
      req.params.should.be.an.Array;
      req.params.should.be.empty;
    });

    it('.query', function (){
      req.query.should.be.an.Object;
      req.query.should.have.property('abc', '123');
      req.query.should.have.property('foo', 'bar');
    });

    it('.param()', function () {
      should(req.param('abc')).equal('123');
      should(req.param('foo')).equal('bar');
    });

    it('.path', function() {
      req.path.should.be.an.String;
      req.path.should.equal('/hello');
    });

    it('.url', function() {
      req.url.should.be.an.String;
      req.url.should.equal('/hello?abc=123&foo=bar');
    });

    it('.originalUrl', function() {
      req.originalUrl.should.be.an.String;
      req.originalUrl.should.equal('/hello?abc=123&foo=bar');
    });

  });

});
