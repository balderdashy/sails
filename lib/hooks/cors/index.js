module.exports = function(sails) {

  /**
   * Module dependencies.
   */

  var _ = require('lodash');
  var clearHeaders = require('./clear-headers');
  var prepareSendHeaders = require('./to-prepare-send-headers')(sails);


  /**
   * Expose hook definition
   */

  return {

    // These constants are for private use within the hook.
    SECURITY_LEVEL_NORMAL: 0,
    SECURITY_LEVEL_HIGH: 1,
    SECURITY_LEVEL_VERYHIGH: 2,


    /**
     * Implicit defaults
     * @type {Dictionary}
     */
    defaults: {
      cors: {
        origin: '*',
        allRoutes: false,
        credentials: true,
        methods: 'GET, POST, PUT, DELETE, OPTIONS, HEAD',
        headers: 'content-type',
        exposeHeaders: '',
        securityLevel: 0,
      }
    },


    /**
     * When this hook loads...
     * @param  {Function} cb
     */
    initialize: function(cb) {

      // Once it's time to bind shadow routes, get to bindin'.
      sails.on('router:before', function () {
        // (TODO: consider changing this ^^ to `sails.after()` for consistency)

        // If we're setting CORS on all routes by default, set up a universal route for it here.
        // CORS can still be turned off for specific routes by setting `cors:false`
        if (sails.config.cors.allRoutes === true) {
          sails.router.bind('/*', prepareSendHeaders(), 'all', {_middlewareType: 'CORS HOOK: sendHeaders'});
        }
        // Otherwise clear all the headers by default
        else {
          sails.router.bind('/*', clearHeaders, 'all', {_middlewareType: 'CORS HOOK: clearHeaders'});
        }

        var optionsRouteConfigs = {};

        // Loop through all configured routes, looking for CORS options
        _.each(sails.config.routes, function(config, route) {

          var routeInfo = sails.util.detectVerb(route);
          var path = routeInfo.original.toLowerCase();
          var verb = routeInfo.verb.toLowerCase();

          if (!_.isUndefined(config.cors)) {

            optionsRouteConfigs[path] = optionsRouteConfigs[path] || {'default': sails.config.cors};

            // If cors is set to `true`, and we're not doing all routes by default, set
            // the CORS headers for this route using the default origin
            if (config.cors === true) {
              // Use the default CORS config for this path on an OPTIONS request
              optionsRouteConfigs[path][verb || 'default'] = sails.config.cors;
              if (!sails.config.cors.allRoutes) {
               sails.router.bind(route, prepareSendHeaders(), null);
              }
            }

            // If cors is set to `false`, clear the CORS headers for this route
            else if (config.cors === false) {
              // Clear headers on an OPTIONS request for this path
              optionsRouteConfigs[path][verb || 'default'] = 'clear';
              sails.router.bind(route, clearHeaders, null, {_middlewareType: 'CORS HOOK: clearHeaders'});
              return;
            }


            // Else if cors is set to a string, use that has the origin
            else if (typeof config.cors === 'string') {
              optionsRouteConfigs[path][verb || 'default'] = _.extend({origin: config.cors},{methods: verb});
              sails.router.bind(route, prepareSendHeaders({origin:config.cors}), null);
            }

            // Else if cors is an object, use that as the config
            else if (_.isPlainObject(config.cors)) {
              // If the route has a verb, it shouldn't have a `methods` CORS setting
              if (routeInfo.verb && config.cors.methods) {
                sails.log.warn('Ignoring `methods` CORS setting for route '+route+' because it has a verb specified.');
                config.cors.methods = verb;
              }
              optionsRouteConfigs[path][verb || 'default'] = config.cors;
              sails.router.bind(route, prepareSendHeaders(config.cors), null);
            }

            // Otherwise throw a warning
            else {
              sails.log.warn('Invalid CORS settings for route '+route);
            }

          }

        });

        _.each(optionsRouteConfigs, function(config, path) {
          sails.router.bind('options '+path, prepareSendHeaders(config, true), null, {_middlewareType: 'CORS HOOK: preflight'});
        });

        // IF SECURITY_LEVEL > 'normal'--don't process requests from disallowed origins.
        //
        // We can't just rely on the browser implementing 'access-control-allow-origin' correctly;
        // we need to make sure that if a request is made from an origin that isn't whitelisted,
        // that we don't end up processing that request.
        if (sails.config.cors.securityLevel > sails.hooks.cors.SECURITY_LEVEL_NORMAL) {
          sails.router.bind('/*', function(req, res, next) {

            // If it's a cross-origin request, and the access-control-allow-origin header doesn't match
            // the origin header, then we don't approve of this origin and shouldn't continue
            // with this request.
            if (!sails.util.isSameOrigin(req, sails.config.cors.securityLevel == sails.hooks.cors.SECURITY_LEVEL_VERYHIGH) && res.get('Access-Control-Allow-Origin') != req.headers.origin) {
              return res.forbidden();
            }
            return next();
          }, null, {_middlewareType: 'CORS HOOK: catchall'});
        }

      });


      // Continue loading this Sails app.
      return cb();

    }//</initialize>

  };

};
