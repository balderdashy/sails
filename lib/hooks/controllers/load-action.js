var _ = require('lodash');
var machineAsAction = require('machine-as-action');

module.exports = function (action, identity, actionName, filePath) {

  // Ignore strings (this could be the "identity" property of a module).
  if (_.isString(action)) {return;}

  var actions = sails.hooks.controllers._actions;

  // If we already loaded an action with this identity, bail.
  if (actions[identity]) {
    throw new Error('The action `' + actionName + '` in `' + filePath + '` conflicts with a previously-loaded action.');
  }

  // If the action is already a function, hope it's a req/res function
  // and save it in our set of actions.
  if (_.isFunction(action)) {
    actions[identity] = action;
  }

  // Otherwise if the action is a dictionary containing an `fn` property,
  // attempt to load it with machine-as-action.
  else if (_.isFunction(action.fn)) {
    try {
      actions[identity] =  machineAsAction(action);
    }
    // If a machine couldn't be built from the action, bail.
    catch (e) {
      throw new Error('The action `' + actionName + '` in file `' + filePath + '` is invalid.  It looks like a machine definition, but it could not be used to build a machine (returned error "'+e+'".');
    }
  }
  // If the action isn't a function or a dictionary with an `fn`, bail.
  else {
    throw new Error('The action `' + actionName + '` in file `' + filePath + '` is invalid.  Actions must either be functions or node machine definitions.');
  }

  // Set the _middlewareType, which is used in the silly output to
  // identity what kind of a thing a route is bound to.
  actions[identity]._middlewareType = 'ACTION: ' + identity;

};
