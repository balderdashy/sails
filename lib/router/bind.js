/**
 * Module dependencies.
 */

var _ = require('lodash');
var sailsUtil = require('sails-util');



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


  // Bind a list of multiple functions in order
  if (_.isArray(target)) {
    bindArray.apply(this, [path, target, verb, options]);
  }
  // Handle string redirects
  // (to either public-facing URLs or internal routes)
  else if (_.isString(target) && target.match(/^(https?:|\/)/)) {
    bindRedirect.apply(this, [path, target, verb, options]);
  }

  // Bind a middleware function directly
  else if (_.isFunction(target)) {
    bindFunction.apply(this, [path, target, verb, options]);
  }

  // If target is an object with a `target`, pull out the rest
  // of the keys as route options and then bind the target.
  else if (_.isPlainObject(target) && (target.target || target.fn)) {
    var _target = target.target || target.fn;
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

  // Regex to check if a URL is an asset (something with a file extension)
  var skipAssetsRegex = /^[^?]*\/[^?\/]+\.[^?\/]+(\?.*)?$/;

  // Make sure (optional) options is a valid plain object ({})
  options = _.isPlainObject(options) ? _.cloneDeep(options) : {};
  var _middlewareType = options._middlewareType || fn._middlewareType || (fn.name && ('FUNCTION: ' + fn.name));
  sails.log.silly('Binding route :: ', verb || '', path, _middlewareType?('('+_middlewareType+')'):'');


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

    // Set req.options, using `options` to supply default values
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
    fn(req, res, next);
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
      // Call enhancedFn
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
      sails.log.warn('Invalid regex "' + regex + "' supplied to skipRegexesWrapper; ignoring.");
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

      // Otherwise continue with the handler
      return fn(req, res, next);

    };

  };

  // If verb is not specified, default to CRUD methods.
  // You can still explicitly route to "all /path" if you want ALLLLlllll the things.
  var targetVerb = verb || ['get', 'put', 'post', 'delete', 'patch'];

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

  // If "skipAssets" option is true, add the skipAssets regex
  // to the options.skipRegex array
  if (options.skipAssets) {
    options.skipRegex.push(skipAssetsRegex);
  }

  // If we have anything in the options.skipRegex array, wrap
  // the target function again.
  if (options.skipRegex.length) {
    targetFn = skipRegexesWrapper(options.skipRegex, targetFn);
  }

  // Ensure targetVerb is an array
  if (!Array.isArray(targetVerb)) {targetVerb = [targetVerb];}
  // Loop through the verbs we want to bind
  targetVerb.forEach(function(verb) {
    verb = verb.toLowerCase();
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
  var detectedVerb = sailsUtil.detectVerb(path);
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
