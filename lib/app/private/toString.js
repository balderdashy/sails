/**
 * Module dependencies
 */

var util = require('util');


/**
 * Sails.prototype.toString()
 *
 * e.g.
 * ('This is how `sails` looks when toString()ed: ' + sails)
 *
 * @returns {String}
 */
module.exports = function toString () {
  return util.format('[a %sSails app%s]', this.isLifted ? 'lifted ' : '', this.isLifted && this.config.port ? ' on port '+this.config.port : '');
};
