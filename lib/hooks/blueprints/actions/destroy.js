/**
 * Module dependencies
 */
var actionUtil = require('../actionUtil');

/**
 * Destroy One Record
 *
 * delete  /:modelIdentity/:id
 *    *    /:modelIdentity/destroy/:id
 *
 * Destroys the single model instance with the specified `id` from
 * the data adapter for the given model if it exists.
 *
 * Required:
 * @param {Integer|String} id  - the unique id of the particular instance you'd like to delete
 *
 * Optional:
 * @param {String} callback - default jsonp callback param (i.e. the name of the js function returned)
 */
module.exports = function destroyOneRecord (req, res) {

  var Model = actionUtil.parseModel(req);
  var pk = actionUtil.requirePk(req);

  var query = Model.findOne(pk);
  query = actionUtil.populateRequest(query, req);
  query.exec(function foundRecord (err, record) {
    if (err) return res.serverError(err);
    if(!record) return res.notFound('No record found with the specified `id`.');

    Model.destroy(pk).exec(function destroyedRecord (err) {
      if (err) return res.negotiate(err);

      if (req._sails.hooks.pubsub) {
        Model.publishDestroy(pk, !req._sails.config.blueprints.mirror && req, {previous: record});
        if (req.isSocket) {
          Model.unsubscribe(req, record);
          Model.retire(record);
        }
      }

      return res.ok(record);
    });
  });
};
