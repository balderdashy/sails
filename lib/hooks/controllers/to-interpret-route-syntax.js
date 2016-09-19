/**
 * Module dependencies.
 */

var _ = require('lodash');
var sailsUtil = require('sails-util');

/**
 * @param  {SailsApp} sails  [Sails app]
 * @return {Function}
 */
module.exports = function to(sails) {

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
  return function interpretRouteSyntax (route) {
    var target = route.target;
    var path = route.path;
    var verb = route.verb;
    var options = route.options;

    var actionIdentity;

    // This hook handles the following route target syntaxes:
    // (assumes controller/action files live in api/controllers)
    //
    // 'GET /foo/bar': 'some_folder/UserController.doStuff'
    //   - Bind GET /foo/bar to the "doStuff" action in api/controllers/some_folder/UserController.js
    //
    // 'GET /foo/bar': { action: 'some_folder.user.dostuff' }
    //   - Bind GET /foo/bar to the "doStuff" action in api/controllers/some_folder/UserController.js
    //     OR
    //     Bind GET /foo/bar to the action in api/controllers/some_folder/user/dostuff.js

    // Attempt to handle string target.
    if (_.isString(target) && target.match(/.+Controller\..+/)) {
      // Get the action identity by replacing slashes with dots, removing `Controller` and lower-casing.
      actionIdentity = target.replace(/\//g, '.').replace(/Controller\./,'.').toLowerCase();
    }

    // Attempt to handle `{action: 'my-action'}` target.
    else if (_.isObject(target) && target.action) {
      // Get the action identity by lowercasing the value of the `action` property.
      actionIdentity = target.action.toLowerCase();
    }

    if (actionIdentity) {
      // Attempt to find an action with that identity.
      var action = sails.hooks.controllers._actions[actionIdentity];
      // If there is one, bind the given route address to the action.
      if (action) {
        // Make sure req.options.action is set to the identity of the action we're binding,
        // for cases where the { action: 'foo.bar' } syntax wasn't used.
        options.action = actionIdentity;
        sails.router.bind(path, action, verb, options);
      }
      // Otherwise, log a message about the unknown action.
      else {
        sails.after('lifted', function () {
          sails.log.error(
            'Ignored attempt to bind route (' + path + ') to unknown controller.action ::',
            target
          );
        });
      }
    }

    else {
      sails.log.silly('Controllers hook skipping route target: ', target, '(hook does not understand this syntax.)');
    }

  };

};

