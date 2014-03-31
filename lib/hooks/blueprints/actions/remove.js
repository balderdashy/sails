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

  // Ensure a model can be deduced from the request options.
  var model = req.options.model || req.options.controller;
  var alias = req.options.alias;
  if (!alias || !model) return res.badRequest();

  // Get access to `sails` (globals might be disabled) and look up the model.
  var sails = req._sails;
  var Model = sails.models[model];

  var association = sails.util.findWhere(Model.associations, {alias: alias});
  var associatedModel = sails.models[association.model || association.collection];

  // Locate and validate required parameters
  var parentPk = req.param('parentid');
  if (!parentPk) {
    return res.badRequest('No parentid provided.');
  }
  var pk = req.param(associatedModel.primaryKey);
  if (!pk) {
    return res.badRequest('No id provided (primary key of the child record to be removed.)');
  }

  Model
  .findOne(parentPk).exec(function found(err, matchingRecord) {
    if (err) return res.serverError(err);
    if (!matchingRecord) return res.notFound();
    if (!matchingRecord[alias]) return res.notFound();

    var associated = matchingRecord[alias];
    associated.remove(pk);
    matchingRecord.save(function(err) {
      if (err) return res.negotiate(err);

      Model
      .findOne(parentPk)
      .populate(alias)
      // TODO: use populateEach util instead
      .exec(function found(err, matchingRecord) {
        if (err) return res.serverError(err);
        if (!matchingRecord) return res.serverError();
        if (!matchingRecord[alias]) return res.serverError();
        if (!matchingRecord[Model.primaryKey]) return res.serverError();

        // If we have the pubsub hook, use the model class's publish method
        // to notify all subscribers about the removed item
        if (sails.hooks.pubsub) {
          Model.publishRemove(matchingRecord[Model.primaryKey], alias, pk, !sails.config.blueprints.mirror && req);
        }

        return res.ok(matchingRecord);
      });
    });
  });

};
