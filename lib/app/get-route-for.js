/**
 * Module dependencies
 */

var util = require('util');
var _ = require('lodash');


/**
 * getRouteFor()
 *
 * Look up more information about the first explicit route defined in this app
 * which has the given route target.
 *
 * Note that this function _only searches explicit routes_ which have been configured
 * manually (e.g. in `config/routes.js`).  For more info, see:
 * https://github.com/balderdashy/sails/issues/3402#issuecomment-171633341
 * ----------------------------------------------------------------------------------------
 *
 * Usage:
 *
 * ```
 * getRouteFor('DuckController.quack');
 * getRouteFor({ target: 'DuckController.quack' });
 * // =>
 * // {
 * //   url: '/ducks/:id/quack',
 * //   method: 'post'
 * // }
 * ```
 */
module.exports = function getRouteFor(routeQuery){

  // Get reference to sails app instance.
  var sails = this;

  // Validate and normalize usage.
  var routeTargetToLookup;
  if ( _.isString(routeQuery) ) {
    routeTargetToLookup = routeQuery;
  }
  else if ( _.isObject(routeQuery) && _.isString(routeQuery.target) ) {
    routeTargetToLookup = routeQuery.target;
  }
  else {
    var usageErr = new Error('Usage error: `sails.getRouteFor()` expects a string route target (e.g. "DuckController.quack") or a dictionary with a target property (e.g. `{target: "DuckController.quack"}`).  But instead, it received a `'+typeof routeQuery+'`: '+util.inspect(routeQuery, {depth: null}) );
    usageErr.code = 'E_USAGE';
    throw usageErr;
  }

  // Now look up the first route with this target (`routeTargetToLookup`).
  var routeInfo = {url:'todo',method:'todo'};
  // TODO

  // And finally return the route info.
  return routeInfo;

};
