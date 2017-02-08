/**
 * Module dependencies
 */

var helpRegisterAction = require('./private/controller/help-register-action');


/**
 * Sails.prototype.registerAction()
 *
 * Register an action with Sails.
 *
 * Registered actions may be subsequently bound to routes.
 * This method will throw an error if an action with the specified
 * identity has already been registered.
 *
 * @param {Function|Dictionary} action  [The action to register]
 * @param {String} identity [The identity of the action]
 *
 * @context {SailsApp}
 *
 * @throws {Error} If there is a conflicting, previously-registered action
 *         @property {String} code (==='E_CONFLICT')
 *         @property {String} identity  [the conflicting identity (always the same as what was passed in)]
 *
 * @throws {Error} If the action is invalid
 *         @property {String} code (==='E_INVALID')
 *         @property {String} identity  [the action identity (always the same as what was passed in)]
 *         @property {Error} origError  [the original (raw/underlying) error from `machine-as-action`]
 *
 * @api public
 */
module.exports = function registerAction(action, identity, force) {

  var sails = this;

  // Call the private `helpRegisterAction` method, without `force` argument.
  helpRegisterAction(sails, action, identity, force);

};
