/**
 * Module dependencies
 */
var crypto = require('crypto');
var _ = require('lodash');


/**
 * Generate session secret
 * @return {[type]} [description]
 */
module.exports = function generateSecret() {

  // Combine random and case-specific factors into a base string
  var factors = {
    creationDate: (new Date()).getTime(),
    random: Math.random() * (Math.random() * 1000),
    nodeVersion: process.version
  };
  var basestring = '';
  _.each(factors, function(val) {
    basestring += val;
  });

  // Build hash
  var hash =
  crypto.createHash('md5')
  .update(basestring)
  .digest('hex');

  return hash;
};
