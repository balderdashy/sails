/**
 * Module dependencies
 */
var assert = require('assert');
var should = require('should');   // https://github.com/visionmedia/should.js/


var buildRes = require('root-require')('lib/router/res');


/**
 * This mocked implementation of `res` forms the basis for
 * Sails' transport-agnostic support of Connect/Express
 * middleware.
 */
describe('Base Response (`res`)', function (){

  describe('header handling', function() {
    var ourCustomMime = 'application/vnd.sails.test.v1+json'

    it("should set a content-type when we send a JS object but don't set content-type", function () {
      var res = buildRes()
      var resBodyData = {foo: 'bar'}
      res.status(200).send(resBodyData)
      res.headers['content-type'].should.equal('application/json')
    });

    it('should not overwrite our content-type header when we send a JS object', function () {
      var res = buildRes()
      var resBodyData = {foo: 'bar'}
      res.set('content-type', ourCustomMime) // set our own content-type!
      res.status(200).send(resBodyData)
      res.headers['content-type'].should.equal(ourCustomMime)
    });

    it("should NOT automatically set a content-type when we send a string but don't set content-type", function () {
      var res = buildRes()
      var resBodyDataString = 'some plain text'
      res.status(200).send(resBodyDataString)
      should(res.headers['content-type']).be.empty
    });

    it('should not overwrite our content-type header when we send a string', function () {
      var res = buildRes()
      var resBodyDataString = '<some xml=""></some>'
      res.set('content-type', ourCustomMime) // set our own content-type!
      res.status(200).send(resBodyDataString)
      res.headers['content-type'].should.equal(ourCustomMime)
    });

  });

});
