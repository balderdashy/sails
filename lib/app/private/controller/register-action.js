var _ = require('lodash');
var machineAsAction = require('machine-as-action');

module.exports = function registerAction(action, identity, force) {

  // Get a reference to the Sails private actions hash.
  var actions = this._actions;

  // Make sure identity is lowercased.
  identity = identity.toLowerCase();

  // If we already loaded an action with this identity, bail unless `force` is true.
  if (actions[identity] && !force) {
    var conflictError = new Error('The action `' + identity + '` could not be loaded because it conflicts with a previously-loaded action.');
    conflictError.code = 'E_CONFLICT';
    conflictError.identity = identity;
    throw conflictError;
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
      var invalidError = new Error('The action `' + actionName + '` in file `' + filePath + '` is invalid.  It looks like a machine definition, but it could not be used to build a machine.\nThe error returned was: "'+e+'"');
      invalidError.code = 'E_INVALID';
      invalidError.identity = identity;
      invalidError.origError = e;
      throw invalidError;
    }
  }

  // Set the _middlewareType, which is used in the silly output to
  // identity what kind of a thing a route is bound to.
  actions[identity]._middlewareType = actions[identity]._middlewareType || 'ACTION: ' + identity;

};
