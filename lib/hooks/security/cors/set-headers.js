/**
 * This script is a modified version of the Express 4 CORS module:
 * https://github.com/expressjs/cors
 * We're making a modified version because that one leaks headers,
 * but is otherwise still more full-featured and well-thought-out
 * than what we were previously using to set headers.
 *
 * By 'leaks headers', we mean that in certain cases the module
 * would set headers like `Access-Control-Allow-Origin` or
 * `Access-Control-Allow-Methods` even if the requesting origin
 * was not whitelisted.  User agents would still reject the response,
 * but it would allow attackers to sniff some information about
 * what the server _would_ allow.
 *
 * This version of the module _only_ sends headers if the origin
 * in the request is whitelisted.
 */
(function () {

  'use strict';

  var vary = require('vary');

  var defaults = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    // Note -- the original module default for this setting is 204
    optionsSuccessStatus: 200
  };

  function isString(s) {
    return typeof s === 'string' || s instanceof String;
  }

  function isOriginAllowed(origin, allowedOrigin) {
    if (Array.isArray(allowedOrigin)) {
      for (var i = 0; i < allowedOrigin.length; ++i) {
        if (isOriginAllowed(origin, allowedOrigin[i])) {
          return true;
        }
      }
      return false;
    } else if (isString(allowedOrigin)) {
      return origin === allowedOrigin;
    } else if (allowedOrigin instanceof RegExp) {
      return allowedOrigin.test(origin);
    } else {
      return !!allowedOrigin;
    }
  }

  function configureOrigin(options, req) {
    var requestOrigin = req.headers.origin;
    var headers = [];

    // If the allowed origin is '*' (or not set, in which case defaulting to '*'),
    // then we'll send an `Access-Control-Allow-Origin` header.
    if (!options.origin || options.origin === '*') {
      // allow any origin
      headers.push([{
        key: 'Access-Control-Allow-Origin',
        value: '*'
      }]);
    }
    // Otherwise we'll send the header if and ONLY if the requesting origin matches
    // one of the whitelisted origins.  Note that the Express CORS module makes an
    // exception here if `origin` is set to a string, and always returns the header
    // even if the requesting origin doesn't match, which seems like a security leak.
    else {
      if (isOriginAllowed(requestOrigin, options.origin)) {
        // reflect origin
        headers.push([{
          key: 'Access-Control-Allow-Origin',
          value: requestOrigin
        }]);
        // Also send a "vary" header to allow proxies to cache this request correctly.
        headers.push([{
          key: 'Vary',
          value: 'Origin'
        }]);
      }
    }

    return headers;
  }

  function configureMethods(options) {
    var methods = options.methods || defaults.methods;
    if (methods.join) {
      methods = options.methods.join(','); // .methods is an array, so turn it into a string
    }
    return {
      key: 'Access-Control-Allow-Methods',
      value: methods
    };
  }

  function configureCredentials(options) {
    if (options.credentials === true) {
      return {
        key: 'Access-Control-Allow-Credentials',
        value: 'true'
      };
    }
    return null;
  }

  function configureAllowedHeaders(options, req) {
    var headers = options.allowedHeaders || options.headers;
    if (!headers) {
      headers = req.headers['access-control-request-headers']; // .headers wasn't specified, so reflect the request headers
    } else if (headers.join) {
      headers = headers.join(','); // .headers is an array, so turn it into a string
    }
    if (headers && headers.length) {
      return {
        key: 'Access-Control-Allow-Headers',
        value: headers
      };
    }
    return null;
  }

  function configureExposedHeaders(options) {
    var headers = options.exposedHeaders;
    if (!headers) {
      return null;
    } else if (headers.join) {
      headers = headers.join(','); // .headers is an array, so turn it into a string
    }
    if (headers && headers.length) {
      return {
        key: 'Access-Control-Expose-Headers',
        value: headers
      };
    }
    return null;
  }

  function configureMaxAge(options) {
    var maxAge = options.maxAge && options.maxAge.toString();
    if (maxAge && maxAge.length) {
      return {
        key: 'Access-Control-Max-Age',
        value: maxAge
      };
    }
    return null;
  }

  function applyHeaders(headers, res) {
    for (var i = 0, n = headers.length; i < n; i++) {
      var header = headers[i];
      if (header) {
        if (Array.isArray(header)) {
          applyHeaders(header, res);
        } else if (header.key === 'Vary' && header.value) {
          vary(res, header.value);
        } else if (header.value) {
          res.setHeader(header.key, header.value);
        }
      }
    }
  }

  function cors(options, req, res, next) {
    var headers = [];
    var method = req.method && req.method.toUpperCase && req.method.toUpperCase();

    if (method === 'OPTIONS') {
      // preflight
      headers = configureOrigin(options, req);
      // ONLY send additional headers if configureOrigin added the `Access-Control-Allow-Origin`
      // header, meaning that the requesting origin was whitelisted.
      if (headers.length) {
        headers.push(configureCredentials(options, req));
        headers.push(configureMethods(options, req));
        headers.push(configureAllowedHeaders(options, req));
        headers.push(configureMaxAge(options, req));
        headers.push(configureExposedHeaders(options, req));
        applyHeaders(headers, res);
      }

      if (options.preflightContinue ) {
        return next();
      } else {
        res.statusCode = options.optionsSuccessStatus || defaults.optionsSuccessStatus;
        res.end();
      }
    } else {
      // actual response
      headers = configureOrigin(options, req);
      // ONLY send additional headers if configureOrigin added the `Access-Control-Allow-Origin`
      // header, meaning that the requesting origin was whitelisted.
      if (headers.length) {
        headers.push(configureCredentials(options, req));
        headers.push(configureExposedHeaders(options, req));
        applyHeaders(headers, res);
      }
      return next();
    }
  }

  function middlewareWrapper(o) {
    // if no options were passed in, use the defaults
    if (!o || o === true) {
      o = {};
    }
    if (o.origin === undefined) {
      o.origin = defaults.origin;
    }
    if (o.methods === undefined) {
      o.methods = defaults.methods;
    }
    if (o.preflightContinue === undefined) {
      o.preflightContinue = defaults.preflightContinue;
    }

    // if options are static (either via defaults or custom options passed in), wrap in a function
    var optionsCallback = null;
    if (typeof o === 'function') {
      optionsCallback = o;
    } else {
      optionsCallback = function (req, cb) {
        cb(null, o);
      };
    }

    return function corsMiddleware(req, res, next) {
      optionsCallback(req, function (err, options) {

        // Transform the Sails CORS options configs into those expected by this module.
        options = {
          origin: options.allowOrigins,
          credentials: options.allowCredentials,
          methods: options.allowRequestMethods,
          headers: options.allowRequestHeaders,
          exposedHeaders: options.allowResponseHeaders
        };

        // If origin is `*` and `credentials` is true, that means that `allowAnyOriginWithCredentialsUnsafe`
        // has been set in Sails, so we'll change the origin to `true` (which causes the request origin to
        // be reflected in the response).
        if (options.origin === '*' && options.credentials === true) {
          options.origin = true;
        }

        if (err) {
          return next(err);
        } else {
          var originCallback = null;
          if (options.origin && typeof options.origin === 'function') {
            originCallback = options.origin;
          } else if (options.origin) {
            originCallback = function (origin, cb) {
              cb(null, options.origin);
            };
          }

          if (originCallback) {
            originCallback(req.headers.origin, function (err2, origin) {
              if (err2 || !origin) {
                return next(err2);
              } else {
                var corsOptions = Object.create(options);
                corsOptions.origin = origin;
                cors(corsOptions, req, res, next);
              }
            });
          } else {
            return next();
          }
        }
      });
    };
  }

  // can pass either an options hash, an options delegate, or nothing
  module.exports = middlewareWrapper;

}());
