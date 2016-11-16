/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');
var helpRegisterAction = require('./help-register-action');
var loadActionModules = require('./load-action-modules');


/**
 * todo()
 *
 * TODO: replace this in favor of using these underlying methods statelessly
 * where they're needed (and instead of relying on context, pass in `sails` as the final argument)
 *
 * @param  {SailsApp} sails
 * @return {Dictionary}
 *         @property {Function} helpRegisterAction
 *         @property {Function} loadActionModules
 */

module.exports = function todo(sails) {
  return {
    helpRegisterAction: _.bind(helpRegisterAction, sails),
    loadActionModules: _.bind(loadActionModules, sails)
  };
};
