/**
 * Module dependencies
 */

var util = require('util');
var _ = require('@sailshq/lodash');
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

  // Validate and normalize usage.
  var routeTargetToLookup;
  if ( _.isString(routeQuery) ) {
    routeTargetToLookup = routeQuery;
  }
  else if ( _.isObject(routeQuery) && _.isString(routeQuery.target) ) {
    routeTargetToLookup = routeQuery.target;
  }
  else {
    var invalidUsageErr = new Error('Usage error: `sails.getRouteFor()` expects a string route target (e.g. "DuckController.quack") or a dictionary with a target property (e.g. `{target: "DuckController.quack"}`).  But instead, it received a `'+typeof routeQuery+'`: '+util.inspect(routeQuery, {depth: null}) );
    invalidUsageErr.code = 'E_USAGE';
    throw invalidUsageErr;
  }

  // Split the provided route target string to look up on its dot, getting its controller and action parts.
  var routeTargetToLookupPieces = routeTargetToLookup.split('.');

  // If it doesn't have a dot, throw a usage error.
  if ( routeTargetToLookupPieces.length < 2 ) {
    var ambiguousUsageErr = new Error('Usage error: Ambiguous usage- target specified to `sails.getRouteFor()` is not a valid route target string (e.g. "DuckController.quack") because there is no dot (".")');
    ambiguousUsageErr.code = 'E_USAGE';
    throw ambiguousUsageErr;
  }

  // Now look up the first route with this target (`routeTargetToLookup`).
  var firstMatchingRouteAddress;
  _.any(sails.router.explicitRoutes, function (routeTarget, key) {
    // If route target syntax is a string, compare it directly with the provided `routeTargetToLookup`.
    if ( _.isString(routeTarget) ) {
      if (routeTarget===routeTargetToLookup ) {
        firstMatchingRouteAddress = key;
        return true;
      }
      else {
        // TODO: If that check fails, try removing "Controller" suffix from both `routeTargetToLookup` and the controller in the `routeTarget` and comparing those. Note that this means you _should not define `ControllerController.js`_!
        // * * * ACTUALLY, see: https://github.com/balderdashy/sails/issues/3402#issuecomment-173255376   * * *
      }
    }
    else if ( _.isObject(routeTarget) ) {
      // If route target syntax itself contains a string `target` key, compare it directly with the provided `routeTargetToLookup`.
      if ( _.isString(routeTarget.target) && routeTarget.target===routeTargetToLookup ) {
        // TODO: If that check fails, try removing "Controller" suffix from both `routeTargetToLookup` and the controller in the `routeTarget` and comparing those. Note that this means you _should not define `ControllerController.js`_!
        // * * * ACTUALLY, see: https://github.com/balderdashy/sails/issues/3402#issuecomment-173255376   * * *
        firstMatchingRouteAddress = key;
        return true;
      }
      // If route target syntax contains `controller`+`action` keys, then check those against the relevant pieces of the provided `routeTargetToLookup`.
      else if ( _.isString(routeTarget.controller) && _.isString(routeTarget.action) && routeTarget.controller===routeTargetToLookupPieces[0] && routeTarget.action===routeTargetToLookupPieces[1] ) {
        // TODO: If that check fails, try removing "Controller" suffix from both `routeTargetToLookup` and the controller in the `routeTarget` and comparing those. Note that this means you _should not define `ControllerController.js`_!
        // * * * ACTUALLY, see: https://github.com/balderdashy/sails/issues/3402#issuecomment-173255376   * * *
        firstMatchingRouteAddress = key;
        return true;
      }
      // If route target syntax contains only `controller`, compare assuming the "index" action against the relevant pieces of the provided `routeTargetToLookup`.
      else if ( _.isString(routeTarget.controller) && !routeTarget.action && routeTarget.controller===routeTargetToLookupPieces[0] && 'index'===routeTargetToLookupPieces[1] ) {
        // TODO: If that check fails, try removing "Controller" suffix from both `routeTargetToLookup` and the controller in the `routeTarget` and comparing those. Note that this means you _should not define `ControllerController.js`_!
        // * * * ACTUALLY, see: https://github.com/balderdashy/sails/issues/3402#issuecomment-173255376   * * *
        firstMatchingRouteAddress = key;
        return true;
      }
      // Note that we ignore non-matches or anything utterly insane.
    }
  });


  // If no route was found, throw an error.
  if (!firstMatchingRouteAddress) {
    var unrecognizedTargetErr = new Error('Route not found: No explicit route could be found in this app with the specified target (`'+routeTargetToLookup+'`).');
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
