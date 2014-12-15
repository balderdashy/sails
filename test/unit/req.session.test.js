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
        console.log('res.headers',res.headers);
        return done();
      });
    });

    it('should persist data between requests', function (done){
      app.request({
        url: '/sessionTest',
        method: 'GET',
        params: {},
        headers: {}
      }, function (err, res, body){
        console.log('headers in final clientRes :', res.headers);
        if (err) return done(err);
        if (res.statusCode !== 200) return done(new Error('Expected 200 status code'));
        if (!doesSessionExist) return done(new Error('req.session should exist.'));
        if (!isSessionAnObject) return done(new Error('req.session should be an object.'));
        if (!doesTestPropertyStillExist) return done(new Error('`req.session.something` should still exist for subsequent requests.'));
        return done();
      });
    });

  });

  after(function (done) {
    done();
  });

});

