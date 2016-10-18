/**
 * Sails.prototype.registerActionMiddleware()
 *
 * Register an action middleware with Sails.
 *
 * Action middleware runs before the action or actions
 * specified by the middleware key.
 *
 * @param {fn} middleware The function to register
 * @param {string} actions The identity of the action or actions that this middleware should apply to.
 *                         Use * at the end for a wildcard; e.g. `user.*` will apply to any actions
 *                         whose identity begins with `user.`.
 *
 *
 * @api public
 */
module.exports = function registerAction(middleware, actions) {

  // TODO -- update machine-as-action with a response type that calls `next`,
  // so machine defs can be registered as middleware?
  if (!_.isArray(middleware)) {
    middleware = [middleware];
  }

  if (!_.all(middleware, _.isFunction)) {
    throw new Error('Attempted to register middleware for `' + actions + '` but one or more of the provided middleware was not a function.');
  }

  // Get or create the array for this middleware key.
  var middlewareForKey = this._actionMiddleware[actions] || [];

  // Add this middleware to the array.
  middlewareForKey = middlewareForKey.concat(middleware);

  // Assign the array back to the dictionary.
  this._actionMiddleware[actions] = middlewareForKey;

};
