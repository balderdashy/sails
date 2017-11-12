/**
 * Module dependencies
 */

var path = require('path');
var _ = require('@sailshq/lodash');


/**
 * @param  {SailsApp} sails
 * @return {Function}
 */
module.exports = function (sails) {

  /**
   * renderView()
   *
   * Usage:
   * • sails.renderView(…)
   *
   * @param {String} relPathToView
   *        -> path to the view file to load (minus the file extension)
   *          relative to the app's `views` directory
   * @param {Object} options
   *        -> options hash to pass to template renderer, including locals and locale
   * @param {Function} done(err)
   *        -> called when the view rendering is complete
   *
   * @api public
   */

  return function renderView(relPathToView, _options, done) {

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // TODO: pull out shared logic between this file and res.view.js
    // into a separate file.
    //
    // TODO: reuse code in res.view.js for most of this to make it more maintainable
    // currently it is not in sync w/ improvements/fixes in that other module.
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    if (!relPathToView && !_.isString(relPathToView)) {
      throw new Error('relPathToView must be a string.');
    }

    // Clone the options, just in case there are references to sails config or something
    // that could get messed up if the view code changes var values.
    var options = _.cloneDeep(_options || {});

    // Trim trailing slash
    if (relPathToView[(relPathToView.length - 1)] === '/') {
      relPathToView = relPathToView.slice(0, -1);
    }

    // if local `layout` is set to true or unspecified
    // fall back to global config
    var layout = options.layout;
    if (layout === undefined || layout === true) {
      layout = sails.config.views.layout;
    }

    // Disable sails built-in layouts for all view engine's except for ejs
    if (sails.config.views.getRenderFn) {
      layout = false;
    }

    var pathToViews = sails.config.paths.views;
    var absPathToView = path.join(pathToViews, relPathToView) + '.' + sails.config.views.extension;

    // Set layout file if enabled (using ejs-locals)
    if (layout) {
      // If a layout was specified, set view local so it will be used
      options._layoutFile = layout;
    }

    options.view = options.view || {
      path: relPathToView,
      pathFromViews: relPathToView,
      pathFromApp: path.join(path.relative(sails.config.appPath, sails.config.paths.views), relPathToView),
      ext: sails.config.views.extension
    };

    // In development, provide access to complete path to view
    // via `__dirname`
    if (process.env.NODE_ENV !== 'production') {
      options.__dirname = options.__dirname ||
        absPathToView + '.' + sails.config.views.extension;
    }

    // Set the options for the view rendering engine.  Copy all the current options into 'locals'
    // in case the template engine expects them there.
    _.extend(options, {
      locals: _.cloneDeep(options),
      settings: {
        'view engine': sails.config.views.extension,
        'views': sails.config.paths.views
      }
    });

    // If the i18n hook is enabled, internationalize before proceeding.
    (function _internationalizingIfRelevant(proceed){
      if (!sails.hooks.i18n) {
        return proceed();
      }

      // Set up a minimal mock request for the i18n hook to use.
      var req = {
        headers: {}
      };

      // If a locale was specified as an option, render the view with that locale
      req.headers['accept-language'] = options.locale || sails.hooks.i18n.defaultLocale;

      sails.hooks.i18n.expressMiddleware(req, options, function(err) {
        // ^^FUTURE: Take a closer look at this- it's a little suspicious.
        if (err) { return proceed(err); }

        try {
          // Set the locale if necessary
          if (options.locale) {
            req.locale = options.locale;
          }
        } catch (err) { return proceed(err); }

        return proceed();

      });//_∏_

    })(function(err) {
      if (err) { return done(err); }

      // Finally, compile the view template.
      sails.hooks.views._renderFn(absPathToView, options, function(err, compiledHtml){
        if (err) { return done(err); }
        return done(undefined, compiledHtml);
      });//_∏_

    });//_∏_ (†)

  };//ƒ

};
