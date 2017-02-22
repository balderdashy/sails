/**
 * Module dependencies
 */

var actionUtil = require('../actionUtil');

/**
 * Find One Record
 *
 * http://sailsjs.com/docs/reference/blueprint-api/find-one.
 *
 * > Blueprint action to find and return the record with the specified id.
 *
 */

module.exports = function findOneRecord (req, res) {

  var sails = req._sails;

  var Model = actionUtil.parseModel(req);
  var pk = actionUtil.requirePk(req);

  var query = Model.findOne(pk)
      .where( actionUtil.parseCriteria(req) );
  query = actionUtil.populateRequest(query, req);
  query.exec(function found(err, matchingRecord) {
    if (err) {
      // If this is a usage error coming back from Waterline,
      // (e.g. a bad criteria), then respond w/ a 400 status code.
      // Otherwise, it's something unexpected, so use 500.
      switch (err.name) {
        case 'UsageError': return res.badRequest(err);
        default: return res.serverError(err);
      }
    }//-•

    if(!matchingRecord) {
      sails.log.verbose('No record found with the specified id (`'+pk+'`).');
      return res.notFound();
    }

    if (sails.hooks.pubsub && req.isSocket) {
      Model.subscribe(req, [matchingRecord[Model.primaryKey]]);
      actionUtil.subscribeDeep(req, matchingRecord);
    }

    return res.ok(matchingRecord);

  });

};
