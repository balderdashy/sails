/**
 * Module dependencies
 */

var actionUtil = require('../actionUtil');
var _ = require('@sailshq/lodash');

/**
 * Find Records
 *
 * http://sailsjs.com/docs/reference/blueprint-api/find
 *
 * An API call to find and return model instances from the data adapter
 * using the specified criteria.  If an id was specified, just the instance
 * with that unique id will be returned.
 *
 */

module.exports = function findRecords (req, res) {

  // Look up the model
  var Model = actionUtil.parseModel(req);


  // If an `id` param was specified, use the findOne blueprint action
  // to grab the particular instance with its primary key === the value
  // of the `id` param.   (mainly here for compatibility for 0.9, where
  // there was no separate `findOne` action)
  if ( actionUtil.parsePk(req) ) {
    return require('./findOne')(req,res);
  }

  // Lookup for records that match the specified criteria
  var query = Model.find()
  .where( actionUtil.parseCriteria(req) )
  .limit( actionUtil.parseLimit(req) )
  .skip( actionUtil.parseSkip(req) )
  .sort( actionUtil.parseSort(req) );
  query = actionUtil.populateRequest(query, req);
  query.exec(function found(err, matchingRecords) {
    if (err) { return res.serverError(err); }

    // Only `._watch()` for new instances of the model if
    // `autoWatch` is enabled.
    if (req._sails.hooks.pubsub && req.isSocket) {
      Model.subscribe(req, _.pluck(matchingRecords, Model.primaryKey));
      if (req.options.autoWatch) { Model._watch(req); }
      // Also subscribe to instances of all associated models
      _.each(matchingRecords, function (record) {
        actionUtil.subscribeDeep(req, record);
      });
    }

    res.ok(matchingRecords);
  });
};
