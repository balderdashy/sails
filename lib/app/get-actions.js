/**
 * Module dependencies.
 */
var _ = require('@sailshq/lodash');

/**
 * Sails.prototype.getActions()
 *
 * Return a shallow clone of the loaded actions dictionary.
 *
 * @returns {dictionary} A shallow clone of sails._actions
 *
 * @api public
 */
module.exports = function getActions() {

  return _.clone(this._actions);

};
