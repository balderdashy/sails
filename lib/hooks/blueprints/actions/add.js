/**
 * Module dependencies
 */

var actionUtil = require('../actionUtil');
var _ = require('@sailshq/lodash');
var async = require('async');

/**
 * Add Record To Collection
 *
 * http://sailsjs.com/docs/reference/blueprint-api/add-to
 *
 * Associate one record with the collection attribute of another.
 * e.g. add a Horse named "Jimmy" to a Farm's "animals".
 * If the record being added has a primary key value already, it will
 * just be linked.  If it doesn't, a new record will be created, then
 * linked appropriately.  In either case, the association is bidirectional.
 *
 */

module.exports = function addToCollection (req, res) {

  // Ensure a model and alias can be deduced from the request.
  var Model = actionUtil.parseModel(req);
  var relation = req.options.alias;
  if (!relation) {
    return res.serverError(new Error('Missing required route option, `req.options.alias`.'));
  }

  // The primary key of the parent record
  var parentPk = req.param('parentid');

  // The primary key of the child record;
  var childPk = req.param('childid');

  // Get the model class of the child in order to figure out the name of
  // the primary key attribute.
  var associationAttr = _.findWhere(Model.associations, { alias: relation });
  var ChildModel = req._sails.models[associationAttr.collection];

  Model.findOne(parentPk).exec(function foundParent(err, parentRecord) {
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

        // Ignore `insert` errors for duplicate adds
        // (but keep in mind, we should not _publishAdd if this is the case...)
        var isDuplicateInsertError = (err && typeof err === 'object' && err.length && err[0] && err[0].type === 'insert');
        if (err && !isDuplicateInsertError) {
          // If this is a usage error coming back from Waterline,
          // (e.g. a bad criteria), then respond w/ a 400 status code.
          // Otherwise, it's something unexpected, so use 500.
          switch (err.name) {
            case 'UsageError': return res.badRequest(err);
            default: return res.serverError(err);
          }
        }

        // Only broadcast an update if this isn't a duplicate `add`
        // (otherwise connected clients will see duplicates)
        if (!isDuplicateInsertError && req._sails.hooks.pubsub) {

          // Subscribe to the model you're adding to, if this was a socket request
          if (req.isSocket) { Model.subscribe(req, [parentPk]); }
            // Publish to subscribed sockets
          Model._publishAdd(parentPk, relation, childPk, !req.options.mirror && req);

        }

        // Finally, look up the parent record again and populate the relevant collection.
        var query = Model.findOne(parentPk);
        query = actionUtil.populateRequest(query, req);
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
