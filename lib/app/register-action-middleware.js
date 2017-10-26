/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');
var flaverr = require('flaverr');


/**
 * Sails.prototype.registerActionMiddleware()
 *
 * Register an action middleware with Sails.
 *
 * > Action middleware runs before the action or actions specified by the `actionsGlobKey`.
 *
 * -------------------------------------------------------------------------------------------
 * @param {Function|Array} middleware
 *        The `(req,res,next)` function to register, or an array of such functions.
 *
 * @param {String} actionsGlobKey
 *        A special, limited glob expression that indicates the action or actions that
 *        this action middleware should apply to.  Use * at the end for a wildcard;
 *        e.g. `user/*` will apply to any actions whose identities begin with `user/`.
 *        Use a ! at the beginning to indicate that the action middleware should NOT
 *        apply to the actions specified by the glob, e.g. `!user/foo` or `!user/*`.
 *
 * @context {SailsApp}
 *
 * @api public
 */

module.exports = function registerActionMiddleware(middleware, actionsGlobKey) {

  var sails = this;

  // -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
  // FUTURE: explore how we might extend machine-as-action or implement
  // something entirely new (e.g. `machine-as-middleware`) that is kinda
  // like machine-as-action, but where the success response calls `next`)
  // This would be so that  machine defs can be registered as middleware?
  // -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --

  if (!_.isArray(middleware)) {
    middleware = [middleware];
  }

  if (!_.all(middleware, _.isFunction)) {
    throw flaverr({ name: 'userError', code: 'E_NON_FN_POLICY' }, new Error('Attempted to register action middleware(s) (aka policies) for `' + actionsGlobKey + '` but one or more provided action middlewares (policies) was not a function.'));
  }

  // Get or create the array for this glob key.
  var existingActionMiddlewareRegisteredForGlobKey = sails._actionMiddleware[actionsGlobKey] || [];

  // Add these middlewares to the array.
  existingActionMiddlewareRegisteredForGlobKey = existingActionMiddlewareRegisteredForGlobKey.concat(middleware);

  // Assign the array back to our `_actionMiddleware` dictionary.
  sails._actionMiddleware[actionsGlobKey] = existingActionMiddlewareRegisteredForGlobKey;

};
