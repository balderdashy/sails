/**
 * Module dependencies
 */

var actionUtil = require('../actionUtil');

/**
 * Destroy One Record
 *
 * http://sailsjs.com/docs/reference/blueprint-api/destroy
 *
 * Destroys the single model instance with the specified `id` from
 * the data adapter for the given model if it exists.
 *
 */

module.exports = function destroyOneRecord (req, res) {

  var Model = actionUtil.parseModel(req);
  var pk = actionUtil.requirePk(req);

  var query = Model.findOne(pk);
  query = actionUtil.populateRequest(query, req);
  query.exec(function foundRecord (err, record) {
    if (err) { return res.serverError(err); }
    if(!record) { return res.notFound('No record found with the specified `id`.'); }

    Model.destroy(pk).exec(function destroyedRecord (err) {
      if (err) { return res.negotiate(err); }

      if (req._sails.hooks.pubsub) {
        Model._publishDestroy(pk, !req._sails.config.blueprints.mirror && req, {previous: record});
        if (req.isSocket) {
          Model.unsubscribe(req, [record[Model.primaryKey]]);
          Model._retire(record);
        }
      }

      return res.ok(record);
    });
  });
};
