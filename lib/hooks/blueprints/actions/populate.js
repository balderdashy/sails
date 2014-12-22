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
  if (!relation || !Model) return res.serverError();

  // Allow customizable blacklist for params.
  req.options.criteria = req.options.criteria || {};
  req.options.criteria.blacklist = req.options.criteria.blacklist || ['limit', 'skip', 'sort', 'id', 'parentid'];

  var parentPk = req.param('parentid');

  // Determine whether to populate using a criteria, or the
  // specified primary key of the child record, or with no
  // filter at all.
  var childPk = actionUtil.parsePk(req);

  // Coerce the child PK to an integer if necessary
  if (childPk) {
    if (Model.attributes[Model.primaryKey].type == 'integer') {
      childPk = +childPk || 0;
    }
  }

  var where = childPk ? {id: [childPk]} : actionUtil.parseCriteria(req);

  var populate = sails.util.objCompact({
    where: where,
    skip: actionUtil.parseSkip(req),
    limit: actionUtil.parseLimit(req),
    sort: actionUtil.parseSort(req)
  });

  Model
    .findOne(parentPk)
    .populate(relation, populate)
    .exec(function found(err, matchingRecord) {
      if (err) return res.serverError(err);
      if (!matchingRecord) return res.notFound('No record found with the specified id.');
      if (!matchingRecord[relation]) return res.notFound(util.format('Specified record (%s) is missing relation `%s`', parentPk, relation));

      // Subcribe to instance, if relevant
      // TODO: only subscribe to populated attribute- not the entire model
      if (sails.hooks.pubsub && req.isSocket) {
        Model.subscribe(req, matchingRecord);
        actionUtil.subscribeDeep(req, matchingRecord);
      }

      return res.ok(matchingRecord[relation]);
    });
};
