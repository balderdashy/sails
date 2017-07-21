/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');


/**
 * Detect HTTP verb in an expression like:
 * `get baz`    or     `get /foo/baz`
 *
 * @api private
 */

module.exports = function (haystack) {
  var verbExpr = /^\s*(all|get|post|put|delete|trace|options|connect|patch|head)\s+/i;
  var verbSpecified = _.last(haystack.match(verbExpr) || []) || '';
  verbSpecified = verbSpecified.toLowerCase();

  // If a verb was specified, eliminate the verb from the original string
  if (verbSpecified) {
    haystack = haystack.replace(verbExpr,'').trim();
  } else {
    haystack = haystack.trim();
  }

  return {
    verb: verbSpecified,
    original: haystack,
    path: haystack
  };
};
