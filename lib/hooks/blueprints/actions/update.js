/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');
var formatUsageError = require('../formatUsageError');


/**
 * Update One Record
 *
 * http://sailsjs.com/docs/reference/blueprint-api/update
 *
 * An API call to update a model instance with the specified `id`,
 * treating the other unbound parameters as attributes.
 *
 */

module.exports = function updateOneRecord (req, res) {

  var parseBlueprintOptions = req.options.parseBlueprintOptions || req._sails.config.blueprints.parseBlueprintOptions;

  // Set the blueprint action for parseBlueprintOptions.
  req.options.blueprintAction = 'update';

  var queryOptions = parseBlueprintOptions(req);
  var Model = req._sails.models[queryOptions.using];

  var criteria = {};
  criteria[Model.primaryKey] = queryOptions.criteria.where[Model.primaryKey];

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // FUTURE: Use a database transaction here, if supported by the datastore.
  // e.g.
  // ```
  // Model.getDatastore().transaction(function during(db, proceed){ ... })
  // .exec(function afterwards(err, result){}));
  // ```
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  // Find and update the targeted record.
  //
  // (Note: this could be achieved in a single query, but a separate `findOne`
  //  is used first to provide a better experience for front-end developers
  //  integrating with the blueprint API.)
  Model.findOne(
    _.cloneDeep(criteria),
    _.cloneDeep(queryOptions.populates)
  )
  .exec(function (err, matchingRecord) {
    if (err) {
      switch (err.name) {
        case 'UsageError': return res.badRequest(formatUsageError(err, req));
        default: return res.serverError(err);
      }
    }//-•

    if (!matchingRecord) {
      return res.notFound();
    }//•

    // This should only update a single record
    Model.updateOne(_.cloneDeep(criteria))
    .set(queryOptions.valuesToSet)
    .meta(queryOptions.meta)
    .exec(function (err, updatedRecord) {

      // Differentiate between waterline-originated validation errors
      // and serious underlying issues. Respond with badRequest if a
      // validation error is encountered, w/ validation info, or if a
      // uniqueness constraint is violated.
      if (err) {
        switch (err.name) {
          case 'AdapterError':
            switch (err.code) {
              case 'E_UNIQUE': return res.badRequest(err);
              default: return res.serverError(err);
            }//•
          case 'UsageError': return res.badRequest(formatUsageError(err, req));
          default: return res.serverError(err);
        }
      }//•

      if (!updatedRecord) {
        return res.notFound();
      }//•

      // If we have the pubsub hook, use the Model's publish method
      // to notify all subscribers about the update.
      if (req._sails.hooks.pubsub) {
        if (req.isSocket) {
          Model.subscribe(req, updatedRecord[Model.primaryKey]);
        }//ﬁ

        // The _.cloneDeep()s ensure that only plain dictionaries are broadcast.
        // > TODO: why is that important?
        var pk = updatedRecord[Model.primaryKey];
        Model._publishUpdate(pk, _.cloneDeep(queryOptions.valuesToSet), !req.options.mirror && req, {
          previous: _.cloneDeep(matchingRecord)
        });
      }//ﬁ

      // Do a final query to populate the associations of the record.
      //
      // (Note: again, this extra query could be eliminated, but it is
      //  included by default to provide a better interface for integrating
      //  front-end developers.)
      Model.findOne(
        _.cloneDeep(criteria),
        _.cloneDeep(queryOptions.populates)
      )
      .exec(function foundAgain(err, populatedRecord) {
        if (err) { return res.serverError(err); }
        if (!populatedRecord) { return res.serverError('Could not find record after updating!'); }
        res.ok(populatedRecord);
      }); // </.findOne() (for populating the updated record)>
    });// </.updateOne()>
  }); // </.findOne() to get the ORIGINAL populated record>
};
