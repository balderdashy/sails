/**
 * Sails.prototype.registerAction()
 *
 * Register an action with Sails.
 *
 * Registered actions may be subsequently bound to routes.
 * This method will throw an error if an action with the specified
 * identity has already been registered.
 *
 * @param {fn/node-machine def} action The action to register
 * @param {string} identity The identity of the action
 *
 *
 * @api public
 */
module.exports = function registerAction(action, identity) {

  // Use the private `registerAction` method, without `force`.
  this._controller.registerAction(action, identity);

};
