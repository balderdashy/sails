/**
 * Module dependencies
 */

var assert = require('assert');
var Sails = require('../../../lib').constructor;
var path = require('path');

describe('sails.hooks.views.render() with i18n', function (){

  var renderWithLocale = function(req, res){
    var data = {
      locale: req.param('lang'),
      layout: false
    };
    sails.hooks.views.render('index.i18n', data, function(err, html){
      if (err) {
        return res.status(500).send(err);
      }
      return res.status(200).send(html);
    });
  };

  var renderWithoutLocale = function(req, res){
    var data = {
      layout: false
    };
    sails.hooks.views.render('index.i18n', data, function(err, html){
      if (err) {
        return res.status(500).send(err);
      }
      return res.status(200).send(html);
    });
  };

  // Load a Sails app
  var app;
  before(function (done) {
    app = new Sails()
    .load({
      globals: { sails: true, models: false, _: false, async: false, services: false } ,
      loadHooks: [
        'moduleloader',
        'userconfig',
        'http',
        'logger',
        'i18n',
        'views'
      ],
      routes: {
        'get /render/:lang': renderWithLocale,
        'get /render'      : renderWithoutLocale
      },
      i18n: {
        locales: ['en', 'es', 'eu'],
        defaultLocale: 'eu',
        localesDirectory: path.join(__dirname, './locales')
      },
      paths: {
        views: path.join(__dirname, './ejs')
      }
    }, done);
  });


  it('should show the message in basque', function (done) {
    app
    .request({url:'/render/eu', method: 'get'}, function(err, res){
      assert.equal('<h1>Kaixo</h1>', res.body.trim());
      done();
    });
  });

  it('should show the message in spanish', function (done) {
    app
    .request({url:'/render/es', method: 'get'}, function(err, res){
      assert.equal('<h1>Hola</h1>', res.body.trim());
      done();
    });
  });

  it('should show the message in english', function (done) {
    app
    .request({url:'/render/en', method: 'get'}, function(err, res){
      assert.equal('<h1>Hello</h1>', res.body.trim());
      done();
    });
  });

  it('should show the message in basque by default if unknown lang', function (done) {
    app
    .request({url:'/render/de', method: 'get'}, function(err, res){
      assert.equal('<h1>Kaixo</h1>', res.body.trim());
      done();
    });
  });

  it('should show the message in basque by default', function (done) {
    app
    .request({url:'/render', method: 'get'}, function(err, res){
      assert.equal('<h1>Kaixo</h1>', res.body.trim());
      done();
    });
  });

});
