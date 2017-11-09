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
      log: {
        level: 'error'
      },
      routes: {
        'get /signup': 'PageController.signup',
        'post /signup': 'UserController.signup',
        'post /*': 'UserController.signup',
        'get /': { controller: 'PageController', action: 'homepage' },
        'get /home': 'index',
        'get /about': { target: 'PageController.about' },
        'get /admin': { target: 'PageController.adminDashboard' },
        'get /badmin': { target: 'PageController.admndashboard' },
        'get /wolves': 'WolfController.find',
        'get /wolves/:id': { target: 'WolfController.findOne' },
        'post /wolves': { controller: 'WolfController', action: 'create' },
        'options /wolves/test': { target: 'WolfController.CreaTe' },
        'get /my-machineFn': { action: 'machines/machinefn' },
        'get /my-page': { view: 'somepage' },
        'get /cause-trouble': [{ policy: 'be-good'}, { action: 'trouble/cause'}],
        'put /cause-more-trouble': [{ policy: 'be-good'}, { controller: 'TroubleController', action: 'cause-more' }],
      },
      controllers: {
        moduleDefinitions: {
          'machines/machinefn': {
            fn: function () {}
          }
        }
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

  it('should work with new action target syntax', function() {
    var route = app.getRouteFor('user/signup');
    assert.equal(route.method, 'post');
    assert.equal(route.url, '/signup');
  });

  it('should work with strings without dots or slashes', function() {
    var route = app.getRouteFor('index');
    assert.equal(route.method, 'get');
    assert.equal(route.url, '/home');
  });

  it('should throw usage error (i.e. `e.code===\'E_NOT_FOUND\'`) if target to search is not found', function () {
    try {
      app.getRouteFor('JuiceController.makeJuice');
      assert(false, 'Should have thrown an error');
    }
    catch (e) {
      if (e.code !== 'E_NOT_FOUND') {
        assert(false, 'Should have thrown an error w/ code === "E_NOT_FOUND", instead got: ' + util.inspect(e));
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

    try {
      app.getRouteFor(function(){});
      assert(false, 'Should have thrown an error');
    }
    catch (e) {
      if (e.code !== 'E_USAGE') { assert(false, 'Should have thrown an error w/ code === "E_USAGE"'); }
    }

  });

  it('should be able to match different syntaxes (routes that specify separate controller+action, or specifically specify a target)', function (){

    assert.equal( app.getRouteFor({controller: 'WolfController', action: 'find'}).url, '/wolves' );
    assert.equal( app.getRouteFor({controller: 'WolfController', action: 'find'}).method, 'get' );

    assert.equal( app.getRouteFor({controller: 'wolf', action: 'find'}).url, '/wolves' );
    assert.equal( app.getRouteFor({controller: 'wolf', action: 'find'}).method, 'get' );

    assert.equal( app.getRouteFor({target: {controller: 'wolf', action: 'find'}}).url, '/wolves' );
    assert.equal( app.getRouteFor({target: {controller: 'wolf', action: 'find'}}).method, 'get' );

    assert.equal( app.getRouteFor('WolfController.find').url, '/wolves' );
    assert.equal( app.getRouteFor('WolfController.find').method, 'get' );

    assert.equal( app.getRouteFor({target: 'WolfController.find'}).url, '/wolves' );
    assert.equal( app.getRouteFor({target: 'WolfController.find'}).method, 'get' );

    assert.equal( app.getRouteFor('WolfController.findOne').url, '/wolves/:id' );
    assert.equal( app.getRouteFor('WolfController.findOne').method, 'get' );

    assert.equal( app.getRouteFor('WolfController.create').url, '/wolves' );
    assert.equal( app.getRouteFor('WolfController.create').method, 'post' );

    assert.equal( app.getRouteFor('machines/machinefn').url, '/my-machineFn' );
    assert.equal( app.getRouteFor('machines/machinefn').method, 'get' );

    assert.equal( app.getRouteFor('trouble/cause').url, '/cause-trouble' );
    assert.equal( app.getRouteFor('trouble/cause').method, 'get' );

    assert.equal( app.getRouteFor('trouble/cause-more').url, '/cause-more-trouble' );
    assert.equal( app.getRouteFor('trouble/cause-more').method, 'put' );

  });

  it('should be case-insensitive regarding controller / action names', function (){
    assert.equal( app.getRouteFor('WolfController.CreaTe').url, '/wolves' );
    assert.equal( app.getRouteFor('WolfController.CreaTe').method, 'post' );

    assert.equal( app.getRouteFor({controller: 'WOLF', action: 'finD'}).url, '/wolves' );
    assert.equal( app.getRouteFor({controller: 'WOLF', action: 'finD'}).method, 'get' );
  });

});

