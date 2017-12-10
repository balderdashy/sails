/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');
var async = require('async');
var formatUsageError = require('../formatUsageError');

/**
 * Create Record
 *
 * http://sailsjs.com/docs/reference/blueprint-api/create
 *
 * An API call to crete a single model instance using the specified attribute values.
 *
 */

module.exports = function createRecord (req, res) {

  var parseBlueprintOptions = req.options.parseBlueprintOptions || req._sails.config.blueprints.parseBlueprintOptions;

  // Set the blueprint action for parseBlueprintOptions.
  req.options.blueprintAction = 'create';

  var queryOptions = parseBlueprintOptions(req);
  var Model = req._sails.models[queryOptions.using];

  // Get the new record data.
  var data = queryOptions.newRecord;

  // Look for any many-to-one collections that are being set.
  // For example, User.create({pets: [1, 2, 3]}) where `pets` is a collection of `Pet`
  // via an `owner` attribute that is `model: 'user'`.
  // We need to know about these so that, if any of the new children already had parents,
  // those parents get `removedFrom` notifications.
  async.reduce(_.keys(Model.attributes), [], function(memo, attrName, nextAttrName) {

    var attrDef = Model.attributes[attrName];
    if (
      // Does this attribute represent a plural association.
      attrDef.collection &&
      // Is this attribute set with a non-empty array?
      _.isArray(data[attrName]) && data[attrName].length > 0 &&
      // Does this plural association have an inverse attribute on the related model?
      attrDef.via &&
      // Is that inverse attribute a singular association, making this a many-to-one relationship?
      req._sails.models[attrDef.collection].attributes[attrDef.via].model
    ) {
      // Create an `in` query looking for all child records whose primary keys match
      // those in the array that the new parent's association attribute (e.g. `pets`) is set to.
      var criteria = {};
      criteria[req._sails.models[attrDef.collection].primaryKey] = data[attrName];
      req._sails.models[attrDef.collection].find(criteria).exec(function(err, newChildren) {
        if (err) {return nextAttrName(err);}
        // For each child, see if the inverse attribute already has a value, and if so,
        // push a new `removedFrom` notification onto the list of those to send.
        _.each(newChildren, function(child) {
          if (child[attrDef.via]) {
            memo.push({
              id: child[attrDef.via],
              removedId: child[req._sails.models[attrDef.collection].primaryKey],
              attribute: attrName
            });
          }
        });
        return nextAttrName(undefined, memo);
      });
    }

    else {
      return nextAttrName(undefined, memo);
    }

  }, function (err, removedFromNotificationsToSend) {

    if (err) {return res.serverError(err);}


    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // FUTURE: Use a database transaction here, if supported by the datastore.
    // e.g.
    // ```
    // Model.getDatastore().transaction(function during(db, proceed){ ... })
    // .exec(function afterwards(err, result){}));
    // ```
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    // Create new instance of model using data from params
    Model.create(data).meta(queryOptions.meta).exec(function created (err, newInstance) {

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
      }//-•

      // If we didn't fetch the new instance, just return 'OK'.
      if (!newInstance) {
        return res.ok();
      }

      // Look up and populate the new record (according to `populate` options in request / config)
      Model
      .findOne(newInstance[Model.primaryKey], queryOptions.populates)
      .exec(function foundAgain(err, populatedRecord) {
        if (err) { return res.serverError(err); }
        if (!populatedRecord) { return res.serverError('Could not find record after creating!'); }

        // If we have the pubsub hook, use the model class's publish method
        // to notify all subscribers about the created item
        if (req._sails.hooks.pubsub) {
          if (req.isSocket) {
            Model.subscribe(req, [populatedRecord[Model.primaryKey]]);
            Model._introduce(populatedRecord);
          }
          Model._publishCreate(populatedRecord, !req.options.mirror && req);
          if (removedFromNotificationsToSend.length) {
            _.each(removedFromNotificationsToSend, function(notification) {
              Model._publishRemove(notification.id, notification.attribute, notification.removedId, !req.options.mirror && req, {noReverse: true});
            });
          }
        }//>-

        // Send response
        res.ok(populatedRecord);
      }); // </foundAgain>

    });

  });



};
