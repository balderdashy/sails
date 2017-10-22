/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');
var formatUsageError = require('../formatUsageError');


/**
 * Remove a member from an association
 *
 * http://sailsjs.com/docs/reference/blueprint-api/remove-from
 *
 */

module.exports = function remove(req, res) {

  var parseBlueprintOptions = req.options.parseBlueprintOptions || req._sails.config.blueprints.parseBlueprintOptions;

  // Set the blueprint action for parseBlueprintOptions.
  req.options.blueprintAction = 'remove';

  var queryOptions = parseBlueprintOptions(req);
  var Model = req._sails.models[queryOptions.using];

  var relation = queryOptions.alias;

  // The primary key of the parent record
  var parentPk = queryOptions.targetRecordId;

  // Get the model class of the child in order to figure out the name of
  // the primary key attribute.
  var associationAttr = _.findWhere(Model.associations, { alias: relation });
  var ChildModel = req._sails.models[associationAttr.collection];

  // The primary key of the child record;
  var childPk = queryOptions.associatedIds[0];

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // FUTURE: Use a database transaction here, if all of the involved models
  // are using the same datastore, and if that datastore supports transactions.
  // e.g.
  // ```
  // Model.getDatastore().transaction(function during(db, proceed){ ... })
  // .exec(function afterwards(err, result){}));
  // ```
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  Model.findOne(parentPk).meta(queryOptions.meta).exec(function foundParent(err, parentRecord) {
    if (err) { return res.serverError(err); }
    if (!parentRecord) { return res.notFound(); }

    // Look up the child record to make sure it exists.
    ChildModel.findOne(childPk).exec(function foundChild(err, childRecord) {
      if (err) { return res.serverError(err); }

      // No such child record?  Bail out with a 404.
      if (!childRecord) {return res.notFound();}

      Model.removeFromCollection(parentPk, relation, childPk).exec(function(err) {
        if (err) {
          // If this is a usage error coming back from Waterline,
          // (e.g. a bad criteria), then respond w/ a 400 status code.
          // Otherwise, it's something unexpected, so use 500.
          switch (err.name) {
            case 'UsageError': return res.badRequest(formatUsageError(err, req));
            default: return res.serverError(err);
          }
        }//-•

        // Finally, look up the parent record again and populate the relevant collection.
        var query = Model.findOne(parentPk, queryOptions.populates).meta(queryOptions.meta);
        query.exec(function found(err, parentRecord) {
          if (err) { return res.serverError(err); }
          if (!parentRecord) { return res.serverError(); }
          if (!parentRecord[relation]) { return res.serverError(); }
          if (!parentRecord[Model.primaryKey]) { return res.serverError(); }

          // If we have the pubsub hook, use the model class's publish method
          // to notify all subscribers about the removed item
          if (req._sails.hooks.pubsub) {
            Model._publishRemove(parentRecord[Model.primaryKey], relation, childPk, !req._sails.config.blueprints.mirror && req);
          }

          return res.ok(parentRecord);
        });
      });

    });

  });

};
