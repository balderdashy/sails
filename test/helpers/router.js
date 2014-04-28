/**
 * Module dependencies
 */
var _ = require('lodash');



var $Router = {


  /**
   * Run custom tests if provided
   * @param  {Function} customTests
   * @return {$Router}
   */
  test: function(customTests) {
    customTests();

    // Chainable
    return $Router;
  },


  /**
   * unbind(route)
   *   .expect(expectations)
   *
   */
  unbind: function(route) {
    var args = Array.prototype.slice.call(arguments);

    it('binds the given route', function() {
      this.sails.router.bind.should.be.ok;
      this.sails.router.bind.apply(this.sails.router, args);
    });

    var Chainable = {
      shouldDelete: function(expected) {
        it('should delete route in _privateRouter', function() {
          var boundRoutes = this.sails.router._privateRouter.routes[expected.method];
          _.some(boundRoutes, expected).should.be.false;
        });

        return Chainable;
      }
    };

    return Chainable;
  },


  /**
   * bindRoute(route, handler)
   *   .expectBoundRoute(expectedRoute)
   *   .test(fnContainingCustomMochaTests)
   *
   */
  bind: function (route, handler) {
    var args = Array.prototype.slice.call(arguments);

    it('binds the given route', function() {
      this.sails.router.bind.should.be.ok;
      this.sails.router.bind.apply(this.sails.router, args);
    });

    var Chainable = {
      expectBoundRoute: function(expected) {
        var readableRoute = expected.method + ' ' + expected.path;

        it('should create ' + readableRoute + ' in _privateRouter router', function() {
          var boundRoutes = this.sails.router._privateRouter.routes[expected.method];
          _.some(boundRoutes, expected).should.be.true;
        });
        return Chainable;
      },

      // Run custom tests if provided
      test: function(customTests) {
        customTests();

        return Chainable;
      }
    };

    return Chainable;
  }

};

module.exports = $Router;














// var helper = {

//  /**
//   * Send a mock request to the instance of Sails in the test context.
//   *
//   * @param {String} url    [relative URL]
//   * @param {Object} options
//   *
//   * @return {Function}   [bdd]
//   */
//  request: function ( url, options ) {
//    return function (done) {

//      var self = this;
//      var _fakeClient = function (err, response) {
//        if (err) return done(err);
//        self.response = response;
//        done();
//      };

//      // Emit a request event (will be intercepted by the Router)
//      this.sails.emit('router:request', _req(), _res(), _fakeClient);
//    };
//  },



//  /**
//   * Bind a route.
//   *
//   * @param {String|RegExp} path
//   * @param {String|Object|Array|Function} target
//   * @param {String} verb (optional)
//   * @param {Object} options (optional)
//   *
//   * @return {Function}   [bdd]
//   */

//  bind: function () {
//    var args = Array.prototype.slice.call(arguments);
//    return function () {
//      this.sails.router.bind.apply(this.sails.router, args);
//    };
//  }
// };
// module.exports = helper;



// // Private methods

// /**
//  * Test fixture to send requests to Sails.
//  *
//  * @api private
//  */

// function _req ( req ) {
//  var _enhancedReq = util.defaults(req || {}, {
//    params: {},
//    url: '/',
//    param: function(paramName) {
//      return _enhancedReq.params[paramName];
//    },
//    wantsJSON: true,
//    method: 'get'
//  });

//  return _enhancedReq;
// }


// /**
//  * Test fixture to receive responses from Sails.
//  *
//  * @api private
//  */

// function _res (res) {

//  var _enhancedRes = util.defaults(res || {}, {
//    send: function(/* ... */) {
//      var args = _normalizeResArgs(Array.prototype.slice.call(arguments));

//      _enhancedRes._cb(null, {
//        body: args.other,
//        headers: {},
//        status: args.statusCode || 200
//      });
//    },
//    json: function(body, statusCode) {

//      // Tolerate bad JSON
//      var json = util.stringify(body);
//      if ( !json ) {
//        var failedStringify = new Error(
//          'Failed to stringify specified JSON response body :: ' + body
//        );
//        return _enhancedRes.send(failedStringify.stack, 500);
//      }

//      return _enhancedRes.send(json,statusCode);
//    }
//  });

//  return _enhancedRes;
// }


// /**
//  * As long as one of them is a number (i.e. a status code),
//  * allows a 2-nary method to be called with flip-flopped arguments:
//  *   method( [statusCode|other], [statusCode|other] )
//  *
//  * This avoids confusing errors & provides Express 2.x backwards compat.
//  *
//  * E.g. usage in res.send():
//  *   var args    = normalizeResArgs.apply(this, arguments),
//  *     body    = args.other,
//  *     statusCode  = args.statusCode;
//  *
//  * @api private
//  */
// function _normalizeResArgs( args ) {

//  // Traditional usage:
//  // `method( other [,statusCode] )`
//  var isTraditionalUsage =
//    'number' !== typeof args[0] &&
//    ( !args[1] || 'number' === typeof args[1] );

//  if ( isTraditionalUsage ) {
//    return {
//      statusCode: args[1],
//      other: args[0]
//    };
//  }

//  // Explicit usage, i.e. Express 3:
//  // `method( statusCode [,other] )`
//  return {
//    statusCode: args[0],
//    other: args[1]
//  };
// }



// describe('receives a request', function() {
//  to('home route (/)', function() {
//    before(RouterHelper.request('/'));
//    __it('should trigger the default notFound (404) handler');
//    __it('should receive a 404 response from default handler', expect.equal('response.status', 404));
//    __it('should not receive a reponse body', expect.notExists('response.body'));
//  });
// });

// to('a simple fn which calls res.send()', function () {
//  var route = 'get /simple';
//  var fn = function (req, res) { res.send('ok!'); };
//  var expectedResponse = { status: 200 };

//  __it('binds the route', RouterHelper.bind(route, fn));
//  __it('should now exist in the _privateRouter router');
//  __it('receives a request to the route',RouterHelper.request(route));
//  __it('should have called the proper fn');
//  __it('should have sent the expected status code in the response', expect.equal('response.status', expectedResponse.status));
//  __it('should have sent the expected response body', expect.equal('response.body', expectedResponse.body));
//  __it('should have sent the expected response headers', expect.equal('response.headers', expectedResponse.headers));
// });

// to('a simple fn which throws', function () {
//  var route = 'get /throws';
//  var fn = function (req, res) { throw new Error('heh heh'); };
//  var expectedResponse = { status: 500 };

//  __it('binds the route', RouterHelper.bind(route, fn));
//  __it('should now exist in the _privateRouter router');
//  __it('receives a request to the route', RouterHelper.request(route));
//  __it('should have called the proper fn');
//  __it('should have sent the proper response', expect.equal('response', expectedResponse));
// });
// });


// // private bdd helpers
// function __it(name, fn) {
//  it('\n\t    ...it ' + name, fn);
// }
// function to(name,fn) {
//  describe('\n\t-- to ' +name+'...', fn);
// }
