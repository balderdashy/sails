/**
 * Module dependencies
 */

var actionUtil = require('../actionUtil');
var _ = require('@sailshq/lodash');


/**
 * Remove a member from an association
 *
 * http://sailsjs.com/docs/reference/blueprint-api/remove-from
 *
 */

module.exports = function remove(req, res) {

  // Ensure a model and alias can be deduced from the request.
  var Model = actionUtil.parseModel(req);
  var relation = req.options.alias;
  if (!relation) {
    return res.serverError(new Error('Missing required route option, `req.options.alias`.'));
  }

  // The primary key of the parent record
  var parentPk = req.param('parentid');

  // The primary key of the child record to remove
  // from the aliased collection
  var childPk = actionUtil.parsePk(req);

  if(_.isUndefined(childPk)) {
    return res.serverError('Missing required child PK.');
  }

  Model
  .findOne(parentPk).exec(function found(err, parentRecord) {
    if (err) { return res.serverError(err); }
    if (!parentRecord) { return res.notFound(); }

    Model.removeFromCollection(parentPk, relation, childPk).exec(function(err) {
      if (err) {
        // If this is a usage error coming back from Waterline,
        // (e.g. a bad criteria), then respond w/ a 400 status code.
        // Otherwise, it's something unexpected, so use 500.
        switch (err.name) {
          case 'UsageError': return res.badRequest(err);
          default: return res.serverError(err);
        }
      }//-•

      var query = Model.findOne(parentPk);
      query = actionUtil.populateRequest(query, req);
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

};
