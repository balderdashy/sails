/**
 * Module dependencies
 */
var util = require('util'),
  actionUtil = require('../actionUtil');


/**
 * Populate (or "expand") an association
 *
 * get /model/:parentid/relation
 * get /model/:parentid/relation/:id
 *
 * @param {Integer|String} parentid  - the unique id of the parent instance
 * @param {Integer|String} id  - the unique id of the particular child instance you'd like to look up within this relation
 * @param {Object} where       - the find criteria (passed directly to the ORM)
 * @param {Integer} limit      - the maximum number of records to send back (useful for pagination)
 * @param {Integer} skip       - the number of records to skip (useful for pagination)
 * @param {String} sort        - the order of returned records, e.g. `name ASC` or `age DESC`
 *
 * @option {String} model  - the identity of the model
 * @option {String} alias  - the name of the association attribute (aka "alias")
 */

module.exports = function expand(req, res) {

  var Model = actionUtil.parseModel(req);
  var relation = req.options.alias;
  if (!relation || !Model) return res.badRequest();

  // Allow customizable blacklist for params.
  req.options.criteria = req.options.criteria || {};
  req.options.criteria.blacklist = req.options.criteria.blacklist || ['limit', 'skip', 'sort', 'id', 'parentid'];

  Model
    .findOne(req.param('parentid'))
    .populate(relation, {
      where: req.param('id') ? [req.param('id')] : actionUtil.parseCriteria(req),
      skip: actionUtil.parseSkip(req),
      limit: actionUtil.parseLimit(req),
      sort: actionUtil.parseSort(req)
    })
    .exec(function found(err, matchingRecord) {
      if (err) return res.serverError(err);
      if (!matchingRecord) return res.notFound('No record found with the specified id.');
      if (!matchingRecord[relation]) return res.notFound(util.format('Specified record (%s) is missing relation `%s`', parentId, alias));
      return res.ok(matchingRecord[relation]);
    });

};
