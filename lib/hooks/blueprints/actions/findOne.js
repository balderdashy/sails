/**
 * Module dependencies
 */

var actionUtil = require('../actionUtil');

/**
 * Find One Record
 *
 * http://sailsjs.com/docs/reference/blueprint-api/add-to
 *
 * An API call to find and return a single model instance from the data adapter
 * using the specified id.
 *
 */

module.exports = function findOneRecord (req, res) {

  var Model = actionUtil.parseModel(req);
  var pk = actionUtil.requirePk(req);

  var query = Model.findOne(pk);
  query = actionUtil.populateRequest(query, req);
  query.exec(function found(err, matchingRecord) {
    if (err) { return res.serverError(err); }
    if(!matchingRecord) { return res.notFound('No record found with the specified `id`.'); }

    if (req._sails.hooks.pubsub && req.isSocket) {
      Model.subscribe(req, [matchingRecord[Model.primaryKey]]);
      actionUtil.subscribeDeep(req, matchingRecord);
    }

    res.ok(matchingRecord);
  });

};
