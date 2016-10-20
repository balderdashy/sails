/**
 * Module dependencies.
 */

var _ = require('lodash');
var pathToRegexp = require('path-to-regexp');

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

module.exports = function setPreflightConfig(preflightConfigs, defaultConfig) {

  return function (req, cb) {

    var path = req.path;
    var method = (req.headers['access-control-request-method'] || '').toLowerCase() || 'default';
    var regex = pathToRegexp(path, []);

    var corsConfig = _.reduce(preflightConfigs, function(memo, configs, preflightConfigPath) {
      if (memo) {return memo;}
      var regex = pathToRegexp(preflightConfigPath, []);
      if (path.match(regex) && (configs[method] || configs.default)) {
        return (configs[method] || configs.default);
      }
    }, null);

    if (!corsConfig) {
      return cb(null, { origin: false });
    }

    return cb(null, _.extend({}, defaultConfig, corsConfig));

  };

};

