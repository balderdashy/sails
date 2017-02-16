/**
 * Module dependencies
 */

var util = require('util');
var assert = require('assert');
var _ = require('@sailshq/lodash');

var Sails = require('../../lib').constructor;

describe('sails.registerAction() :: ', function() {

  var sailsApp;
  before(function(done) {
    (new Sails()).load({
      hooks: {grunt: false, views: false, blueprints: false, policies: false, i18n: false},
      log: {level: 'error'},
      routes: {
        '/foo': {}
      }
    }, function(err, _sails) {
      if (err) { return done(err); }
      sailsApp = _sails;
      return done();
    });
  });

  after(function(done) {
    sailsApp.lower(done);
  });

  it('should allow registering a new action at runtime, if it doesn\'t conflict with an existing action', function() {
    sailsApp.registerAction(function(req, res) {return res.ok('ok!');}, 'new-action');
    assert(_.isFunction(sailsApp._actions['new-action']), 'registerAction() succeeded, but could not find the registered action in the sails._actions dictionary!');
  });

  it('should allow not registering a new action at runtime, if it conflicts with an existing action', function() {
    try {
      sailsApp.registerAction(function(req, res) {return res.ok('ok!');}, 'top-level-standalone-fn');
      sailsApp.registerAction(function(req, res) {return res.ok('not ok!');}, 'top-level-standalone-fn');
    } catch (err) {
      assert.equal(err.code, 'E_CONFLICT');
      assert.equal(err.identity, 'top-level-standalone-fn');
      return;
    }
    throw new Error('Expected an E_CONFLICT error, but didn\'t get one!');
  });

});

