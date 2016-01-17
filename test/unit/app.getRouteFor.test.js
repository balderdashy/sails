/**
 * Module dependencies
 */

var assert = require('assert');
var util = require('util');
var Sails = require('../../lib').constructor;


describe('app.getRouteFor()', function (){

  var app;
  before(function (done){
    app = new Sails();
    app.load({
      globals: false,
      loadHooks: [],
      routes: {
        'get /signup': 'PageController.signup',
        'post /signup': 'UserController.signup',
        'post /*': 'UserController.signup',
        'get /': { controller: 'PageController', action: 'homepage' },
        'get /about': { target: 'PageController.about' },
        'get /admin': { target: 'PageController.adminDashboard' },
        'get /badmin': { target: 'PageController.admndashboard' },
        'get /wolves': 'WolfController.find',
        'get /wolves/:id': { target: 'WolfController.findOne' },
        'post /wolves': { controller: 'WolfController', action: 'create' },
        'options /wolves/test': { target: 'WolfController.CreaTe' },
      }
    }, done);
  });


  it('should return appropriate route info dictionary with simplified usage', function () {
    var route = app.getRouteFor('PageController.signup');
    assert.equal(route.method, 'get');
    assert.equal(route.url, '/signup');
  });

  it('should return appropriate route info dictionary with expanded usage', function () {
    var route = app.getRouteFor({ target: 'PageController.signup' });
    assert.equal(route.method, 'get');
    assert.equal(route.url, '/signup');
  });

  it('should return the _first_ matching route', function () {
    var route = app.getRouteFor('UserController.signup');
    assert.equal(route.method, 'post');
    assert.equal(route.url, '/signup');
  });

  it('should return the _first_ matching route', function () {
    try {
      app.getRouteFor('JuiceController.makeJuice');
      assert(false, 'Should have thrown an error');
    }
    catch (e) {
      if (e.code !== 'E_NOT_FOUND') {
        assert(false, 'Should have thrown an error w/ code === "E_NOT_FOUND"');
      }
    }
  });

  it('should throw usage error (i.e. `e.code===\'E_USAGE\'`) if target to search for not specified or is invalid', function (){
    try {
      app.getRouteFor();
      assert(false, 'Should have thrown an error');
    }
    catch (e) {
      if (e.code !== 'E_USAGE') { assert(false, 'Should have thrown an error w/ code === "E_USAGE"'); }
    }

    try {
      app.getRouteFor(3235);
      assert(false, 'Should have thrown an error');
    }
    catch (e) {
      if (e.code !== 'E_USAGE') { assert(false, 'Should have thrown an error w/ code === "E_USAGE"'); }
    }

    try {
      app.getRouteFor({ x: 32, y: 49 });
      assert(false, 'Should have thrown an error');
    }
    catch (e) {
      if (e.code !== 'E_USAGE') { assert(false, 'Should have thrown an error w/ code === "E_USAGE"'); }
    }
  });

  it('should throw usage error (i.e. `e.code===\'E_USAGE\'`) if specified target string to search for has no dot', function (){
    try {
      app.getRouteFor('SomeController');
      assert(false, 'Should have thrown an error');
    }
    catch (e) {
      if (e.code !== 'E_USAGE') { assert(false, 'Should have thrown an error w/ code === "E_USAGE"'); }
    }
  });

  it('should be able to match different syntaxes (routes that specify separate controller+action, or specifically specify a target)', function (){
    assert.equal( app.getRouteFor('WolfController.find').url, '/wolves' );
    assert.equal( app.getRouteFor('WolfController.find').method, 'get' );

    assert.equal( app.getRouteFor('WolfController.findOne').url, '/wolves/:id' );
    assert.equal( app.getRouteFor('WolfController.findOne').method, 'get' );

    assert.equal( app.getRouteFor('WolfController.create').url, '/wolves' );
    assert.equal( app.getRouteFor('WolfController.create').method, 'post' );
  });

  it('should respect case-sensitivity of action names', function (){
    assert.equal( app.getRouteFor('WolfController.CreaTe').url, '/wolves/test' );
    assert.equal( app.getRouteFor('WolfController.CreaTe').method, 'options' );
  });

});

