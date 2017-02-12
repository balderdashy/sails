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

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // FUTURE: Use a database transaction here, if supported by the datastore.
  // e.g.
  // ```
  // Model.getDatastore().transaction(function during(db, proceed){ ... })
  // .exec(function afterwards(err, result){}));
  // ```
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  var query = Model.findOne(pk);
  query = actionUtil.populateRequest(query, req);
  query.exec(function foundRecord (err, record) {
    if (err) {
      // If this is a usage error coming back from Waterline,
      // (e.g. a bad criteria), then respond w/ a 400 status code.
      // Otherwise, it's something unexpected, so use 500.
      switch (err.name) {
        case 'UsageError': return res.badRequest(err);
        default: return res.serverError(err);
      }
    }//-•

    if(!record) { return res.notFound('No record found with the specified `id`.'); }

    // (Note: this could be achieved in a single query, but a separate `findOne`
    // is used first to provide a better experience for front-end developers
    // integrating with the blueprint API out of the box.  If we didn't need
    // or care about that, we could just use `.meta({fetch: true})` when calling
    // `.destroy()`.
    Model.destroy(pk).exec(function destroyedRecord (err) {
      if (err) {
        switch (err.name) {
          case 'UsageError': return res.badRequest(err);
          default: return res.serverError(err);
        }
      }//-•

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
