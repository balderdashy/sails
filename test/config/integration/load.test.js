var assert = require('assert');
var appHelper = require('./helpers/appHelper');
var path = require('path');
var fs = require('fs');

describe('Configs', function () {
  this.timeout(30000);

  var appName = 'testApp';
  var config;
  var sailsserver;
  var up = false;
  before(function (done) {

    // build app
    appHelper.build(function (err) {
      if (err) return done(err);
      process.chdir(appName);

      // Start sails and pass it command line arguments
      require(path.resolve('./../lib')).lift({}, function (err, sails) {
        if (err) return done(err);
        up = true;
        config = sails.config;
        sailsserver = sails;
        done();
      });
    });
  });

  after(function () {
    sailsserver.lower(function(){
      // Not sure why this runs multiple times, but checking "up" makes
      // sure we only do chdir once
      sailsserver.removeAllListeners();
      if (up === true) {
        up = false;
        process.chdir('../');
        appHelper.teardown();
      }
    });
  });

  it('should load adapter configs', function () {
    var conf = config.adapters;
    assert(conf.
    default.module === 'sails-disk');
    assert(conf.custom && conf.custom.module === 'sails-disk');
    assert(conf.sqlite.module === 'sails-sqlite');
    assert(conf.sqlite.host === 'sqliteHOST');
    assert(conf.sqlite.user === 'sqliteUSER');
  });

  it('should load application configs', function () {
    assert(config.port === 1702);
    assert(config.host === 'localhost');

    // this should have been overriden by the local conf file
    assert(config.appName === 'portal2');
    assert(config.environment === 'production');
    assert(config.cache.maxAge === 9001);
    assert(config.globals._ === false);
  });

  it('should load the controllers configs', function () {
    var conf = config.controllers;
    assert(conf.routes.actions === false);
    assert(conf.routes.prefix === 'Z');
    assert(conf.routes.expectIntegerId === true);
    assert(conf.csrf === true);
  });

  it('should load the io configs', function () {
    var conf = config.sockets;
    assert(conf.adapter === 'disk');
    assert(conf.transports[0] === 'websocket');
    assert(conf.origins === '*:1337');
    assert(conf.heartbeats === false);
    assert(conf['close timeout'] === 10);
    assert(conf.authorization === false);
    assert(conf['log level'] === 'error');
    assert(conf['log colors'] === true);
    assert(conf.static === false);
    assert(conf.resource === '/all/the/sockets');
  });

  it('should override configs with locals config', function () {
    assert(config.appName === 'portal2');
  });

  it('should load the log configs', function () {
    assert(config.log.level === 'error');
  });

  it('should load the poly configs', function () {
    assert(config.policies['*'] === false);
  });

  it('should load the routes configs', function () {
    assert(typeof config.routes['/'] === 'function');
  });

  it('should load the session configs', function () {
    assert(config.session.secret === '1234567');
    assert(config.session.adapter === 'memory');
    assert(config.session.key === 'sails.sid');
  });

  it('should load the views config', function () {
    var conf = config.views;
    assert(conf.engine === 'ejs');
    assert(conf.blueprints === false);
    assert(conf.layout === false);

  });

});