/**
 * Module dependencies
 */

var actionUtil = require('../actionUtil');
var _ = require('@sailshq/lodash');
var async = require('async');

/**
 * Replace Records in Collection
 *
 * http://sailsjs.com/docs/reference/blueprint-api/replace
 *
 * Replace the associated records in the given collection with
 * different records.  For example, replace all of a user's pets.
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

  var childPks = _.isArray(req.body) ? req.body : req.query[relation];

  if (_.isString(childPks)) {
    try {
      childPks = JSON.parse(childPks);
    } catch (e) {
      return res.badRequest(new Error('Invalid values for `' + relation + '` collection given to "replace" blueprint action.  If specified as a string, the value must be parseable as a JSON array, e.g. "[1,2]".'));
    }
  }

  Model.replaceCollection(parentPk, relation, childPks).exec( function(err) {

    if (err) {
      // If this is a usage error coming back from Waterline,
      // (e.g. a bad criteria), then respond w/ a 400 status code.
      // Otherwise, it's something unexpected, so use 500.
      switch (err.name) {
        case 'UsageError': return res.badRequest(err);
        default: return res.serverError(err);
      }
    }

    // Broadcast updates to subscribers of the child records.
    if (req._sails.hooks.pubsub) {

      // Subscribe to the model you're adding to, if this was a socket request
      if (req.isSocket) { Model.subscribe(req, [parentPk]); }

      // Publish to subscribed sockets
      _.each(childPks, function(childPk) {
        Model._publishAdd(parentPk, relation, childPk, !req.options.mirror && req);
      });

    }

    var query = Model.findOne(parentPk);
    query = actionUtil.populateRequest(query, req);
    query.exec(function(err, matchingRecord) {
      if (err) { return res.serverError(err); }
      if (!matchingRecord) { return res.serverError(); }
      if (!matchingRecord[relation]) { return res.serverError(); }
      return res.ok(matchingRecord);
    });

  }); // </ Model.replaceCollection(parentPk)>

};
