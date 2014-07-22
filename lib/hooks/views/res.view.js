/**
 * Module dependencies
 */

var path = require('path');
var util = require('util');
var _ = require('lodash');


/**
 * Adds res.view() method (an enhanced version of res.render) to response object.
 * `res.view()` automatically renders the appropriate view based on the calling middleware's source route
 * Note: the original function is still accessible via res.render()
 *
 * @param {Request}  req
 * @param {Response} res
 * @param {Function} next
 */

module.exports = function _addResViewMethod(req, res, next) {

  var sails = req._sails;

  // TODO: don't pass `next` into this method impl to avoid confusing situations.
  // i.e. wrap it up:
  // ```
  // function (req,res,next) { _addResViewMethod(req,res); next(); }
  // ```


  /**
   * res.guessView([locals], [couldNotGuessCb])
   *
   * @param  {Object} locals
   * @param  {Function} couldNotGuessCb
   */
  res.guessView = function (locals, couldNotGuessCb) {
    return res.view(locals, function viewReady(err, html) {

      // If this is an "implied view doesn't exist" error,
      // just serve JSON instead.
      if (err && (err.code === 'E_VIEW_INFER' || err.code === 'E_VIEW_FAILED')) {
        return (couldNotGuessCb||res.serverError)(err);
      }

      // But if some other sort of error occurred, call `res.serverError`
      else if (err) return res.serverError(err);

      // Otherwise we're good, serve the view
      return res.send(html);
    });
  };



  /**
   * res.view([specifiedPath|locals], [locals])
   *
   * @param {String} specifiedPath
   *				-> path to the view file to load (minus the file extension)
   *					relative to the app's `views` directory
   * @param {Object} locals
   *				-> view locals (data that is accessible in the view template)
   * @param {Function} cb_view(err)
   *				-> called when the view rendering is complete (response is already sent, or in the process)
   *					(probably should be @api private)
   * @api public
   */
  res.view = function(/* specifiedPath, locals, cb_view */) {

    var specifiedPath = arguments[0];
    var locals = arguments[1];
    var cb_view = arguments[2];

    // sails.log.silly('Running res.view() with arguments:',arguments);

    // By default, generate a path to the view using what we know about the controller+action
    var relPathToView;

    // Ensure req.target is an object, then merge it into req.options
    // (this helps ensure backwards compatibility for users who were relying
    //  on `req.target` in previous versions of Sails)
    req.options = _.defaults(req.options, req.target || {});

    // Try to guess the view by looking at the controller/action
    if (!req.options.view && (req.options.controller || req.options.model)) {
      relPathToView = (req.options.controller||req.options.model) + '/' + (req.options.action || 'index');
    }
    // Use the new view config
    else relPathToView = req.options.view;

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

    if (_.isFunction(arguments[1])) {
      cb_view = arguments[1];
    }

    // if (_.isFunction(locals)) {
    //   cb_view = locals;
    //   locals = {};
    // }
    // if (_.isFunction(specifiedPath)) {
    //   cb_view = specifiedPath;
    // }

    // If a view path cannot be inferred, send back an error instead
    if (!relPathToView) {
      var err = new Error();
      err.name = 'Error in res.view()';
      err.type = err.code = 'E_VIEW_INFER';
      err.message = 'No path specified, and no path could be inferred from the request context.';

      // Prevent endless recursion:
      if (req._errorInResView) { return res.send(500); }
      req._errorInResView = err;

      if (cb_view) { return cb_view(err); }
      else return res.serverError(err);
    }


    // Ensure specifiedPath is a string (important)
    relPathToView = '' + relPathToView + '';

    // Ensure `locals` is an object
    locals = _.isObject(locals) ? locals : {};

    // Mixin locals from req.options
    if (req.options.locals) {
      locals = _.merge(locals, req.options.locals);
    }

    // Merge with config views locals
    if (sails.config.views.locals) {
      _.merge(locals, sails.config.views.locals, _.defaults);
    }

    // If the path was specified, but invalid
    // else if (specifiedPath) {
    // 	return res.serverError(new Error('Specified path for view (' + specifiedPath + ') is invalid!'));
    // }

    // Trim trailing slash
    if (relPathToView[(relPathToView.length - 1)] === '/') {
      relPathToView = relPathToView.slice(0, -1);
    }

    // if local `layout` is set to true or unspecified
    // fall back to global config
    var layout = locals.layout;
    if (locals.layout === undefined || locals.layout === true) {
      layout = sails.config.views.layout;
    }

    // Disable sails built-in layouts for all view engine's except for ejs
    if (sails.config.views.engine.ext !== 'ejs') {
      layout = false;
    }

    // Allow `res.locals.layout` to override if it was set:
    if (typeof res.locals.layout !== 'undefined') {
      layout = res.locals.layout;
    }

    var pathToViews = sails.config.paths.views;
    var absPathToView = path.join(pathToViews, relPathToView);
    var absPathToLayout;
    var relPathToLayout;

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

    // Locals passed in to `res.view()` override app and route locals.
    _.each(locals, function(local, key) {
      res.locals[key] = local;
    });


    // Provide access to view metadata in locals
    // (for convenience)
    res.locals.view = res.locals.view || {
      path: relPathToView,
      absPath: absPathToView,
      pathFromViews: relPathToView,
      pathFromApp: path.join(path.relative(sails.config.appPath, sails.config.paths.views), relPathToView),
      ext: sails.config.views.engine.ext
    };

    // In development, provide access to complete path to view via `__dirname` local.
    if (sails.config.environment !== 'production') {
      res.locals.__dirname = res.locals.__dirname ||
        absPathToView + '.' + sails.config.views.engine.ext;
    }

    // If silly logging is enabled, display some diagnostic information about the res.view() call:
    if (specifiedPath) { sails.log.silly('View override argument passed to res.view(): ', specifiedPath); }
    sails.log.silly('Serving view at rel path: ', relPathToView);
    sails.log.silly('View root: ', sails.config.paths.views);

    // Render the view
    return res.render(relPathToView, locals, function viewFailedToRender(err, renderedViewStr) {


      // Prevent endless recursion:
      if (err && req._errorInResView) {
        return res.send(500, err);
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
      if (typeof cb_view === 'function') {
        // The provided cb_view callback will receive the error (if there is one)
        // as the first argument, and the rendered HTML as the second argument.
        return cb_view(err, renderedViewStr);
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
            return res.json(500, err);
          }
          else return res.send(500);
          //
          //////////////////////////////////////////////////////////////////
        }

        // If verbose logging is enabled, write a log w/ the layout and view that was rendered.
        sails.log.verbose('Rendering view: "%s" (located @ "%s")', relPathToView,absPathToView);
        layout && sails.log.verbose('• using configured layout:: %s (located @ "%s")', layout, absPathToLayout);

        // Finally, send the compiled HTML from the view down to the client
        res.send(renderedViewStr);
      }

    });
  };

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
