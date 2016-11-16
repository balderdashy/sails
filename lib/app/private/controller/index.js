/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');
var registerAction = require('./register-action');
var loadModules = require('./load-modules');


/**
 * todo()
 *
 * TODO: replace this in favor of using these underlying methods statelessly
 * where they're needed (and instead of relying on context, pass in `sails` as the final argument)
 *
 * @param  {SailsApp} sails
 * @return {Dictionary}
 *         @property {Function} registerAction
 *         @property {Function} loadModules
 */

module.exports = function todo(sails) {
  return {
    registerAction: _.bind(registerAction, sails),
    loadModules: _.bind(loadModules, sails)
  };
};
