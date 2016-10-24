/**
 * Module dependencies
 */

var util = require('util');
var _ = require('lodash');
var sailsUtil = require('sails-util');


/**
 * getRouteFor()
 *
 * Look up more information about the first explicit route defined in this app
 * which has the given route target.
 *
 * Note that this function _only searches explicit routes_ which have been configured
 * manually (e.g. in `config/routes.js`).  For more info, see:
 * https://github.com/balderdashy/sails/issues/3402#issuecomment-171633341
 *
 * @this {SailsApp}
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

  // Get the identity of the action we're trying to look up, based on the route we're querying.
  var actionToLookup;
  try {
    actionToLookup = sails.router.getActionIdentityForTarget(routeQuery);
  }
  catch (e) {
    var invalidUsageErr = new Error('Usage error: `sails.getRouteFor()` expects a string route target (e.g. "DuckController.quack") or a dictionary with a target property (e.g. `{target: "DuckController.quack"}`).  But instead, it received a `'+typeof routeQuery+'`: '+util.inspect(routeQuery, {depth: null}) );
    invalidUsageErr.code = 'E_USAGE';
    throw invalidUsageErr;
  }

  // Now look up the first route with this target (`routeTargetToLookup`).
  var firstMatchingRouteAddress = _.find(_.keys(sails.router.explicitRoutes), function (address) {
    var target = sails.router.explicitRoutes[address];
    // See if the action that this route's target represents is the same as the one we're trying
    // to look up.
    return (sails.router.getActionIdentityForTarget(target) === actionToLookup);
    // If route target syntax is a string, compare it directly with the provided `routeTargetToLookup`.
  });

  // If no route was found, throw an error.
  if (!firstMatchingRouteAddress) {
    var unrecognizedTargetErr = new Error('Route not found: No explicit route could be found in this app with the specified target (`'+JSON.stringify(routeQuery)+'`).');
    unrecognizedTargetErr.code = 'E_NOT_FOUND';
    throw unrecognizedTargetErr;
  }

  // Now that the raw route address been located, we'll normalize it:
  //
  // If route address is '*', it will be automatically corrected to `/*` when bound, so also reflect that here.
  firstMatchingRouteAddress = firstMatchingRouteAddress === '*' ? '/*' : firstMatchingRouteAddress;

  // Then we parse it into its HTTP method and URL pattern parts.
  var parsedAddress = sailsUtil.detectVerb(firstMatchingRouteAddress);

  // At this point we being building the final return value- the route info dictionary.
  var routeInfo = {};
  routeInfo.method = parsedAddress.verb || '';
  routeInfo.url = parsedAddress.path;


  // And finally return the route info.
  return routeInfo;

};
