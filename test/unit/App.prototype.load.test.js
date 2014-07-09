/**
 * Module dependencies
 */

var assert = require('assert');
var util = require('util');
var async = require('async');
var Sails = require('../../lib').constructor;


describe('App', function (){

  var app;

  describe('.prototype.load', function () {

    it('should return app instance (so it can be chained w/ other prototypal methods)', function (done) {
      app = new Sails();
      var returnValue;


      async.auto({

        loadSails: function (next) {
          returnValue = app.load({
            globals: false,
            loadHooks: [
              'moduleloader',
              'userconfig',
              'http',
              'views'
            ]
          }, function onLoaded (err){
            if (err) return next(err);

            // Return value should === `app` whenever sails finishes loading
            assert.equal(app, returnValue);

            next();
          });

          // Return value should === `app` immediately
          assert.equal(app, returnValue);
        },

        // Return value should === `app` later on
        laterOn: function (next) {
          setTimeout(function (){
            assert.equal(app, returnValue);
            next();
          }, 150);
        }
      }, done);

    });
  });




  it('should initialize w/ the session hook', function (done) {

    app = new Sails();
    app.load({
      globals: false,
      loadHooks: [
        'moduleloader',
        'userconfig',
        'http',
        'session',
        'views'
      ]
    }, done);
  });

});

