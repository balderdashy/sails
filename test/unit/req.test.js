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

