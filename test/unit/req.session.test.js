/**
 * Module dependencies
 */

var assert = require('assert');
var util = require('util');
var _ = require('lodash');
var async = require('async');
var Sails = require('../../lib').Sails;


describe('req.session (with no session hook)', function (){

  var app;

  before(function (done){
    app = Sails();
    app.load({
      globals: false,
      loadHooks: [
        'moduleloader',
        'userconfig'
      ],
      session: {
        adapter: 'memory',
        key: 'sails.sid',
        secret: 'af9442683372850a85a87150c47b4a31'
      }
    }, done);
  });


  describe('when responding to a virtual request',function (){


    it('should exist', function (done) {
      var doesSessionExist;
      var isSessionAnObject;
      app.get('/dogs', function (req, res){
        doesSessionExist = !!req.session;
        isSessionAnObject = _.isObject(req.session);
        res.send();
      });
      app.request({
        url: '/dogs',
        method: 'GET',
        params: {},
        headers: {}
      }, function (err, res, body){
        if (err) return done(err);
        if (res.statusCode !== 200) return done(new Error('Expected 200 status code'));
        if (!doesSessionExist) return done(new Error('req.session should exist.'));
        if (!isSessionAnObject) return done(new Error('req.session should be an object.'));
        return done();
      });
    });
  });

  after(function (done) {
    done();
  });

});

