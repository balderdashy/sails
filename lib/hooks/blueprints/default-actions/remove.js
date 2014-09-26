/**
 * Module dependencies
 */
var actionUtil = require('../actionUtil');
var _ = require('lodash');


/**
 * Remove a member from an association
 *
 * @param {Integer|String} parentid  - the unique id of the parent record
 * @param {Integer|String} id  - the unique id of the child record to remove
 *
 * @option {String} model  - the identity of the model
 * @option {String} alias  - the name of the association attribute (aka "alias")
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

  // Get the model class of the child in order to figure out the name of
  // the primary key attribute.
  var associationAttr = _.findWhere(Model.associations, { alias: relation });
  var ChildModel = sails.models[associationAttr.collection];
  var childPkAttr = ChildModel.primaryKey;

  // The primary key of the child record to remove
  // from the aliased collection
  var childPk = actionUtil.parsePk(req);

  Model
  .findOne(parentPk).exec(function found(err, parentRecord) {
    if (err) return res.serverError(err);
    if (!parentRecord) return res.notFound();
    if (!parentRecord[relation]) return res.notFound();

    parentRecord[relation].remove(childPk);
    parentRecord.save(function(err) {
      if (err) return res.negotiate(err);

      Model.findOne(parentPk)
      .populate(relation)
      // TODO: use populateEach util instead
      .exec(function found(err, parentRecord) {
        if (err) return res.serverError(err);
        if (!parentRecord) return res.serverError();
        if (!parentRecord[relation]) return res.serverError();
        if (!parentRecord[Model.primaryKey]) return res.serverError();

        // If we have the pubsub hook, use the model class's publish method
        // to notify all subscribers about the removed item
        if (sails.hooks.pubsub) {
          Model.publishRemove(parentRecord[Model.primaryKey], relation, childPk, !sails.config.blueprints.mirror && req);
        }

        return res.ok(parentRecord);
      });
    });
  });

};
