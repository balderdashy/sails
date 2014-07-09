/**
 * Module dependencies
 */

var STRINGFILE = require('sails-stringfile');



/**
 * Mix in convenience flags about this request
 *
 * @param {Request} req
 * @param {Response} res
 * @api private
 */

module.exports = function _mixinReqQualifiers(req, res) {
  var accept = req.get('Accept') || '';

  // Flag indicating whether HTML was explicitly mentioned in the Accepts header
  req.explicitlyAcceptsHTML = (accept.indexOf('html') !== -1);

  // Flag indicating whether a request would like to receive a JSON response
  //
  // This qualification is determined based on a handful of heuristics, including:
  // • if this looks like an AJAX request
  // • if this is a virtual request from a socket
  // • if this request DOESN'T explicitly want HTML
  // • if this request has a "json" content-type AND ALSO has its "Accept" header set
  // • if this request has the option "wantsJSON" set
  req.wantsJSON = req.xhr;
  req.wantsJSON = req.wantsJSON || req.isSocket;
  req.wantsJSON = req.wantsJSON || !req.explicitlyAcceptsHTML;
  req.wantsJSON = req.wantsJSON || (req.is('json') && req.get('Accept'));
  req.wantsJSON = req.wantsJSON || req.options.wantsJSON;


  // Deprecated properties
  bindReqDeprecationNotice(req, 'isJson');
  bindReqDeprecationNotice(req, 'isAjax');
  bindResDeprecationNotice(res, 'viewExists');
};



/**
 * Bind deprecation notices for `req.*` properties from 0.8.x,
 * but only in development env, and only if the property
 * doesn't already exist (i.e. in case a user-defined
 * hook bound it on the `req` object.)
 *
 * @param  {Request} req
 * @param  {String} key
 */
function bindReqDeprecationNotice(req, key) {
  if (process.env.NODE_ENV === 'production' || req[key]) return;

  // Attach a getter
  Object.defineProperty(req, key, {
    value: function showDeprecationNotice() {
      var e = STRINGFILE.get('upgrade.req.' + key);
      throw new Error(e);
    }
  });
}


/**
 * Bind deprecation notices for `res.*` properties from 0.8.x,
 * but only in development env, and only if the property
 * doesn't already exist (i.e. in case a user-defined
 * hook bound it on the `res` object.)
 *
 * @param  {Response} res
 * @param  {String} key
 */
function bindResDeprecationNotice(res, key) {
  if (process.env.NODE_ENV === 'production' || res[key]) return;

  // Attach a getter
  Object.defineProperty(res, key, {
    value: function showDeprecationNotice() {
      var e = STRINGFILE.get('upgrade.res.' + key);
      throw new Error(e);
    }
  });
}
