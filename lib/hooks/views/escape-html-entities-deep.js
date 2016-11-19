/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');
var rttc = require('rttc');


/**
 * escapeHtmlEntitiesDeep()
 *
 * Escape all HTML entities which exist as strings in the provided
 * data. If the provided data contains any dictionaries or arrays,
 * traverse them recursively. Note that the returned value will be
 * JSON-compatible, and the dehydration process will be carried out
 * using the rules established in rttc.dehydrate().
 *
 * @param {Dictionary} data
 *           The dictionary of data to escape.
 *
 * @returns {JSON} a recursively-HTML-escaped copy of the provided data.
 */
module.exports = function escapeHtmlEntitiesDeep(data){

  return rttc.rebuild(data, function escape(val, type){
    // _.escape() is for escaping strings for use in HTML.
    // (this is just the same thing that Lodash uses when you use `<%- %>` in templates)
    if (type === 'string') {
      return _.escape(val);
    }
    else {
      return val;
    }
  });

};
