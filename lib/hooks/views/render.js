/**
 * Module dependencies
 */

var path = require('path');
var _ = require('lodash');


// TODO: reuse code in res.view.js for most of this to make it more maintainable
// currently it is not in sync w/ improvements/fixes in that other module.

/**
 * sails.hooks.views.render(relPathToView, options, cb_view)
 *
 * @param {String} relPathToView
 *				-> path to the view file to load (minus the file extension)
 *					relative to the app's `views` directory
 * @param {Object} options
 *				-> options hash to pass to template renderer, including locals and locale
 * @param {Function} cb_view(err)
 *				-> called when the view rendering is complete (response is already sent, or in the process)
 *					(probably should be @api private)
 * @api public
 */

module.exports = function (sails) {

  return function render(relPathToView, _options, cb_view) {

    // TODO:
    // pull out shared logic between this file and res.view.js
    // into a separate file.

    if (!relPathToView && !_.isString(relPathToView)) {
      throw new Error('relPathToView must be a string.');
    }

    // Clone the options, just in case
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
    if (sails.config.views.engine.ext !== 'ejs') {
      layout = false;
    }

    var pathToViews = sails.config.paths.views;
    var absPathToView = path.join(pathToViews, relPathToView) + '.' + sails.config.views.engine.ext;

    // Set layout file if enabled (using ejs-locals)
    if (layout) {
      // If a layout was specified, set view local so it will be used
      options._layoutFile = layout;
    }

    options.view = options.view || {
      path: relPathToView,
      pathFromViews: relPathToView,
      pathFromApp: path.join(path.relative(sails.config.appPath, sails.config.paths.views), relPathToView),
      ext: sails.config.views.engine.ext
    };

    // In development, provide access to complete path to view
    // via `__dirname`
    if (sails.config.environment !== 'production') {
      options.__dirname = options.__dirname ||
        absPathToView + '.' + sails.config.views.engine.ext;
    }

    // Set the options for the view rendering engine.  Copy all the current options into 'locals'
    // in case the template engine expects them there.
    _.extend(options, {
      locals: _.cloneDeep(options),
      settings: {
        'view engine': sails.config.views.engine.ext,
        'views': sails.config.paths.views
      }
    });

    // Set up a mock request for i18n to use as context
    var req = {
      headers: {}
    };

    // Initialize i18n if hook is enabled
    if (sails.hooks.i18n) {
      require('i18n').init(req, options, function() {

        // Set the locale if necessary
        if (options.locale) {
          req.locale = options.locale;
        }

        // Render the view
        sails.config.views.engine.fn(absPathToView, options, cb_view);
      });
    } else {
      sails.config.views.engine.fn(absPathToView, options, cb_view);
    }

  };
};
