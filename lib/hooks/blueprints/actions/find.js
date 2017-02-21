/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');
var actionUtil = require('../actionUtil');
var parseRequest = require('../parse-request');

/**
 * Find Records
 *
 * http://sailsjs.com/docs/reference/blueprint-api/find
 *
 * An API call to find and return model instances from the data adapter
 * using the specified criteria.  If an id was specified, just the instance
 * with that unique id will be returned.
 *
 */

module.exports = function findRecords (req, res) {

  var queryOptions = parseRequest('find', req);
  var Model = req._sails.models[queryOptions.using];

  Model
  .find(queryOptions.criteria.where, queryOptions.populates)
  .limit( queryOptions.criteria.limit )
  .skip( queryOptions.criteria.skip )
  .sort( queryOptions.criteria.sort )
  .exec(function found(err, matchingRecords) {
    if (err) {
      // If this is a usage error coming back from Waterline,
      // (e.g. a bad criteria), then respond w/ a 400 status code.
      // Otherwise, it's something unexpected, so use 500.
      switch (err.name) {
        case 'UsageError': return res.badRequest(err);
        default: return res.serverError(err);
      }
    }//-•

    if (req._sails.hooks.pubsub && req.isSocket) {
      Model.subscribe(req, _.pluck(matchingRecords, Model.primaryKey));
      // Only `._watch()` for new instances of the model if
      // `autoWatch` is enabled.
      if (req.options.autoWatch) { Model._watch(req); }
      // Also subscribe to instances of all associated models
      _.each(matchingRecords, function (record) {
        actionUtil.subscribeDeep(req, record);
      });
    }//>-

    return res.ok(matchingRecords);

  });//</ .find().exec() >

};
