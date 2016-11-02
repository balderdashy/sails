/**
 * Module dependencies
 */

var util = require('util');
var assert = require('assert');
var tmp = require('tmp');
var _ = require('@sailshq/lodash');

var Sails = require('../../lib').constructor;

tmp.setGracefulCleanup();

/**
 * Errors
 */

var Err = {
  badResponse: function(response) {
    return 'Wrong server response!  Response :::\n' + util.inspect(response.body);
  }
};



/**
 * Tests
 */

describe('route ordering :: ', function() {

  var curDir, tmpDir, sailsApp;

  var testRoutes = {
    '/*': function(req, res) {res.json({route: '/*', params: req.params});},
    'GET /*': function(req, res) {res.json({route: 'GET /*', params: req.params});},
    '/*/baz': function(req, res) {res.json({route: '/*/baz', params: req.params});},
    '/*/baz/*': function(req, res) {res.json({route: '/*/baz/*', params: req.params});},
    '/*/bar/baz': function(req, res) {res.json({route: '/*/bar/baz', params: req.params});},
    '/:foo/*': function(req, res) {res.json({route: '/:foo/*', params: req.params});},
    '/:foo/:bar/*': function(req, res) {res.json({route: '/:foo/:bar/*', params: req.params});},
    '/:foo/:bar/:baz': function(req, res) {res.json({route: '/:foo/:bar/:baz', params: req.params});},
    '/:foo/:bar/baz': function(req, res) {res.json({route: '/:foo/:bar/baz', params: req.params});},
    '/:foo/:bar': function(req, res) {res.json({route: '/:foo/:bar', params: req.params});},
    '/:foo/bar/:baz': function(req, res) {res.json({route: '/:foo/bar/:baz', params: req.params});},
    '/:foo/bar/baz': function(req, res) {res.json({route: '/:foo/bar/baz', params: req.params});},
    '/:foo/bar': function(req, res) {res.json({route: '/:foo/bar', params: req.params});},
    '/:foo': function(req, res) {res.json({route: '/:foo', params: req.params});},
    '/foo/*': function(req, res) {res.json({route: '/foo/*', params: req.params});},
    '/foo/*/baz': function(req, res) {res.json({route: '/foo/*/baz', params: req.params});},
    '/foo/:bar/:baz': function(req, res) {res.json({route: '/foo/:bar/:baz', params: req.params});},
    '/foo/:bar/baz': function(req, res) {res.json({route: '/foo/:bar/baz', params: req.params});},
    '/foo/:bar': function(req, res) {res.json({route: '/foo/:bar', params: req.params});},
    '/foo/bar/*': function(req, res) {res.json({route: '/foo/bar/*', params: req.params});},
    'GET /foo/bar/*': function(req, res) {res.json({route: 'GET /foo/bar/*', params: req.params});},
    '/foo/bar/:baz': function(req, res) {res.json({route: '/foo/bar/:baz', params: req.params});},
    'GET /foo/bar/:baz': function(req, res) {res.json({route: 'GET /foo/bar/:baz', params: req.params});},
    '/foo/bar/baz': function(req, res) {res.json({route: '/foo/bar/baz', params: req.params});},
    '/foo/bar': function(req, res) {res.json({route: '/foo/bar', params: req.params});},
    '/foo': function(req, res) {res.json({route: '/foo', params: req.params});},
    'GET /foo': function(req, res) {res.json({route: 'GET /foo', params: req.params});}
  };

  before(function(done) {
    // Cache the current working directory.
    curDir = process.cwd();
    // Create a temp directory.
    tmpDir = tmp.dirSync({gracefulCleanup: true, unsafeCleanup: true});
    // Switch to the temp directory.
    process.chdir(tmpDir.name);
    var sails = new Sails();
    (new Sails()).load({
      loadHooks: [],
      routes: testRoutes
    }, function(err, _sails) {
      if (err) { return done(err); }
      sailsApp = _sails;
      return done();
    });
  });

  after(function(done) {
    sailsApp.lower(function() {
      process.chdir(curDir);
      return done();
    });
  });

  it('should bind the routes in the correct order', function(){
    var sortedRoutes = sailsApp.router.getSortedRouteAddresses();
    assert(_.isEqual(sortedRoutes, ['GET /foo', '/foo', '/foo/bar', '/foo/bar/baz', 'GET /foo/bar/:baz', '/foo/bar/:baz', 'GET /foo/bar/*', '/foo/bar/*', '/foo/:bar', '/foo/:bar/baz', '/foo/:bar/:baz', '/foo/*/baz', '/foo/*', '/:foo/bar', '/:foo/bar/baz', '/:foo/bar/:baz', '/:foo/:bar/baz', '/*/bar/baz', '/*/baz/*', '/*/baz', '/:foo', '/:foo/:bar', '/:foo/:bar/:baz', '/:foo/:bar/*', '/:foo/*', 'GET /*', '/*']), sortedRoutes);
  });

  var testRequests = {
    'GET /foo': 'GET /foo',
    '/foo': 'POST /foo',
    '/foo/bar': 'GET /foo/bar',
    '/foo/bar/baz': 'GET /foo/bar/baz',
    'GET /foo/bar/:baz': 'GET /foo/bar/xxx',
    '/foo/bar/:baz': 'POST /foo/bar/xxx',
    'GET /foo/bar/*': 'GET /foo/bar/xxx/yyy',
    '/foo/bar/*': 'POST /foo/bar/xxx/yyy',
    '/foo/:bar': 'GET /foo/xxx',
    '/foo/:bar/baz': 'GET /foo/xxx/baz',
    '/foo/:bar/:baz': 'GET /foo/xxx/yyy',
    '/foo/*/baz': 'GET /foo/xxx/yyy/zzz/baz',
    '/foo/*': 'GET /foo/xxx/yyy/zzz',
    '/:foo/bar': 'GET /xxx/bar',
    '/:foo/bar/baz': 'GET /xxx/bar/baz',
    '/:foo/bar/:baz': 'GET /xxx/bar/yyy',
    '/:foo/:bar/baz': 'GET /xxx/yyy/baz',
    '/*/bar/baz': '/xxx/yyy/bar/baz',
    '/*/baz/*': '/xxx/baz/yyy',
    '/*/baz': '/xxx/yyy/zzz/baz',
    '/:foo': 'GET /xxx',
    '/:foo/:bar': 'GET /xxx/yyy',
    '/:foo/:bar/:baz': 'GET /xxx/yyy/zzz',
    '/:foo/:bar/*': 'GET /xxx/yyy/zzz/owl'
  };

  _.each(testRequests, function(request, expectedRoute) {
    it('a request to `' + request + '` should be handled by the `' + expectedRoute + '` route', function(done) {
      sailsApp.request(request, {}, function (err, resp, data) {
        assert(!err, err);
        assert.equal(data.route, expectedRoute, 'The `' + data.route + '` route handled it instead!');
        done();
      });
    });
  });

});
