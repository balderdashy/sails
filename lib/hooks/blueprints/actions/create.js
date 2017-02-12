/**
 * Module dependencies
 */

var actionUtil = require('../actionUtil');
var _ = require('@sailshq/lodash');

/**
 * Create Record
 *
 * http://sailsjs.com/docs/reference/blueprint-api/create
 *
 * An API call to crete a single model instance using the specified attribute values.
 *
 */

module.exports = function createRecord (req, res) {

    var Model = actionUtil.parseModel(req);

    // Create data object (monolithic combination of all parameters),
    // omitting any blacklisted params.
    var data = actionUtil.parseValues(req);

    // Attempt to JSON parse any collection attributes into arrays.  This is to allow
    // setting collections using the shortcut routes.
    _.each(Model.attributes, function(attrDef, attrName) {
      if (attrDef.collection && (!req.body || !req.body[attrName]) && (req.query && _.isString(req.query[attrName]))) {
        try {
          data[attrName] = JSON.parse(req.query[attrName]);
        }
        catch (e) {}
      }
    });

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // FUTURE: Use a database transaction here, if supported by the datastore.
    // e.g.
    // ```
    // Model.getDatastore().transaction(function during(db, proceed){ ... })
    // .exec(function afterwards(err, result){}));
    // ```
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    // Create new instance of model using data from params
    Model.create(data).meta({fetch: true}).exec(function created (err, newInstance) {

        // Differentiate between waterline-originated validation errors
        // and serious underlying issues. Respond with badRequest if a
        // validation error is encountered, w/ validation info.
        if (err) {
          switch (err.name) {
            case 'AdapterError':
              switch (err.code) {
                case 'E_UNIQUE': return res.badRequest(err);
                default: return res.serverError(err);
              } return;
            case 'UsageError': return res.badRequest(err);
            default: return res.serverError(err);
          }
        }//-•

        // If we have the pubsub hook, use the model class's publish method
        // to notify all subscribers about the created item
        if (req._sails.hooks.pubsub) {
            if (req.isSocket) {
                Model.subscribe(req, [newInstance[Model.primaryKey]]);
                Model._introduce(newInstance);
            }
            Model._publishCreate(newInstance, !req.options.mirror && req);
        }

        // Look up and populate the new record (according to `populate` options in request / config)
        var Q = Model.findOne(newInstance[Model.primaryKey]);
        Q = actionUtil.populateRequest(Q, req);
        Q.exec(function foundAgain(err, populatedRecord) {
          if (err) { return res.serverError(err); }
          if (!populatedRecord) { return res.serverError('Could not find record after creating!'); }
          // Send response
          res.ok(populatedRecord);
        }); // </foundAgain>

    });
};
