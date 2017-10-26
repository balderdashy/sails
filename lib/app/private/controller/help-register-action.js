/**
 * Module dependencies
 */

var util = require('util');
var assert = require('assert');
var _ = require('@sailshq/lodash');
var flaverr = require('flaverr');
var machineAsAction = require('machine-as-action');


/**
 * helpRegisterAction()
 *
 * @param  {SailsApp} sails
 * @param  {Function|Dictionary} action   [either a req/res function, or an actions2 (i.e. machine-as-action) definition]
 * @param  {String} identity   [the identity to register this action as]
 * @param  {Boolean} force
 *
 * @throws {Error} If there is a conflicting, previously-registered action
 *         @property {String} code (==='E_CONFLICT')
 *         @property {String} identity  [the conflicting identity (always the same as what was passed in)]
 *
 * @throws {Error} If the action is invalid
 *         @property {String} code (==='E_INVALID')
 *         @property {String} identity  [the action identity (always the same as what was passed in)]
 *         @property {Error} origError  [the original (raw/underlying) error from `machine-as-action`]
 */

module.exports = function helpRegisterAction(sails, action, identity, force) {

  assert(_.isObject(sails) && _.isObject(sails._actions), new Error('Consistency violation: `sails` (a Sails app instance) should be passed in as the first argument.'));
  assert(_.isFunction(action) || _.isObject(action), new Error('Consistency violation: `action` (2nd arg) should be provided as either a req/res/next function or a machine def (actions2), but instead, got: '+util.inspect(action,{depth:null})));
  assert(_.isString(identity), new Error('Consistency violation: Identity should be provided as a string, but instead, got: '+util.inspect(identity,{depth:null})));

  // Get a reference to the Sails private actions hash.
  var actions = sails._actions;

  // Make sure identity is lowercased.
  identity = identity.toLowerCase();

  // Identities can only have letters, numbers, dots, dashes and slashes.
  if (!identity.match(/^[a-z_][a-z0-9-_.]*(\/[a-z][a-z0-9-_.]*)*$/)) {
    throw flaverr({ name: 'userError', code: 'E_INVALID_ACTION_IDENTITY' }, new Error('Could not register action with invalid identity `' + identity + '`'));
  }

  // If we already registered an action with this identity, bail unless `force` is true.
  if (actions[identity] && !force) {
    throw flaverr({ name: 'userError', code: 'E_CONFLICT', identity: identity}, new Error('The action `' + identity + '` could not be registered because it conflicts with a previously-registered action.'));
  }

  // If the action is already a function, hope it's a req/res function
  // and save it in our set of actions.
  if (_.isFunction(action)) {
    actions[identity] = action;
  }

  // Otherwise try to interpret the action as a machine using machine-as-action.
  else {
    try {
      actions[identity] =  machineAsAction(action);
    }
    // If a machine couldn't be built from the action, bail.
    catch (e) {
      throw flaverr({ name: 'userError', code: 'E_INVALID', identity: identity, origError: e}, new Error('The action `' + identity + '` could not be registered.  It looks like a machine definition (actions2), but it could not be used to build an action.\nDetails: '+e.stack));
    }
  }

  // Set the _middlewareType, which is used when the log level is "silly" to
  // identify what kind of a thing a route address is bound to.
  actions[identity]._middlewareType = actions[identity]._middlewareType || 'ACTION: ' + identity;

};
