/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');
var actionUtil = require('../actionUtil');
var parseRequest = require('../parse-request');

/**
 * Find One Record
 *
 * http://sailsjs.com/docs/reference/blueprint-api/find-one.
 *
 * > Blueprint action to find and return the record with the specified id.
 *
 */

module.exports = function findOneRecord (req, res) {

  // Set the blueprint action for parseRequest.
  req.options.blueprintAction = 'findOne';

  var queryOptions = parseRequest(req);
  var Model = req._sails.models[queryOptions.using];

  var criteria = {};
  criteria[Model.primaryKey] = queryOptions.criteria.where[Model.primaryKey];

  Model
  .findOne(criteria, queryOptions.populates).meta(queryOptions.meta)
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

    if(!matchingRecord) {
      sails.log.verbose('No record found with the specified id (`'+queryOptions.criteria.where[Model.primaryKey]+'`).');
      return res.notFound();
    }

    if (req._sails.hooks.pubsub && req.isSocket) {
      Model.subscribe(req, [matchingRecord[Model.primaryKey]]);
      actionUtil.subscribeDeep(req, matchingRecord);
    }

    return res.ok(matchingRecord);

  });

};
