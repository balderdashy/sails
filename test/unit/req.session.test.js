/**
 * Module dependencies
 */

var assert = require('assert');
var util = require('util');
var _ = require('lodash');
var async = require('async');
var Sails = require('../../lib').Sails;


describe('req.session', function (){

  var app;

  before(function (done){
    app = Sails();
    app.load({
      globals: false,
      loadHooks: [
        'moduleloader',
        'userconfig',
        'session'
      ],
      session: {
        adapter: 'memory',
        key: 'sails.sid',
        secret: 'af9442683372850a85a87150c47b4a31'
      }
    }, done);
  });


  describe('when responding to a virtual request',function (){

    var doesSessionExist;
    var isSessionAnObject;
    var doesTestPropertyStillExist;

    before(function setupTestRoute(){
      app.post('/sessionTest', function (req, res){
        doesSessionExist = !!req.session;
        isSessionAnObject = _.isObject(req.session);
        req.session.something = 'some string';
        res.send();
      });

      app.get('/sessionTest', function (req, res){
        doesSessionExist = !!req.session;
        isSessionAnObject = _.isObject(req.session);
        doesTestPropertyStillExist = req.session.something === 'some string';
        res.send();
      });

    });

    it('should exist', function (done) {
      app.request({
        url: '/sessionTest',
        method: 'POST',
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


    //
    // To test:
    //
    // DEBUG=express-session mocha test/unit/req.session.test.js -b -g 'should persist'
    //

    it('should persist data between requests', function (done){
      app.request({
        url: '/sessionTest',
        method: 'POST',
        params: {},
        headers: {}
      }, function (err, clientRes, body){
        if (err) return done(err);
        if (clientRes.statusCode !== 200) return done(new Error('Expected 200 status code'));
        if (!doesSessionExist) return done(new Error('req.session should exist.'));
        if (!isSessionAnObject) return done(new Error('req.session should be an object.'));

        app.request({
          url: '/sessionTest',
          method: 'GET',
          params: {},
          headers: {
            cookie: clientRes.headers['set-cookie']
          }
        }, function (err, clientRes, body){
          if (err) return done(err);
          if (clientRes.statusCode !== 200) return done(new Error('Expected 200 status code'));
          if (!doesSessionExist) return done(new Error('req.session should exist.'));
          if (!isSessionAnObject) return done(new Error('req.session should be an object.'));
          if (!doesTestPropertyStillExist) return done(new Error('`req.session.something` should still exist for subsequent requests.'));
          return done();
        });
      });
    });

  });

  after(function (done) {
    done();
  });

});

