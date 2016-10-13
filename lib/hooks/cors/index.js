module.exports = function(sails) {

  /**
   * Module dependencies.
   */

  var _ = require('lodash');
  var setHeaders = require('./set-headers');
  var clearHeaders = require('./clear-headers');
  var setPreflightConfig = require('./set-preflight-config');


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
        credentials: false,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        allowedHeaders: 'content-type',
        exposedHeaders: '',
        securityLevel: 0,
        allowAnyOriginWithCredentialsUnsafe: false
      }
    },

    configure: function() {

      // Deprecate `sails.config.cors.exposeHeaders` in favor of `sails.config.cors.exposedHeaders`
      if (sails.config.cors.exposeHeaders) {
        sails.log.error('`sails.config.cors.exposeHeaders` configuration is deprecated; please use `sails.config.cors.exposedHeaders` instead.');
        if (!sails.config.cors.exposedHeaders) {
          sails.config.cors.exposedHeaders = sails.config.cors.exposeHeaders;
        }
        delete sails.config.cors.exposeHeaders;
      }

      // Deprecate `sails.config.cors.headers` in favor of `sails.config.cors.allowedHeaders`
      if (sails.config.cors.headers) {
        sails.log.error('`sails.config.cors.headers` configuration is deprecated; please use `sails.config.cors.allowedHeaders` instead.');
        if (!sails.config.cors.allowedHeaders) {
          sails.config.cors.allowedHeaders = sails.config.cors.headers;
        }
        delete sails.config.cors.headers;
      }

      // If we're operating in unsafe mode, and origin is '*' and credentials is `true`,
      // set the default origin to `true` as well which means "reflect origin header".
      if (sails.config.cors.allowAnyOriginWithCredentialsUnsafe && sails.config.cors.credentials === true && sails.config.cors.origin === '*') {
        sails.config.cors.origin = true;
      }

      // If the default origin is a string, turn it into an array by splitting on `,`.
      // This is important to do even when the origin is a single domain, because the
      // default behavior of the `cors` module in that situation is to expose the
      // configured origin, which is weird (the exception is when origin is '*').
      if (_.isString(sails.config.cors.origin) && sails.config.cors.origin !== '*') {
        sails.config.cors.origin = _.map(sails.config.cors.origin.split(','), function(origin){ return origin.trim(); });
      }

    },

    /**
     * When this hook loads...
     * @param  {Function} cb
     */
    initialize: function(cb) {

      // If the app attempts to set `origin: '*'` and `credentials: true`, log a warning
      // and set `credentials` to `false`.
      if (sails.config.cors.origin === '*' && sails.config.cors.credentials === true && sails.config.cors.allowAnyOriginWithCredentialsUnsafe !== true) {
        return cb('Invalid global CORS settings: if `origin` is \'*\', `credentials` cannot be `true` unless `allowAnyOriginWithCredentialsUnsafe` is also true.');
      }

      var corsModuleSettingsProperties = ['origin', 'methods', 'allowedHeaders', 'exposedHeaders', 'credentials'];
      var globalCorsModuleSettings = _.pick(sails.config.cors, corsModuleSettingsProperties);
      globalCorsModuleSettings.optionsSuccessStatus = 200;

      // Once it's time to bind shadow routes, get to bindin'.
      sails.on('router:before', function () {
        // (TODO: consider changing this ^^ to `sails.after()` for consistency)

        // If we're setting CORS on all routes by default, set up a universal route for it here.
        // CORS can still be turned off for specific routes by setting `cors:false`
        if (sails.config.cors.allRoutes === true) {
          sails.router.bind('/*', setHeaders(globalCorsModuleSettings), 'all', {_middlewareType: 'CORS HOOK: sendHeaders'});
        }
        // Otherwise, default to blocking all cross-origin requests.
        else {
          sails.router.bind('/*', setHeaders({origin: false}), null, {_middlewareType: 'CORS HOOK: clearHeaders'});
        }

        var optionsRouteConfigs = {};

        // Loop through all configured routes, looking for CORS options
        _.each(sails.config.routes, function(config, route) {

          var routeInfo = sails.util.detectVerb(route);
          var path = routeInfo.original.toLowerCase();
          var verb = routeInfo.verb.toLowerCase();

          if (!_.isUndefined(config.cors)) {

            optionsRouteConfigs[path] = optionsRouteConfigs[path] || {};

            // If cors is set to `true`, and we're not doing all routes by default, set
            // the CORS headers for this route using the default origin
            if (config.cors === true) {
              if (!sails.config.cors.allRoutes) {
                // Use the default CORS config for this path on an OPTIONS request
                optionsRouteConfigs[path][verb || 'default'] = sails.config.cors;
                sails.router.bind(route, setHeaders(globalCorsModuleSettings), null, {_middlewareType: 'CORS HOOK: setHeaders'});
              }
            }

            // If cors is set to `false`, clear the CORS headers for this route
            else if (config.cors === false) {
              // Clear headers on an OPTIONS request for this path
              optionsRouteConfigs[path][verb || 'default'] = 'clear';
              sails.router.bind(route, setHeaders({origin: false}), 'all', {_middlewareType: 'CORS HOOK: clearHeaders'});
              return;
            }


            // Else if cors is set to a string, use that has the origin
            else if (typeof config.cors === 'string') {
              optionsRouteConfigs[path][verb || 'default'] = _.extend({origin: config.cors});
              sails.router.bind(route, setHeaders(_.extend({}, globalCorsModuleSettings, {origin:config.cors, methods: verb})), null, {_middlewareType: 'CORS HOOK: setHeaders'});
            }

            // Else if cors is an object, use that as the config
            else if (_.isPlainObject(config.cors)) {

              var routeCorsSettings = _.extend({}, globalCorsModuleSettings, config.cors);
              if (routeCorsSettings.origin === '*' && routeCorsSettings.credentials === true && routeCorsSettings.allowAnyOriginWithCredentialsUnsafe !== true) {
                throw new Error('Route `' + (verb ? (verb + ' ') : '') + path + '` has invalid CORS settings: if `origin` is \'*\', `credentials` cannot be `true` unless `allowAnyOriginWithCredentialsUnsafe` is also true.');
              }

              // If the route has a verb, it shouldn't have a `methods` CORS setting
              if (routeInfo.verb && config.cors.methods) {
                sails.log.warn('Ignoring `methods` CORS setting for route '+route+' because it has a verb specified.');
                config.cors.methods = verb;
              }

              // Deprecate `exposeHeaders` in favor of `exposedHeaders`
              if (config.cors.exposeHeaders) {
                sails.log.error('`cors.exposeHeaders` configuration is deprecated; please use `config.cors.exposedHeaders` instead.');
                if (!config.cors.exposedHeaders) {
                  config.cors.exposedHeaders = config.cors.exposeHeaders;
                }
                delete config.cors.exposeHeaders;
              }

              // Deprecate `headers` in favor of `allowedHeaders`
              if (config.cors.headers) {
                sails.log.error('`cors.headers` configuration is deprecated; please use `cors.allowedHeaders` instead.');
                if (!config.cors.allowedHeaders) {
                  config.cors.allowedHeaders = config.cors.headers;
                }
                delete config.cors.headers;
              }

              // If the origin is a string, turn it into an array by splitting on `,`.
              // This is important to do even when the origin is a single domain, because the
              // default behavior of the `cors` module in that situation is to expose the
              // configured origin, which is weird (the exception is when origin is '*').
              if (_.isString(config.cors.origin) && config.cors.origin !== '*') {
                config.cors.origin = _.map(config.cors.origin.split(','), function(origin){ return origin.trim(); });
              }


              optionsRouteConfigs[path][verb || 'default'] = config.cors;
              sails.router.bind(route, setHeaders(_.extend({}, globalCorsModuleSettings, config.cors)), null, {_middlewareType: 'CORS HOOK: setHeaders'});
            }

            // Otherwise throw a warning
            else {
              sails.log.warn('Invalid CORS settings for route '+route);
            }

          }

        });

        // Now that we have a list of all of the routes that (possibly) need to be preflighted,
        // construct a route that will handle OPTIONS requests for all of those routes.
        sails.router.bind('options /*', setHeaders(setPreflightConfig(optionsRouteConfigs, globalCorsModuleSettings)), 'options', {_middlewareType: 'CORS HOOK: preflight'});

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
            if (!sails.util.isSameOrigin(req, sails.config.cors.securityLevel === sails.hooks.cors.SECURITY_LEVEL_VERYHIGH) && res.get('Access-Control-Allow-Origin') !== req.headers.origin) {
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
