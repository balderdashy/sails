/**
 * Module dependencies
 */

var path = require('path');
var _ = require('lodash');



/**
 * onRoute()
 *
 * This is used for handling `route:typeUnknown` events; i.e. to
 * support { view: 'foo/bar' } notation. This "teaches" the router
 * to understand `view` in route target syntax. This allows route
 * addresses to be bound directly to serve specific views without
 * going through a custom action.
 *
 * e.g.
 * ```
 * 'get /': { view: 'pages/homepage' }
 * ```
 *
 * @param {Sails} sails
 * @param {Dictionary} route
 *        combined route target + route address dictionary
 */

module.exports = function onRoute (sails, route) {


  // Ignore unknown route syntax
  if ( !_.isPlainObject(route.target) || !_.isString(route.target.view) ) {
    // If it needs to be understood by another hook, the hook would have also received
    // the typeUnknown event, so we don't need to do anything here.
    return;
  }
  // Ensure there isn't a `.` in the view name.
  // (This limitation will be improved in a future version of Sails.)
  else if (route.target.view.match(/\./)) {
    sails.log.error('Ignoring attempt to bind route (`%s`) to a view with a `.` in the name (`%s`).',route.path, route.target.view);
    return;
  }
  // Otherwise construct an action function which serves a view and then bind it to the route.
  else {

    // Merge target into `options` to get hold of relevant route options:
    route.options = _.merge(route.options, route.target);
    // Note: this (^) could be moved up into lib/router/bind.js, since its
    // only pertinent for core options such as `skipAssets`.  There would need
    // to be changes in other hooks as well.

    // Transform the view path into something Lodash _.get will understand (i.e. dots not slashes)
    var transformedViewAddress = route.target.view.replace(/\//g, '.');
    var referenceInViewsHash = _.get(sails.views, transformedViewAddress);

    // Look up the view in our views hash and see if it is `true`
    // (i.e. indicating it is a view template file)
    if (referenceInViewsHash === true) {
      return sails.router.bind(route.path, function serveView(req, res) {
        return res.view(route.target.view);
      }, route.verb, route.options);
    }
    // Look for a relative `/index` view if the specified view
    // is in the views hash as a dictionary (i.e. indicating it is a directory)
    else if (_.isObject(referenceInViewsHash) && referenceInViewsHash.index === true) {
      var indexViewIdentity = path.join(route.target.view,'/index');
      return sails.router.bind(route.path, function serveView(req, res) {
        return res.view(indexViewIdentity);
      }, route.verb, route.options);
    }
    // Otherwise, the specified view in this route target doesn't match a
    // known view in the project, so ignore the attempt and inform the user.
    else {
      sails.log.error('Ignoring attempt to bind route (`%s`) to unknown view: `%s`',route.path, route.target.view);
    }
  }
};
