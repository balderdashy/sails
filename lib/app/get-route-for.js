/**
 * Module dependencies
 */

var util = require('util');
var _ = require('@sailshq/lodash');
var detectVerb = require('../util/detect-verb');


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
  } catch (unusedErr) { // FUTURE: provide access to error details instead of swallowing
    var invalidUsageErr = new Error('Usage error: `sails.getRouteFor()` expects a string route target (e.g. "DuckController.quack") or a dictionary with either a target property (e.g. `{target: "DuckController.quack"}`) or an action property (e.g. `{controller: "user", action: "do-stuff"}` or `{action: "user/do-stuff"}`).  But instead, it received a `'+typeof routeQuery+'`: '+util.inspect(routeQuery, {depth: null}) );
    invalidUsageErr.code = 'E_USAGE';
    throw invalidUsageErr;
  }

  // Now look up the first route with this target (`routeTargetToLookup`).
  var firstMatchingRouteAddress = _.find(_.keys(sails.router.explicitRoutes), function (address) {
    var target = sails.router.explicitRoutes[address];
    // Attempt to look up the action that corresponds to this route target.
    var actionIdentity;
    try {
      actionIdentity = sails.router.getActionIdentityForTarget(target);
    } catch (e) {
      // If the target is not an action (i.e if it is a view, a raw req/res function or something else)
      // then just return false (it's not a match for the action we're looking up).
      if (e.code === 'E_NOT_ACTION_TARGET') {
        return false;
      }
      // If some other error occurred looking up the target, then throw it.
      throw e;
    }
    // Ok, we got an action identity.  Does it match the identity of the action we're trying to look up?
    return (actionIdentity === actionToLookup);
  });

  // If no route was found, throw an error.
  if (!firstMatchingRouteAddress) {
    var unrecognizedTargetErr = new Error('Route not found: No explicit route could be found in this app with the specified target (`'+util.inspect(routeQuery, {depth: null})+'`).');
    unrecognizedTargetErr.code = 'E_NOT_FOUND';
    throw unrecognizedTargetErr;
  }

  // Now that the raw route address been located, we'll normalize it:
  //
  // If route address is '*', it will be automatically corrected to `/*` when bound, so also reflect that here.
  firstMatchingRouteAddress = firstMatchingRouteAddress === '*' ? '/*' : firstMatchingRouteAddress;

  // Then we parse it into its HTTP method and URL pattern parts.
  var parsedAddress = detectVerb(firstMatchingRouteAddress);

  // At this point we being building the final return value- the route info dictionary.
  var routeInfo = {};
  routeInfo.method = parsedAddress.verb || '';
  routeInfo.url = parsedAddress.path;


  // And finally return the route info.
  return routeInfo;

};
