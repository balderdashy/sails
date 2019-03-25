/**
 * Module dependencies.
 */

var util = require('util');
var _ = require('@sailshq/lodash');
var flaverr = require('flaverr');
var detectVerb = require('../util/detect-verb');


/**
 * Expose `bind` method.
 */
module.exports = bind;



/**
 * Bind new route(s)
 *
 * @param {String|RegExp} path
 * @param {String|Object|Array|Function} target
 * @param {String} verb (optional)
 * @param {Object} options (optional)
 *
 * @this {SJSRouter}
 * @return {SJSApp}
 *
 * @api private
 */

function bind( /* path, target, verb, options */ ) {
  var sails = this.sails;

  var args = sanitize.apply(this, Array.prototype.slice.call(arguments));
  var path = args.path;
  var target = args.target;
  var verb = args.verb;
  var options = args.options;

  // Don't allow paths with "length" as a route param, because Express chokes on it
  if (path.match(/\/:length($|\/)/)) {
    throw flaverr({name: 'userError', code: 'E_ROUTE_WITH_LENGTH'}, new Error('Failed to bind route: `'+ path +'`\n'+
    'Routes which contain `/:length` in their address URL are not supported by Sails/Express (consider using `/:len`)'));
  }

  // Bind a list of multiple functions in order
  if (_.isArray(target)) {
    bindArray.apply(this, [path, target, verb, options]);
  }

  // Handle string redirects
  // (to either public-facing URLs or internal routes)
  else if (_.isString(target) && target.match(/^(https?:|\/)/)) {
    bindRedirect.apply(this, [path, target, verb, options]);
  }

  // Otherwise if the target is a string, it must be an action.
  else if (_.isString(target) || (_.isPlainObject(target) && (target.controller || target.action))) {
    bindAction.apply(this, [path, target, verb, options]);
  }

  // Bind a middleware function directly
  else if (_.isFunction(target)) {
    bindFunction.apply(this, [path, target, verb, options]);
  }

  // If target is an object with a `target`, pull out the rest
  // of the keys as route options and then bind the target.
  else if (_.isPlainObject(target) && (target.target || target.fn)) {
    var _target = target.target || target.fn;
    // TODO -- replace _.merge() with a call to merge-dictionaries module?
    options = _.merge(options, _.omit(target, 'target'));
    bind.apply(this, [path, _target, verb, options]);
  }

  else {

    // If we make it here, the router doesn't know how to parse the target.
    //
    // This doesn't mean that it's necessarily invalid though--
    // so we'll emit an event informing any listeners that an unrecognized route
    // target was encountered.  Then hooks can listen to this event and act
    // accordingly.  This makes it easier to add functionality to Sails.
    sails.emit('route:typeUnknown', {
      path: path,
      target: target,
      verb: verb,
      options: options
    });

    // Note that, in the future, it would be good to track emissions of "typeUnknown" to
    // avoid logic errors that result in circular routes.
    // (part of the effort to make a more friendly environment for custom hook developers)
  }

  // Makes `.bind()` chainable (sort of)
  return sails;

}



/**
 * Requests will be redirected to the specified string
 * (which should be a URL or redirectable path.)
 *
 * @api private
 */
function bindRedirect(path, redirectTo, verb, options) {
  var sails = this.sails;

  bind.apply(this,[path, function(req, res) {
    sails.log.verbose('Redirecting request (`' + path + '`) to `' + redirectTo + '`...');
    res.redirect(redirectTo);
  }, verb, options]);
}

/**
 * Bind a previously-loaded action to a URL.
 * (which should be a URL or redirectable path.)
 *
 * @api private
 */
function bindAction(path, target, verb, options) {

  var self = this;

  var sails = this.sails;

  var actionIdentity;
  try {
    actionIdentity = self.getActionIdentityForTarget(target);
  } catch (e) {
    throw flaverr({name: e.name || 'sailsError', code: e.code || 'E_UNKNOWN_BIND_ERROR'}, new Error('Error attempting to bind `' + (verb || 'ALL') + ' ' + path + '` to ' + JSON.stringify(target) + ': ' + e.message));
  }

  if (_.isObject(target)) {
    // Fold any other properties in the target into a shallow clone of the "options" dictionary
    options = _.extend({}, options, _.omit(target, 'action'));
  }

  // If there's no loaded action with that identity, log a warning and continue.
  if (!sails._actions[actionIdentity]) {
    sails.log.warn('Ignored attempt to bind route (' + path + ') to unknown action ::', target);
    return;
  }

  // Add "action" property to the route options, and set the _middlewareType property if the function doesn't already have one.
  _.extend(options || {}, {action: actionIdentity, _middlewareType: (sails._actions[actionIdentity] && sails._actions[actionIdentity]._middlewareType || 'ACTION: ' + actionIdentity)});

  // Loop through all of the registered action middleware, and find
  // any that should apply to the action with the given identity.
  var actionMiddlewareToRun = _.reduce(sails._actionMiddleware, function(memo, middlewareList, key) {
    // Split the key into an array and sort it so that strings starting with '!' come first.
    var targets = key.split(',').sort();
    _.any(targets, function(target) {
      // Remove any whitespace surrounding the target.
      target = target.trim();
      // If the target starts with a '!' (meaning that any actions matching it should _not_
      // run the middleware), and the target matches, bust out of this loop early.
      if (target[0] === '!') {
        target = target.substr(1);
        if (
          // Does the target end in a `/*`, and the action identity matches the wildcard?
          (target.slice(-2) === '/*' && ((actionIdentity.indexOf(target.slice(0,-1)) === 0) || actionIdentity === target.slice(0, -2)) ) ||
          // Does the target match the action identity exactly?
          (actionIdentity === target)
        ) {
          // We found a matching target, so we can exit this loop.
          return true;
        }
      }
      // If the target doesn't start with a '!', it means we already got past all of the
      // negative targets (since the targets are sorted alphabetically), so we can safely
      // add any middleware that this action matches.
      else {
        if (
          // If the registered action middleware key is '*'...
          target === '*' ||
          // Or ends in '/*' so that the current action identity matches the wildcard...
          (target.slice(-2) === '/*' && ((actionIdentity.indexOf(target.slice(0,-1)) === 0) || actionIdentity === target.slice(0, -2)) ) ||
          // Or matches the current action identity exactly...
          (actionIdentity === target)
        ) {
          // Then add the action middleware from this key to the list of middleware
          // to run before the action.
          memo = memo.concat(middlewareList);
          // We found a matching target, so we can exit this loop.
          return true;
        }
      }
      // Check the next target.
      return false;
    });
    // Keep on reducin'.
    return memo;
  }, []);

  // Get a unique list of middleware, in case any were added more than once.
  actionMiddlewareToRun = _.uniq(actionMiddlewareToRun);

  // Bind each middleware to the identity.
  _.each(actionMiddlewareToRun, function(middleware) {
    // console.log('binding middleware', middleware.toString(), 'to path', verb + ' ' + path);
    bind.apply(self, [path, middleware, verb, options]);
  });

  // Now, bind a function to the route which calls the specified action.
  bind.apply(this,[path, function(req, res, next) {

    // If the specified action doesn't exist in the internal actions dictionary.
    // bail out early.
    if (!_.isFunction(sails._actions[actionIdentity])) {
      return next(new Error('Consistency violation: Request (' + req.method + ' ' + req.path + ') matched a route that is bound to action `' + actionIdentity + '`, but no such action has been registered.  This never should have happened, because the route never should have been bound in the first place.'));
    }

    // Create a mock "next" function to catch unauthorized use of the third argument to route handlers.
    var mockNext = function(err) {
      if (err) {
        return next(new Error('`next` (as in req,res,next) should never be called in an action function (but in action `' + actionIdentity + '`, it was!)  It was called with an error: ' + (_.isError(err) ? err.stack : util.inspect(err, {
          depth: null
        }) + '') + '  Please use a method like `res.serverError()` or `res.badRequest()` instead.'));
      }

      return next(new Error('`next` (as in req,res,next) should never be called in an action function (but in action `' + actionIdentity + '`, it was!)  It was called with no arguments.  Please use a method like `res.ok()` or `res.json()` instead.'));

    };//ƒ

    try {
      // Catch errors in async actions.  See more notes about async route handlers in the `bindFunction` code below.
      // > FUTURE: optimize by precomputing this constructor.name check
      if (sails._actions[actionIdentity].constructor.name === 'AsyncFunction') {
        // Call the action with the specified identity, passing in req and res, as well as `mockRes` to catch unauthorized
        // use of `next` inside of end-user action code.
        var promise = sails._actions[actionIdentity](req, res, mockNext);
        promise.catch(function(e) {
          // If we do catch an error, use `next` to let Express handle it correctly.
          next(e);
        });

      }

      // For synchronous actions, just call the function.
      else {
        // Call the action with the specified identity, passing in req and res, as well as `mockRes` to catch unauthorized
        // use of `next` inside of end-user action code.
        return sails._actions[actionIdentity](req, res, mockNext);
      }
    } catch(e) {
      // If we do catch an error, use `next` to let Express handle it correctly.
      return next(e);
    }


  }, verb, options]);
}


/**
 * Recursively bind an array of targets in order
 *
 * TODO: Use a counter to prevent indefinite loops--
 * only possible if a bad route is bound,
 * but would still potentially be helpful.
 *
 * @api private
 */
function bindArray(path, target, verb, options) {
  var self = this;
  var sails = this.sails;

  if (target.length === 0) {
    sails.log.verbose('Ignoring empty array in `router.bind(' + path + ')`...');
  } else {
    // Bind each middleware fn
    _.each(target, function(fn) {
      bind.apply(self,[path, fn, verb, options]);
    });
  }
}



/**
 * Attach middleware function to route.
 *
 * @api private
 */
function bindFunction(path, fn, verb, options) {
  var sails = this.sails;

  // Make sure (optional) options is a valid plain object ({})
  // TODO -- replace _.isPlainObject with _.isObject && !_.isArray && !_.isFunction ?
  // TODO -- if we're doing _.cloneDeep here, do we need it in all the places we do it in blueprints?
  options = _.isPlainObject(options) ? _.cloneDeep(options) : {};

  // Warn about no-longer-used blueprint request options.
  if (_.intersection(_.keys(options), ['populate', 'skip', 'limit', 'sort', 'where']).length > 0) {
    sails.log.debug('In route `' + verb + ' ' + path + ':');
    sails.log.debug('The `populate`, `skip`, `limit`, `sort` and `where` route options are no longer supported in Sails 1.0.');
    sails.log.debug('Instead, you can use a `parseBlueprintOptions` function to fully customize blueprint behavior for a route.');
    sails.log.debug('See http://sailsjs.com/docs/reference/configuration/sails-config-blueprints#?using-parseblueprintoptions.');
    sails.log.debug();
  }

  // Get the _middlewareType of the function.
  var _middlewareType =
    // If it was set on the function itself, use that.
    fn._middlewareType ||
    // Otherwise if options._middlewareType is set (probably because the function was defined inline
    // in a call to `.bind()`), use that.
    options._middlewareType ||
    // Otherwise if the function has a name, use that.
    ('FUNCTION: ' + (fn.name || '<anonymous>'));

  // Set the middleware type on the function.  This can be useful for debugging if the same function
  // was bound in different contexts (like different actions).
  fn._middlewareType = _middlewareType;

  // Remove any _middlewareType property from the options.  It's done its job, and we don't need
  // it to get merged into req.options.
  // delete options._middlewareType;

  // Log info about the bound route in SILLY mode.
  sails.log.silly('Binding route :: ', verb || '', path, _middlewareType);


  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // FUTURE: simplify away the unnecessary function declarations below and inline the logic instead.
  // (will make it much clearer what's going on; and any minimal performance impact will be in the form of gains)
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  /**
   * `router:route`
   *
   * Create a closure that emits the `router:route` event each time the route is hit
   * before actually triggering the target function.
   *
   * NOTE: Modifications to route path parameters (i.e. `req.params`) or to `req.options`
   * must be made here, since their values can change not only on a per-request, but
   * also a per-route basis.
   */
  var enhancedFn = function routeTargetFnWrapper(req, res, next) {

    // Set req.options, using `options` to supply default values.
    req.options = _.merge({}, options || {}, req.options || {});


    // This event can be tapped into to take control of
    // (synchronous) logic that should be run before each bound
    // route handler function runs.
    sails.emit('router:route', {
      req: req,
      res: res,
      next: next,
      options: options,
      fn: fn
    });


    // Trigger original route handler function.
    //
    // > Note that, if it is an async function, then we also attach a handler to `.catch()`
    // > its return value (which will be a promise) in order to handle rejections in the same
    // > way we handle exceptions that are thrown synchronously (mainly for the purpose of being able to use async/await)
    // > (https://trello.com/c/UdK9ooJ3/108-es7-async-await-in-core-sniff-request-handler-function-to-see-if-it-s-an-async-function-if-so-then-grab-the-return-value-from-th)
    try {
      if (fn.constructor.name === 'AsyncFunction') {
        // FUTURE: benchmark this and, if tangible enough, allow configuration to be used to hard-code functions
        // one way or the other.  (Frankly, seems like we could just forcefully swap all request handling functions
        // over to be async functions -- but that'd be kind of a big change and I'd rather wait for a later release
        // unless we can prove that that'd definitely be a 100% backwards compatible change)
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        var promise = fn(req, res, next);

        promise.catch(function(e) {
          // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
          // Note that async+await+bluebird+Node 8 errors are not necessarily "true" Error instances,
          // as per _.isError() anyway (see https://github.com/node-machine/machine/commits/6b9d9590794e33307df1f7ba91e328dd236446a9).
          // So if we want improve the stack trace here, we'd have to be a bit more relaxed and tolerate
          // these sorts of "errors" directly as well (by tweezing out the `cause`, which is where the
          // original Error lives.)
          //
          // Note: This is now taken care of automatically by flaverr.parseError()
          // (The implementation of this "tweezing" is in the default serverError
          // response handler though.)
          // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
          next(e);
          // (Note that we don't do `return next(e)` here.  That's on purpose--
          // to avoid sending the wrong idea to you, dear reader)
        });
      }
      else {
        fn(req, res, next);
      }
    } catch (e) { return next(e); }
  };

  /**
   * Wrap a regex route in a helper function that pulls out regex params
   *
   * Example: for route: 'r|/\\d+/(.*)/(.*)$|foo,bar', the two parenthesized
   * groups would be pulled out as req.params[0] and req.params[1] by Express;
   * the regexRouteWrapper would then map them to req.params['foo'] and req.params['bar']
   *
   * @param  {array} params List of params to apply to the req.params object
   * @return {Function} A middleware function
   */
  var regexRouteWrapper = function(params) {

    return function(req, res, next) {
      // Apply the regex route params
      params.forEach(function(param, index) {
        req.params[param] = req.params[index];
      });
      // Call enhancedFn (which is just defined above)
      enhancedFn(req, res, next);
    };
  };

  /**
   * Wrap a route in a helper function that first checks whether the URL matches
   * any of a set of regexes, and if so, skips the defined handler.
   *
   * @param  {array}   regexes Array of regexes to match the URL against
   * @param  {Function} fn      Middleware function to run if URL does NOT match regexes
   * @return {Function} A middleware function
   */
  var skipRegexesWrapper = function(regexes, fn) {

    // Remove anything that's not a regex
    regexes = _.compact(regexes.map(function(regex) {
      if (regex instanceof RegExp) {
        return regex;
      }
      sails.log.warn('Invalid regex "' + regex + '" supplied to skipRegexesWrapper; ignoring.');
      return undefined;
    }));


    return function(req, res, next) {

      // Check for matches
      for (var i = 0; i < regexes.length; i++) {
        if (req.url.match(regexes[i])) {
          // If we find one, bail out
          return next();
        }
      }

      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      // TODO: Need to double-check on this, but shouldn't this call `enhancedFn`, instead of just `fn`?
      // If so, then we can just make that change.  Otherwise, we need to do more here.
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

      // Otherwise continue with the handler
      return fn(req, res, next);

    };

  };

  // If verb is not specified, default to CRUD methods.
  // You can still explicitly route to "all /path" if you want ALLLLlllll the things.
  var targetVerb = verb || ['get', 'put', 'post', 'delete', 'patch'];

  // Ensure targetVerb is an array of lowercased verbs.
  if (!Array.isArray(targetVerb)) {targetVerb = [targetVerb.toLowerCase()];}
  else {
    targetVerb = _.map(targetVerb, function(verb) { return verb.toLowerCase(); });
  }

  // Function to actually bind
  var targetFn;

  // Regex to check if the route is...a regex.
  var regExRoute = /^r\|(.*)\|(.*)$/;

  // Perform the check
  var matches = path.match(regExRoute);

  // If it *is* a regex, create a RegExp object that Express can bind,
  // pull out the params, and wrap the handler in regexRouteWrapper
  if (matches) {
    path = new RegExp(matches[1]);
    var params = matches[2].split(',');
    targetFn = regexRouteWrapper(params);
  }

  // Otherwise just bind enhancedFn
  else {
    targetFn = enhancedFn;
  }

  // If options.skipRegex is specified, make sure it's an array
  if (options.skipRegex) {
    if (!Array.isArray(options.skipRegex)) {
      options.skipRegex = [options.skipRegex];
    }
  }
  // Otherwise just make it an empty array
  else {
    options.skipRegex = [];
  }

  // For GET routes ending in pattern vars, default `skipAssets` to true.
  if (_.isString(path) && path.match(/\:[^\/]+\/?$/) && _.isUndefined(options.skipAssets) && _.contains(targetVerb, 'get')) {
    options.skipAssets = true;
  }

  // If "skipAssets" option is true, add the skipAssets regex
  // to the options.skipRegex array
  if (options.skipAssets) {
    options.skipRegex.push(sails.LOOKS_LIKE_ASSET_RX);
  }

  // If we have anything in the options.skipRegex array, wrap
  // the target function again.
  if (options.skipRegex.length) {
    targetFn = skipRegexesWrapper(options.skipRegex, targetFn);
  }

  // Loop through the verbs we want to bind
  targetVerb.forEach(function(verb) {

    // Bind the function to the private router
    sails.router._privateRouter[verb](path, targetFn);

    // Emit an event to make hooks aware that a route was bound
    // This allows hooks to handle routes directly if they want to-
    // e.g. with Express, the handler for this event looks like:
    // sails.hooks.http.app[verb || 'all'](path, target);
    sails.emit('router:bind', {
      path: path,
      target: targetFn,
      verb: verb,
      options: options,
      originalFn: fn
    });

  });


}



/**
 * Sanitize the arguments to `sails.router.bind()`
 *
 * @returns {Object} sanitized arguments
 * @api private
 */
function sanitize(path, target, verb, options) {
  options = options || {};

  // If trying to bind '*', that's probably not what was intended, so fix it up
  path = path === '*' ? '/*' : path;

  // If route has an HTTP verb (e.g. `get /foo/bar`, `put /bar/foo`, etc.) parse it out,
  var detectedVerb = detectVerb(path);
  // then prune it from the path
  path = detectedVerb.original;
  // Keep track of parsed verb so we know if it was specified later
  options.detectedVerb = detectedVerb;

  // If a verb override was not specified,
  // use the detected verb from the string route
  if (!verb) {
    verb = detectedVerb.verb;
  }

  return {
    path: path,
    target: target,
    verb: verb,
    options: options
  };
}
