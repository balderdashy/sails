/**
 * Module dependencies
 */
var actionUtil = require('../actionUtil'),
  _ = require('lodash');

/**
 * Find Records
 *
 *  get   /:modelIdentity
 *   *    /:modelIdentity/find
 *
 * An API call to find and return model instances from the data adapter
 * using the specified criteria.  If an id was specified, just the instance
 * with that unique id will be returned.
 *
 * Optional:
 * @param {String} columns     - the columns that you want returned. Should be comma separated. (i.e. /Model?columns=column1,column2)
 * @param {Object} where       - the find criteria (passed directly to the ORM)
 * @param {Integer} limit      - the maximum number of records to send back (useful for pagination)
 * @param {Integer} skip       - the number of records to skip (useful for pagination)
 * @param {String} sort        - the order of returned records, e.g. `name ASC` or `age DESC`
 * @param {String} callback - default jsonp callback param (i.e. the name of the js function returned)
 */

module.exports = function findRecords (req, res) {

  // Look up the model
  var Model = actionUtil.parseModel(req);


  // ** Comment this out because it fails with the columns parameter
  // If an `id` param was specified, use the findOne blueprint action
  // to grab the particular instance with its primary key === the value
  // of the `id` param.   (mainly here for compatibility for 0.9, where
  // there was no separate `findOne` action)
  //if ( actionUtil.parsePk(req) ) {
  //  return require('./findOne')(req,res);
  //}
  
  // Parse the columns that were specified by the user in the "columns" parameter of the URL.
  // If no columns were specified, use all columns.
  var columns = req.param('columns') ? {select: req.param('columns').replace(/ /g, '').split(',')} : {};

  // Lookup for records that match the specified criteria
  var query = Model.find(columns)
  .where( actionUtil.parseCriteria(req) )
  .limit( actionUtil.parseLimit(req) )
  .skip( actionUtil.parseSkip(req) )
  .sort( actionUtil.parseSort(req) );
  query = actionUtil.populateRequest(query, req);
  query.exec(function found(err, matchingRecords) {
    if (err) return res.serverError(err);

    // Only `.watch()` for new instances of the model if
    // `autoWatch` is enabled.
    if (req._sails.hooks.pubsub && req.isSocket) {
      Model.subscribe(req, matchingRecords);
      if (req.options.autoWatch) { Model.watch(req); }
      // Also subscribe to instances of all associated models
      _.each(matchingRecords, function (record) {
        actionUtil.subscribeDeep(req, record);
      });
    }

    res.ok(matchingRecords);
  });
};
