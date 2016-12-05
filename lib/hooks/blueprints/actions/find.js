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

    // TODO: For clarity's sake, this should be handled this elsewhere.
    return require('./findOne')(req,res);
  }//-•


  // Lookup for records that match the specified criteria.
  var query = Model.find()
  .where( actionUtil.parseCriteria(req) )
  .limit( actionUtil.parseLimit(req) )
  .skip( actionUtil.parseSkip(req) )
  .sort( actionUtil.parseSort(req) );
  query = actionUtil.populateRequest(query, req);
  query.exec(function found(err, matchingRecords) {
    if (err) {
      // If this is a usage error coming back from Waterline,
      // (e.g. a bad criteria), then use a 400 response code.
      // Otherwise, it's your everyday 500.
      switch (err.code) {
        case 'E_USAGE': return res.badRequest(err);
        default: return res.serverError(err);
      }
    }//-•

    if (req._sails.hooks.pubsub && req.isSocket) {
      Model.subscribe(req, _.pluck(matchingRecords, Model.primaryKey));
      // Only `._watch()` for new instances of the model if
      // `autoWatch` is enabled.
      if (req.options.autoWatch) { Model._watch(req); }
      // Also subscribe to instances of all associated models
      _.each(matchingRecords, function (record) {
        actionUtil.subscribeDeep(req, record);
      });
    }//>-

    return res.ok(matchingRecords);

  });//</ .find().exec() >

};
