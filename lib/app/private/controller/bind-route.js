/**
 * Module dependencies.
 */

var _ = require('lodash');
var sailsUtil = require('sails-util');

/**
 * `interpretRouteSyntax()`
 *
 * "Teach" router to understand references to controllers.
 * This is the event handler for the 'route:typeUnknown' emitted on `sails`.
 *
 * @param  {Dictionary} route
 *         @property {String} verb
 *         @property {String} path
 *         @property {Dictionary} target
 *         @property {Dictionary} options
 *
 * @api private
 */
module.exports = function interpretRouteSyntax (route) {

  var sails = this;

  var target = route.target;
  var path = route.path;
  var verb = route.verb;
  var options = route.options;

  var actionIdentity;

  if (target.controller) {
    if (!target.action) {
      throw new Error('Encountered invalid route target syntax for address `' + (verb || 'ALL').toUpperCase + ' ' + path + '`; if `controller` is specified, `action` must be also!' );
    }

    actionIdentity = target.controller.replace('Controller', '').replace(/\//g, '.').toLowerCase() + '.' + target.action.toLowerCase();

    if (target.controller.indexOf('/') > -1) {
      sails.log.warn('Using `controller` route target syntax with nested legacy controllers is deprecated. '+
                     'Binding `' + target.controller + '.' + target.action + '` to `' + path + '` for now, but you should really change this to { action: \'' + actionIdentity + '\' }.');
    }

  }
  // Attempt to handle `{action: 'my-action'}` target.
  else {
    // Get the action identity by lowercasing the value of the `action` property.
    actionIdentity = target.action.toLowerCase();
    // Fold any other properties in the target into the "options" dictionary
    options = _.extend({}, options, _.omit(target, 'action'));
  }

  // Attempt to find an action with that identity.
  var action = sails._actions[actionIdentity];
  // If there is one, bind the given route address to the action.
  if (action) {
    // Make sure req.options.action is set to the identity of the action we're binding,
    // for cases where the { action: 'foo.bar' } syntax wasn't used.
    options.action = actionIdentity;
    sails.router.bind(path, action, verb, options);
  }
  // Otherwise, log a message about the unknown action.
  else {
    sails.log.warn(
      'Ignored attempt to bind route (' + path + ') to unknown target ::',
      target
    );
  }

};

