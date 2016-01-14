/**
 * Module dependencies
 */

var assert = require('assert');
var util = require('util');
var Sails = require('../../lib').constructor;


describe.skip('app.getRouteFor()', function (){

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
    var route = app.getRouteFor({ target: 'UserController.signup' });
    assert.equal(route.method, 'post');
    assert.equal(route.url, '/signup');
  });

  // TODO: if target to search for not specified or is invalid, should throw usage error (i.e. `e.code==='E_USAGE'`)
  // TODO: if specified target string to search for has no dot, should throw usage error (i.e. `e.code==='E_USAGE'`)
  // TODO: Should be able to match different syntaxes (routes that specify separate controller+action, or specifically specify a target)
  // TODO: test case-sensitivity in action names

});

