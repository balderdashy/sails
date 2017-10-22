/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');
var formatUsageError = require('../formatUsageError');


/**
 * Add Record To Collection
 *
 * http://sailsjs.com/docs/reference/blueprint-api/add-to
 *
 * Associate one record with the collection attribute of another.
 * e.g. add a Horse named "Jimmy" to a Farm's "animals".
 *
 */

module.exports = function addToCollection (req, res) {

  var parseBlueprintOptions = req.options.parseBlueprintOptions || req._sails.config.blueprints.parseBlueprintOptions;

  // Set the blueprint action for parseBlueprintOptions.
  req.options.blueprintAction = 'add';

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
    if (err) {  return res.serverError(err); }

    // No such parent record?  Bail out with a 404.
    if (!parentRecord) { return res.notFound(); }

    // Look up the child record to make sure it exists.
    ChildModel.findOne(childPk).exec(function foundChild(err, childRecord) {
      if (err) { return res.serverError(err); }

      // No such child record?  Bail out with a 404.
      if (!childRecord) {return res.notFound();}

      // Add the child record to the parent.
      Model.addToCollection(parentPk, relation, childPk).exec( function(err) {

        if (err) {
          switch (err.name) {
            // Any kind of usage error coming back from Waterline,
            // (e.g. a bad criteria), is met with a 400 status code.
            case 'UsageError': return res.badRequest(formatUsageError(err, req));
            case 'AdapterError':
              switch (err.code) {
                // If this child record is already a member of this collection,
                // then just continue along to the publishing below-- we'll still
                // respond w/ a 200 status code.
                // (see http://sailsjs.com/documentation/reference/blueprint-api/add-to)
                case 'E_UNIQUE': break;
                // Any other kind of adapter error is unexpected, so use 500.
                default: return res.serverError(err);
              } break;
            // Otherwise, it's some other unexpected error, so use 500.
            default: return res.serverError(err);
          }
        }

        // Broadcast updates if pubsub hook is enabled.
        if (req._sails.hooks.pubsub) {

          // Subscribe to the model you're adding to, if this was a socket request
          if (req.isSocket) { Model.subscribe(req, [parentPk]); }
          // Publish to subscribed sockets
          Model._publishAdd(parentPk, relation, childPk, !req.options.mirror && req);
          // If the inverse relationship on the child model is a singular association, and
          // the association attribute on the child was not `null` before, then notify the
          // former parent that this child has been "stolen".
          if (associationAttr.via && ChildModel.attributes[associationAttr.via].model && !_.isNull(childRecord[associationAttr.via])) {
            Model._publishRemove(childRecord[associationAttr.via], relation, childPk, !req.options.mirror && req, {noReverse: true});
          }

        }

        // Finally, look up the parent record again and populate the relevant collection.
        var query = Model.findOne(parentPk, queryOptions.populates).meta(queryOptions.meta);
        query.exec(function(err, matchingRecord) {
          if (err) { return res.serverError(err); }
          if (!matchingRecord) { return res.serverError(); }
          if (!matchingRecord[relation]) { return res.serverError(); }
          return res.ok(matchingRecord);
        });

      });

    }); // </ ChildModel.findOne(childPk) >

  }); // </ Model.findOne(parentPk)>

};
