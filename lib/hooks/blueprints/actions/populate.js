/**
 * Module dependencies
 */

var actionUtil = require('../actionUtil');
var formatUsageError = require('../formatUsageError');

/**
 * Populate (or "expand") an association
 *
 * http://sailsjs.com/docs/reference/blueprint-api/populate
 *
 */

module.exports = function populate(req, res) {

  var sails = req._sails;

  var parseBlueprintOptions = req.options.parseBlueprintOptions || req._sails.config.blueprints.parseBlueprintOptions;

  // Set the blueprint action for parseBlueprintOptions.
  req.options.blueprintAction = 'populate';

  var queryOptions = parseBlueprintOptions(req);
  var Model = req._sails.models[queryOptions.using];

  var attrName = queryOptions.alias;
  if (!attrName || !Model) { return res.serverError(); }

  // The primary key of the parent record
  var parentPk = queryOptions.criteria.where[Model.primaryKey];

  Model
    .findOne(parentPk, queryOptions.populates).meta(queryOptions.meta)
    .exec(function found(err, matchingRecord) {
      if (err) {
        // If this is a usage error coming back from Waterline,
        // (e.g. a bad criteria), then respond w/ a 400 status code.
        // Otherwise, it's something unexpected, so use 500.
        switch (err.name) {
          case 'UsageError': return res.badRequest(formatUsageError(err, req));
          default: return res.serverError(err);
        }
      }//-•

      if (!matchingRecord) {
        sails.log.verbose('In `populate` blueprint action: No parent record found with the specified id (`'+parentPk+'`).');
        return res.notFound();
      }//-•

      if (!matchingRecord[attrName]) {
        sails.log.verbose('In `populate` blueprint action: Specified parent record ('+parentPk+') does not have a `'+attrName+'`.');
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
