/**
 * Module dependencies
 */

var path = require('path');
var _ = require('@sailshq/lodash');
var flaverr = require('flaverr');
var parley = require('parley');


/**
 * @param  {SailsApp} sails
 * @return {Function}
 */
module.exports = function (sails) {

  /**
   * renderView()
   *
   * Return the HTML string obtained by loading and compiling the specified view
   * template with a dictionary of dynamic runtime data (and/or other view engine
   * other view engine options like `layout`.)
   *
   * Usage:
   * ```
   * var html = await sails.renderView('emails/reminders/email-verify-your-account', {
   *   fullName: 'Maggie Thatcher',
   *   accountCreatedAt: 1510521386197
   * });
   * ```
   *
   * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
   * @param {String} relPathToView
   *        Path to the view file to load (minus the file extension, and
   *        relative to the app's `views/` directory.)
   *
   * @param {Dictionary} _options
   *        View locals and/or options to pass to template renderer.
   *
   * @param {Function} optionalCb(err, compiledHtml)
   *        An optional callback.  If provided, it will be called when the
   *        view rendering is complete and this function will return `undefined`
   *        instead of returning a Deferred.
   *        @param {Error} err
   *        @param {String} compiledHtml
   * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
   *
   * @returns {Deferred?}
   *          (See https://npmjs.com/package/parley for more information.)
   *
   * @api public
   */

  return function renderView(relPathToView, _options, optionalCb) {

    // Build an omen, if appropriate.
    var omen = flaverr.omen(renderView);

    // Build & return Deferred (or if callback was provided, immediately run
    // the following logic and then trigger that callback.)
    return parley(
      function (done) {

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        // TODO: pull out shared logic between this file and res.view.js
        // into a separate file.
        //
        // TODO: reuse code in res.view.js for most of this to make it more maintainable
        // currently it is not in sync w/ improvements/fixes in that other module.
        //
        // (^^^ In particular, note that `exposeLocalsToBrowser` et al is not available
        // here in sails.renderView() as of yet)
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        if (!relPathToView && !_.isString(relPathToView)) {
          return done(flaverr({
            message: 'First argument must be a string -- the relative path to the desired template (from the `views/` folder).'
          }), omen);
        }//•

        // Shallow clone the provided locals, since we'll be making some modifications.
        // > (Note that this IS NO LONGER A DEEP CLONE!  So references to sails config etc
        // > provided to views should be respected, and not changed.)
        var options = _.extend({}, _options || {});

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

        // Handle compatibility issues with certain view rendering engines.
        // > Copy all the current options into 'locals', and explicitly set two settings,
        // > just in case the template engine expects them there.
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        // TODO: Explain which view engines require this in comments here, or if that
        // doesn't happen, then remove this code.
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        _.extend(options, {
          locals: _.extend({}, options),
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
          req.locale = options.locale || sails.hooks.i18n.defaultLocale;
          sails.hooks.i18n.expressMiddleware(req, options, function(err) {
            if (err) { return proceed(err); }
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

      },
      optionalCb,
      undefined,
      undefined,
      omen
    );//…)

  };//ƒ

};
