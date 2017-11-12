/**
 * Module dependencies
 */

var path = require('path');
var util = require('util');
var _ = require('@sailshq/lodash');
var htmlScriptify = require('./html-scriptify');


/**
 * Adds `res.view()` (an enhanced version of res.render) and `res.guessView()` methods to response object.
 * `res.view()` automatically renders the appropriate view based on the calling middleware's source route
 * Note: the original function is still accessible via res.render()
 *
 * @param {Request}  req
 * @param {Response} res
 * @param {Function} next
 */

module.exports = function _addResViewMethod(req, res, next) {

  var sails = req._sails;

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // TODO: don't pass `next` into this method impl to avoid confusing situations.
  // i.e. wrap it up:
  // ```
  // function (req,res,next) { _addResViewMethod(req,res); next(); }
  // ```
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



  /**
   * res.guessView([locals], [couldNotGuessCb])
   *
   * @param  {Object} locals
   * @param  {Function} couldNotGuessCb
   */
  res.guessView = function (locals, couldNotGuessCb) {

    // - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // FUTURE: Completely remove res.guessView()
    // - - - - - - - - - - - - - - - - - - - - - - - - - - -
    sails.log.warn(
      '`res.guessView()` is deprecated in Sails >= v1.0.  If you want to continue to use it\n'+
      'in your Sails app, please just drop its implementation into a hook.\n'+
      ' [?] Unsure or need advice?  Stop by https://sailsjs.com/support'
    );

    return res.view(locals, function viewReady(err, html) {

      // If this is an "implied view doesn't exist" error,
      // just serve JSON instead.
      if (err && (err.code === 'E_VIEW_INFER' || err.code === 'E_VIEW_FAILED')) {
        return (couldNotGuessCb||res.serverError)(err);
      }

      // But if some other sort of error occurred, call `res.serverError`
      else if (err) {return res.serverError(err);}

      // Otherwise we're good, serve the view
      return res.send(html);
    });
  };//</defun:: res.guessView()>



  /**
   * res.view([specifiedPath|locals], [locals])
   *
   * @param {String} specifiedPath
   *        -> path to the view file to load (minus the file extension)
   *          relative to the app's `views` directory
   * @param {Object} locals
   *        -> view locals (data that is accessible in the view template)
   * @param {Function} optionalCb(err)
   *        -> called when the view rendering is complete (response is already sent, or in the process)
   *          (probably should be @api private)
   * @api public
   */
  res.view = function(/* specifiedPath, locals, optionalCb */) {

    var specifiedPath = arguments[0];
    var locals = arguments[1];
    var optionalCb = arguments[2];

    // sails.log.silly('Running res.view() with arguments:',arguments);

    // By default, generate a path to the view using what we know about the controller+action
    var relPathToView;

    // Ensure req.target is an object, then merge it into req.options
    // (this helps ensure backwards compatibility for users who were relying
    //  on `req.target` in previous versions of Sails)
    req.options = _.defaults(req.options, req.target || {});

    // Try to guess the view by looking at the controller/action
    if (!req.options.view && req.options.action) {
      relPathToView = req.options.action.replace(/\./g, '/');
    }
    // Use the new view config
    else {relPathToView = req.options.view;}

    // Now we have a reasonable guess in `relPathToView`

    // If the path to a view was explicitly specified, use that
    // Serve the view specified
    //
    // If first arg is not an obj or function, treat it like the path
    if (specifiedPath && !_.isObject(specifiedPath) && !_.isFunction(specifiedPath)) {
      relPathToView = specifiedPath;
    }

    // If the "locals" argument is actually the "specifiedPath"
    // give em the old switcheroo
    if (!relPathToView && _.isString(arguments[1])) {
      relPathToView = arguments[1] || relPathToView;
    }
    // If first arg ISSSSS AN object, treat it like locals
    if (_.isObject(arguments[0])) {
      locals = arguments[0];
    }
    // If the second argument is a function, treat it like the callback.
    if (_.isFunction(arguments[1])) {
      optionalCb = arguments[1];
      // In which case if the first argument is a string, it means no locals were specified,
      // so set `locals` to an empty dictionary and log a warning.
      if (_.isString(arguments[0])) {
        sails.log.warn('`res.view` called with (path, cb) signature (using path `' + specifiedPath + '`).  You should use `res.view(path, {}, cb)` to render a view without local variables.');
        locals = {};
      }
    }

    // if (_.isFunction(locals)) {
    //   optionalCb = locals;
    //   locals = {};
    // }
    // if (_.isFunction(specifiedPath)) {
    //   optionalCb = specifiedPath;
    // }

    // If a view path cannot be inferred, send back an error instead
    if (!relPathToView) {
      var err = new Error();
      err.name = 'Error in res.view()';
      err.code = 'E_VIEW_INFER';
      err.type = err.code;// <<TODO remove this
      err.message = 'No path specified, and no path could be inferred from the request context.';

      // Prevent endless recursion:
      if (req._errorInResView) { return res.sendStatus(500); }
      req._errorInResView = err;

      if (optionalCb) { return optionalCb(err); }
      else {return res.serverError(err);}
    }


    // Ensure specifiedPath is a string (important)
    relPathToView = '' + relPathToView + '';

    // Ensure `locals` is an object
    locals = _.isObject(locals) ? locals : {};

    // Mixin locals from req.options.
    // TODO -- replace this _.merge() with a call to the merge-dictionaries module?
    if (req.options.locals) {
      locals = _.merge(locals, req.options.locals);
    }

    // Merge with config views locals
    if (sails.config.views.locals) {
      // Formerly a deep merge: `_.merge(locals, sails.config.views.locals, _.defaults);`
      // Now shallow- see https://github.com/balderdashy/sails/issues/3500
      _.defaults(locals, sails.config.views.locals);
    }

    // If the path was specified, but invalid
    // else if (specifiedPath) {
    //   return res.serverError(new Error('Specified path for view (' + specifiedPath + ') is invalid!'));
    // }

    // Trim trailing slash
    if (relPathToView[(relPathToView.length - 1)] === '/') {
      relPathToView = relPathToView.slice(0, -1);
    }

    var pathToViews = sails.config.paths.views;
    var absPathToView = path.join(pathToViews, relPathToView);
    var absPathToLayout;
    var relPathToLayout;
    var layout = false;

    // Deal with layout options only if there is no custom rendering function in place --
    // that is, only if we're using the default EJS layouts.
    if (!sails.config.views.getRenderFn) {

      layout = locals.layout;

      // If local `layout` is set to true or unspecified
      // fall back to global config
      if (locals.layout === undefined || locals.layout === true) {
        layout = sails.config.views.layout;
      }

      // Allow `res.locals.layout` to override if it was set:
      if (typeof res.locals.layout !== 'undefined') {
        layout = res.locals.layout;
      }


      // At this point, layout should be either `false` or a string
      if (typeof layout !== 'string') {
        layout = false;
      }

      // Set layout file if enabled (using ejs-locals)
      if (layout) {

        // Solve relative path to layout from the view itself
        // (required by ejs-locals module)
        absPathToLayout = path.join(pathToViews, layout);
        relPathToLayout = path.relative(path.dirname(absPathToView), absPathToLayout);

        // If a layout was specified, set view local so it will be used
        res.locals._layoutFile = relPathToLayout;

        // sails.log.silly('Using layout at: ', absPathToLayout);
      }
    }

    // Locals passed in to `res.view()` override app and route locals.
    _.each(locals, function(local, key) {
      res.locals[key] = local;
    });


    // Provide access to view metadata in locals
    // (for convenience)
    if (_.isUndefined(res.locals.view)) {
      res.locals.view = {
        path: relPathToView,
        absPath: absPathToView,
        pathFromViews: relPathToView,
        pathFromApp: path.join(path.relative(sails.config.appPath, sails.config.paths.views), relPathToView),
        ext: sails.config.views.extension
      };
    }

    // Set up the `exposeLocalsToBrowser` view helper method
    // (unless there is already a local by the same name)
    //
    // Background:
    //  -> https://github.com/balderdashy/sails/pull/3522#issuecomment-174242822
    if (_.isUndefined(res.locals.exposeLocalsToBrowser)) {
      res.locals.exposeLocalsToBrowser = function (options){
        if (!_.isObject(options)) { options = {}; }

        // Note:
        // We get access to locals using a reference obtained via closure--
        // and since this view helper won't be used until AFTER the rest of
        // the code in THIS file has run, we know any relevant changes to
        // `locals` below will be available, since we're referring to the
        // same object.

        // Note that we include both explicit locals passed to res.view(),
        // and implicitly-set locals from `res.locals`.  But we exclude
        // non-relevant built-in properties like `sails` and `_`, as well
        // as experimental properties like `view`.
        //
        // Also note that we create a new dictionary to avoid tampering.
        var relevantLocals = {};

        _.each(_.union(_.keys(res.locals), _.keys(locals)), function(localName){

          // Explicitly exclude `_locals`, which appears even in explicit locals.
          // (FUTURE: longer term, could look into doing this _everywhere_ as an optimization-
          //  but need to investigate other view engines for potential differences)
          if (localName === '_locals') {}
          // Explicitly exclude `layout`, since it has special meaning,
          // even when it appears even in explicit locals.
          else if (localName === 'layout') {}
          // Otherwise, use explicit local, if available
          else if (locals[localName] !== undefined) {
            relevantLocals[localName] = locals[localName];
          }
          // Otherwise, use the one from res.locals... maybe.
          else {
            if (localName === '_csrf') {
              // Special case for CSRF token
              // > If the security hook is disabled, there won't be a CSRF token in the locals.
              // > If the hook is enabled but CSRF is disabled for this route, the token will
              // > be an empty string.  In either of those cases we can just skip it.
              if (res.locals._csrf !== undefined && res.locals._csrf !== '') {
                relevantLocals._csrf = res.locals._csrf;
              }
            }
            else if (_.contains(['_', 'sails', 'view', 'session', 'req', 'res', '__dirname', '_layoutFile'], localName)) {
              // Exclude any other auto-injected implicit locals
            }
            else if (_.isFunction(res.locals[localName])) {
              // Exclude any functions
            }
            else {
              // Otherwise include it!
              relevantLocals[localName] = res.locals[localName];
            }
          }
        });//∞

        // Return an HTML string which includes a special script tag.
        return htmlScriptify({
          data: relevantLocals,
          keys: options.keys,
          namespace: options.namespace,
          dontUnescapeOnClient: options.dontUnescapeOnClient
        });
      };//</defun :: res.locals.exposeLocalsToBrowser()>
    }//>-

    // Unless this is production, provide access to complete view path to view via `__dirname` local.
    if (process.env.NODE_ENV !== 'production') {
      res.locals.__dirname =
        res.locals.__dirname ||
        (absPathToView + '.' + sails.config.views.extension);
    }

    // If silly logging is enabled, display some diagnostic information about the res.view() call:
    if (specifiedPath) { sails.log.silly('View override argument passed to res.view(): ', specifiedPath); }
    sails.log.silly('Serving view at rel path: ', relPathToView);
    sails.log.silly('View root: ', sails.config.paths.views);

    // Render the view
    return res.render(relPathToView, locals, function viewFailedToRender(err, renderedViewStr) {


      // Prevent endless recursion:
      if (err && req._errorInResView) {
        return res.status(500).send(err);
      }


      if (err) {
        req._errorInResView = err;

        // Ensure that if res.serverError() likes to serve views,
        // it won't this time because we ran into a view error.
        req.wantsJSON = true;

        // Enhance the raw Express view error object
        // (this error appears when a view is missing)
        if (_.isObject(err) && err.view) {
          err = _.extend({
            message: util.format(
              'Could not render view "%s".  Tried locating view file @ "%s".%s',
              relPathToView,
              absPathToView,
              (layout ? util.format(' Layout configured as "%s", so tried using layout @ "%s")', layout, absPathToLayout) : '')
            ),
            code: 'E_VIEW_FAILED',
            status: 500
          }, err);
          err.inspect = function () {
            return err.message;
          };
        }
      }

      // If specified, trigger `res.view()` callback instead of proceeding
      if (typeof optionalCb === 'function') {
        // The provided optionalCb callback will receive the error (if there is one)
        // as the first argument, and the rendered HTML as the second argument.
        return optionalCb(err, renderedViewStr);
      }
      else {

        // if a template error occurred, don't rely on any of the Sails request/response methods
        // (since they may not exist yet at this point in the request lifecycle.)
        if (err) {

          //////////////////////////////////////////////////////////////////
          // TODO:
          // Consider removing this log and deferring to the logging that is
          // happening in res.serverError() instead.
          // sails.log.error('Error rendering view at ::', absPathToView);
          // sails.log.error('with layout located at ::', absPathToLayout);
          // sails.log.error(err && err.message);
          //
          //////////////////////////////////////////////////////////////////

          //////////////////////////////////////////////////////////////////
          // TODO:
          // Consider just calling some kind of default error handler fn here
          // in order to consolidate the "i dont know wtf i should do w/ this err" logic.
          // (keep in mind the `next` we have here is NOT THE SAME as the `next` from
          //  the point when this error occurred!  It is the next from when this
          //  method was initially attached to the request object in the views hook.)
          //
          if (res.serverError) {
            req.wantsJSON = true;
            return res.serverError(err);
          }
          else if (process.env.NODE_ENV !== 'production') {
            return res.status(500).send(err);
          }
          else {return res.sendStatus(500);}
          //
          //////////////////////////////////////////////////////////////////
        }

        // If verbose logging is enabled, write a log w/ the layout and view that was rendered.
        sails.log.verbose('Rendering view: "%s" (located @ "%s")', relPathToView,absPathToView);
        if (layout) {
          sails.log.verbose('• using configured layout:: %s (located @ "%s")', layout, absPathToLayout);
        }

        // Finally, send the compiled HTML from the view down to the client
        res.send(renderedViewStr);
      }

    });
  };//</defun :: res.view() >

  next();
};



// Express version updates should be closely monitored.
// Express is a "hard" dependency.
//
// While unlikely this will change, it's worth noting that this implementation
// relies on express's private implementation of res.render() here:
// https://github.com/visionmedia/express/blob/master/lib/response.js#L799
//
// To be safe, the version of the Express dependency in package.json will remain locked
// until it can be verified that each subsequent version is compatible.  Even patch releases!!
