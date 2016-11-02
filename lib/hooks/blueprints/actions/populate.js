/**
 * Module dependencies
 */

var util = require('util');
var actionUtil = require('../actionUtil');
var _ = require('lodash');


/**
 * Populate (or "expand") an association
 *
 * http://sailsjs.com/docs/reference/blueprint-api/populate
 *
 */

module.exports = function expand(req, res) {

  var Model = actionUtil.parseModel(req);
  var relation = req.options.alias;
  if (!relation || !Model) { return res.serverError(); }

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
    if (Model.attributes[Model.primaryKey].type === 'integer') {
      childPk = +childPk || 0;
    }
  }

  var where = childPk ? {id: [childPk]} : actionUtil.parseCriteria(req);

  // Remove undefined values from the populate criteria.
  var populate = _.omit({
    where: where,
    skip: actionUtil.parseSkip(req),
    limit: actionUtil.parseLimit(req),
    sort: actionUtil.parseSort(req)
  }, function(val) {return typeof val === 'undefined';});

  Model
    .findOne(parentPk)
    .populate(relation, populate)
    .exec(function found(err, matchingRecord) {
      if (err) { return res.serverError(err); }
      if (!matchingRecord) { return res.notFound('No record found with the specified id.'); }
      if (!matchingRecord[relation]) { return res.notFound(util.format('Specified record (%s) is missing relation `%s`', parentPk, relation)); }

      // Subcribe to instance, if relevant
      // TODO: only subscribe to populated attribute- not the entire model
      if (sails.hooks.pubsub && req.isSocket) {
        Model.subscribe(req, matchingRecord);
        actionUtil.subscribeDeep(req, matchingRecord);
      }

      return res.ok(matchingRecord[relation]);
    });
};
