/**
 * Module dependencies
 */

var assert = require('assert');
var util = require('util');
var _ = require('@sailshq/lodash');
var Sails = require('../../../lib').constructor;


describe('Views hook', function (){

  it('should FAIL to initialize if the http hook is NOT enabled', function (done) {

    var sailsApp = new Sails();
    sailsApp.load({
      globals: false,
      log: { level: 'silent' },
      loadHooks: [
        'moduleloader',
        'userconfig',
        'views'
      ]
    }, function (err) {
      try {
        if(!err) { throw new Error('Should have failed to failed to load Sails!'); }
        if (err.code !== 'E_HOOKINIT_DEP') { throw new Error('Should have failed w/ error code: `E_HOOKINIT_DEP`.  But instead, code is: `'+err.code+'`'); }
        if (!_.isUndefined(err.status)) { throw new Error('Error should not have a `status` property!  But instead, status is: `'+err.status+'`'); }
      } catch (e) { return done(e); }
      return done();
    });

  });//</it>


  it('should initialize as long as the http hook is included (even without the session hook)', function (done) {

    var sailsApp = new Sails();
    sailsApp.load({
      globals: false,
      loadHooks: [
        'moduleloader',
        'userconfig',
        'http',
        'views'
      ]
    }, done);

  });//</it>


  it('should initialize w/ the session hook', function (done) {

    var sailsApp = new Sails();
    sailsApp.load({
      globals: false,
      loadHooks: [
        'moduleloader',
        'userconfig',
        'http',
        'session',
        'views'
      ]
    }, done);

  });//</it>

});

