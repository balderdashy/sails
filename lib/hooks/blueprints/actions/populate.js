/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');
var actionUtil = require('../actionUtil');


/**
 * Populate (or "expand") an association
 *
 * http://sailsjs.com/docs/reference/blueprint-api/populate
 *
 */

module.exports = function populate(req, res) {

  var sails = req._sails;

  var Model = actionUtil.parseModel(req);
  var attrName = req.options.alias;
  if (!attrName || !Model) { return res.serverError(); }

  // Allow customizable blacklist for params.
  req.options.criteria = req.options.criteria || {};
  req.options.criteria.blacklist = req.options.criteria.blacklist || ['limit', 'skip', 'sort', 'id', 'parentid'];

  var parentId = req.param('parentid');

  // Determine whether to populate using a criteria, or the
  // specified primary key of the child record, or with no
  // filter at all.
  var childId = actionUtil.parsePk(req);

  // Coerce the child PK to a number if necessary.
  if (childId) {
    if (Model.attributes[Model.primaryKey].type === 'number') {
      childId = +childId || 0;
    }
  }//>-

  var where = childId ? {id: [childId]} : actionUtil.parseCriteria(req);

  Model
    .findOne(parentId)
    .populate(attrName, {
      where: where,
      skip: actionUtil.parseSkip(req),
      limit: actionUtil.parseLimit(req),
      sort: actionUtil.parseSort(req)
    })
    .exec(function found(err, matchingRecord) {
      if (err) {
        // If this is a usage error coming back from Waterline,
        // (e.g. a bad criteria), then respond w/ a 400 status code.
        // Otherwise, it's something unexpected, so use 500.
        switch (err.name) {
          case 'UsageError': return res.badRequest(err);
          default: return res.serverError(err);
        }
      }//-•

      if (!matchingRecord) {
        sails.log.verbose('No parent record found with the specified id (`'+parentId+'`).');
        return res.notFound();
      }//-•

      if (!matchingRecord[attrName]) {
        sails.log.verbose('Specified parent record ('+parentId+') does not have a `'+attrName+'`.');
        return res.notFound();
      }//-•

      // Subcribe to relevant record(s), if appropriate.
      if (sails.hooks.pubsub && req.isSocket) {
        Model.subscribe(req, matchingRecord);
        actionUtil.subscribeDeep(req, matchingRecord);
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        // FUTURE:
        // Only subscribe to the associated record(s) without watching the entire
        // associated model.  (Currently, `.subscribeDeep()` also calls `.watch()`,
        // if `autoWatch` is enabled.)
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      }

      return res.ok(matchingRecord[attrName]);

    });
};
