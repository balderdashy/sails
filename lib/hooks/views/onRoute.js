/**
 * Module dependencies
 */

var _ = require('lodash');



/**
 * Handle `route:typeUnknown` events.
 * This "teaches" the router to understand `view` in route target syntax.
 * This allows route addresses to be bound directly to serve specific views
 * without going through a custom action.
 *
 * e.g.
 * ```
 * "get /": {view: 'pages/homepage'}
 * ```
 *
 * @param {Sails} sails
 * @param {Dictionary} route
 *        route target definition
 */


module.exports = function onRoute (sails, route) {
  var target = route.target,
    path = route.path,
    verb = route.verb,
    options = route.options;

  // Support { view: 'foo/bar' } notation
  if ( _.isPlainObject(target) ) {
    if (_.isString(target.view)) {
      return bindView(path, target, verb, options);
    }
  }

  // Ignore unknown route syntax
  // If it needs to be understood by another hook, the hook would have also received
  // the typeUnknown event, so we're done.
  return;

  /**
   * Bind route to a view
   *
   * @param  {[type]} path    [description]
   * @param  {[type]} target  [description]
   * @param  {[type]} verb    [description]
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */
  function bindView ( path, target, verb, options ) { //:TODO 'options' is defined but never used.

    // Transform the view path into something Lodash _.get will understand (i.e. dots not slashes)
    var viewPath = target.view.replace(/\//g, '.');

    // Look up the view in our views hash
    if (_.get(sails.views, viewPath) === true) {
      return sails.router.bind(path, function serveView(req, res) {
        res.view(target.view);
      });
    }

    // For backwards compatibility, look for an index view if the specified view was
    // top-level and could not be found
    if (viewPath.indexOf('.') === -1) {
      if (_.get(sails.views, viewPath + '.index') === true) {
        return sails.router.bind(path, function serveView(req, res) {
          res.view(viewPath + '/index');
        });
      }
    }

    sails.log.error(
      'Ignoring attempt to bind route (' +
      path + ') to unknown view: ' + target.view
    );
    return;

  }
};
