/**
 * Module dependencies
 */
var _ = require('@sailshq/lodash');



/**
 * _mixinReqParamsAll
 *
 * Mixes in `req.params.all()`, a convenience method to grab all parameters,
 * whether they're in the path (req.params), query string (req.query),
 * or request body (req.body).
 *
 * Note: this has to be determined per-route, not per request,
 * in order to refer to the proper route/path parameters.
 * e.g. if a request comes in and matches `GET /about` AND `GET /:username`
 * then the set of all params varies depending on which handler is being run.
 * Now that said, since changing the implementation to avoid precalculating
 * unless allParams is actually called, this may not necessarily need to be
 * the case anymore. More exhaustive testing would be required to make that change.
 *
 *
 * @param {Request} req
 * @param {Response} res
 * @api private
 */

module.exports = function _mixinReqParamsAll(req /*, res */) {

  // Add `req.allParams()` method.
  req.allParams = function () {
    // Combines parameters from the query string, and encoded request body
    // to compose a monolithic object of named parameters, irrespective of source
    var allParams = _.extend({}, req.query, req.body);

    // Mixin route params, as long as they have defined values
    _.each(Object.keys(req.params), function(paramName) {
      if (allParams[paramName] || !_.isUndefined(req.params[paramName])) {
        allParams[paramName] = !_.isUndefined(req.params[paramName]) ? req.params[paramName] : allParams[paramName];
      }
    });
    return allParams;
  };



  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Note:
  // req.params.all() was removed in Sails v1.0 in favor of `req.allParams()`.
  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  //
  // The following code was removed for performance reasons.
  // (Object.defineProperty() is slow-- see `parley` benchmarks + commit history c.a. Oct-Dec 2016)
  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  // // Define a new non-enumerable property: req.params.all()
  // // and make it a synonym to `req.allParams()`
  // // (but only if `req.params.all` doesn't already exist!)
  // if (!req.params.all) {
  //   Object.defineProperty(req.params, 'all', {
  //     value: function (){
  //       throw new Error('req.params.all() is no longer supported as of Sails v1.0.  Please use req.allParams() instead.');
  //     }
  //   });
  // }
  /////////////////////////////////////////////////////////////////////////////////////////////////////////

};
