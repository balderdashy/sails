/**
 * Module dependencies.
 */

var _ = require('lodash');
var clearHeaders = require('./clear-headers');


/**
 * toPrepareSendHeaders()
 *
 * @param  {SailsApp} sails
 *
 * @return {Function}
 *         not-yet-configured middleware ("protoware") that can be called to get req/res/next mware function
 */
module.exports = function (sails) {


  /**
   * @optional  {Dictionary}  _routeCorsConfig
   *
   * @optional  {Boolean} isOptionsRoute
   *            if set, use the `access-control-request-method` header
   *            as the method when looking up the route's CORS configuration
   *
   * @return {Function}
   *         A configured middleware function which sets the appropriate headers.
   */
  return function toPrepareSendHeaders(_routeCorsConfig, isOptionsRoute) {

    if (!_routeCorsConfig) {
      _routeCorsConfig = {};
    }
    var _sendHeaders = function(req, res, next) {
      var routeCorsConfig;
      // If this is an options route handler, pull the config to use based on the method
      // that would be used in the follow-on request
      if (isOptionsRoute) {
        var method = (req.headers['access-control-request-method'] || '').toLowerCase() || 'default';
        routeCorsConfig = _routeCorsConfig[method] || {};
        if (routeCorsConfig == 'clear') {
          return clearHeaders(req, res, next);
        }
      }
      // Otherwise just use the config that was passed down
      else {
        routeCorsConfig = _routeCorsConfig;
      }
      // If we have an origin header...
      if (req.headers && req.headers.origin) {

        // Get the allowed origins
        var origins = (routeCorsConfig.origin || sails.config.cors.origin).split(',');

        // Match the origin of the request against the allowed origins
        var foundOrigin = false;
        _.each(origins, function(origin) {

          origin = origin.trim();
          // If we find a whitelisted origin, send the Access-Control-Allow-Origin header
          // to greenlight the request.
          if (origin == req.headers.origin || origin == '*') {
            res.set('Access-Control-Allow-Origin', req.headers.origin);
            foundOrigin = true;
            return false;
          }
          return true;
        });

        if (!foundOrigin) {
          // For HTTP requests, set the Access-Control-Allow-Origin header to '', which the browser will
          // interpret as, 'no way Jose.'
          res.set('Access-Control-Allow-Origin', '');
        }

        // Determine whether or not to allow cookies to be passed cross-origin
        res.set('Access-Control-Allow-Credentials', !_.isUndefined(routeCorsConfig.credentials) ? routeCorsConfig.credentials : sails.config.cors.credentials);

        // This header lets a server whitelist headers that browsers are allowed to access
        res.set('Access-Control-Expose-Headers', !_.isUndefined(routeCorsConfig.exposeHeaders) ? routeCorsConfig.exposeHeaders : sails.config.cors.exposeHeaders);

        // Handle preflight requests
        if (req.method == 'OPTIONS') {
          res.set('Access-Control-Allow-Methods', !_.isUndefined(routeCorsConfig.methods) ? routeCorsConfig.methods : sails.config.cors.methods);
          res.set('Access-Control-Allow-Headers', !_.isUndefined(routeCorsConfig.headers) ? routeCorsConfig.headers : sails.config.cors.headers);
        }

      }

      next();

    };

    _sendHeaders._middlewareType = 'CORS HOOK: sendHeaders';
    return _sendHeaders;

  };

};
