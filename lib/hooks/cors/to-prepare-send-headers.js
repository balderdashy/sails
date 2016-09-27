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

        var originConfig = (routeCorsConfig.origin || sails.config.cors.origin);
        var credentialsConfig = (routeCorsConfig.credentials || sails.config.cors.credentials);

        // Get the allowed origins
        var origins = originConfig.split(',');

        // Match the origin of the request against the allowed origins
        var foundOrigin = false;
        _.each(origins, function(origin) {

          origin = origin.trim();
          // If we find a whitelisted origin, send the Access-Control-Allow-Origin header
          // to greenlight the request.
          if (origin == req.headers.origin || origin == '*') {
            res.set('Access-Control-Allow-Origin', origin);
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

        // Determine whether or not to allow cookies to be passed cross-origin.
        // If the CORS config for this route is (or is defaulting to) `credentials: true`...
        if (credentialsConfig === true) {
          // If the origin is set to `*`, `credentials` can't be true, so log a warning
          // and clear the access-control-allow-credentials header.
          if (originConfig === '*') {
            sails.log.error('Invalid CORS settings for route `' + req.url + '`: if `origin` is \'*\', `credentials` cannot be `true` (setting `credentials` to `false` for you).');
            res.removeHeader('Access-Control-Allow-Credentials');
          }
          // Otherwise set the access-control-allow-credentials header to `true`.
          else {
            res.set('Access-Control-Allow-Credentials', 'true');
          }
        }
        // Otherwise if the global or route-level CORS config is or is defaulting to
        // `credentials: false`, then clear the access-control-allow-credentials header.
        else {
          res.removeHeader('Access-Control-Allow-Credentials');
        }

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
