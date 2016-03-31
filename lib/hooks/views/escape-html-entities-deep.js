
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
 *           The data to escape.
 *
 * @returns {JSON} a recursively-HTML-escaped copy of the provided data.
 */
module.exports = function escapeHtmlEntitiesDeep(data){
  // TODO
  return data;
};
