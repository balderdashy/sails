module.exports = function(sails) {

  /**
   * Module dependencies.
   */

  var _ = require('@sailshq/lodash');
  var flaverr = require('flaverr');

  var checkOriginUrl = require('../../util/check-origin-url');
  var detectVerb = require('../../util/detect-verb');

  var initializeCors = require('./cors')(sails);
  var initializeCsrf = require('./csrf')(sails);
  var grantCsrfToken = require('./csrf/grant-csrf-token');

  /**
   * Expose hook definition
   */

  return {

    defaults: {

      security: {

        cors: {
          allowOrigins: '*',
          allRoutes: false,
          allowCredentials: false,
          allowRequestMethods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
          allowRequestHeaders: 'content-type',
          allowResponseHeaders: '',
          allowAnyOriginWithCredentialsUnsafe: false
        },

        csrf: false

      }

    },

    configure: function() {


      //   ██████╗ ██████╗ ███╗   ██╗███████╗██╗ ██████╗ ██╗   ██╗██████╗ ███████╗
      //  ██╔════╝██╔═══██╗████╗  ██║██╔════╝██║██╔════╝ ██║   ██║██╔══██╗██╔════╝
      //  ██║     ██║   ██║██╔██╗ ██║█████╗  ██║██║  ███╗██║   ██║██████╔╝█████╗
      //  ██║     ██║   ██║██║╚██╗██║██╔══╝  ██║██║   ██║██║   ██║██╔══██╗██╔══╝
      //  ╚██████╗╚██████╔╝██║ ╚████║██║     ██║╚██████╔╝╚██████╔╝██║  ██║███████╗
      //   ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝     ╚═╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚══════╝
      //
      //   ██████╗███████╗██████╗ ███████╗
      //  ██╔════╝██╔════╝██╔══██╗██╔════╝
      //  ██║     ███████╗██████╔╝█████╗
      //  ██║     ╚════██║██╔══██╗██╔══╝
      //  ╚██████╗███████║██║  ██║██║
      //   ╚═════╝╚══════╝╚═╝  ╚═╝╚═╝

      if (sails.config.csrf) {
        sails.log.debug('The `sails.config.csrf` config has been deprecated.');
        sails.log.debug('Please use `sails.config.security.csrf` instead.');
        sails.log.debug('(we\'ll use your `sails.config.csrf` settings for now).\n');
        sails.config.security.csrf = sails.config.csrf;
      }

      if (sails.config.security.csrf === true && !sails.hooks.session) {
        throw flaverr({ name: 'userError', code: 'E_INVALID_SECURITY_CONFIG' }, new Error(
          '\n-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-\n'+
          'Detected `sails.config.security.csrf set to `true` while session hook is disabled.\n'+
          'Sails CSRF support requires the session hook to be enabled.\n'+
          'See http://sailsjs.com/docs/reference/config/sails-config-session#?disabling-sessions.\n'+
          '-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-\n'
        ));
      }

      if (!_.isUndefined(sails.config.security.csrf.routesDisabled)) {
        throw flaverr({ name: 'userError', code: 'E_INVALID_SECURITY_CONFIG' }, new Error(
          '\n-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-\n'+
          'Invalid global CSRF settings: `routesDisabled` is no longer supported as of Sails v1.0.\n'+
          'Instead, set `csrf: false` in `config/routes.js` for any route that you want exempted\n'+
          'from CSRF protection.\n'+
          'For more info see: http://sailsjs.com/docs/concepts/security/csrf#?enabling-csrf-protection.\n'+
          '-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-\n'
        ));
      }

      if (!_.isUndefined(sails.config.security.csrf.origin)) {
        throw flaverr({ name: 'userError', code: 'E_INVALID_SECURITY_CONFIG' }, new Error(
          '\n-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-\n'+
          'Invalid global CSRF settings: `origin` is no longer supported as of Sails v1.0.\n'+
          'Instead, apply CORS settings directly to the CSRF-token-dispensing route in `config/routes.js`.\n'+
          'For more info see: \n'+
          'http://next.sailsjs.com/docs/concepts/security/csrf#?using-ajax-websockets\n'+
          'http://next.sailsjs.com/documentation/concepts/security/cors\n'+
          '-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-\n'
        ));
      }

      if (!_.isUndefined(sails.config.security.csrf.grantTokenViaAjax)) {
        throw flaverr({ name: 'userError', code: 'E_INVALID_SECURITY_CONFIG' }, new Error(
          '\n-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-\n'+
          'Invalid global CSRF settings: `grantTokenViaAjax` is no longer supported as of Sails v1.0.\n'+
          'Instead, add a route to your `config/routes.js` file using the `security/grant-csrf-token` action.\n'+
          'For more info see: http://next.sailsjs.com/docs/concepts/security/csrf#?using-ajax-websockets\n'+
          '-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-\n'
        ));
      }


      //   ██████╗ ██████╗ ███╗   ██╗███████╗██╗ ██████╗ ██╗   ██╗██████╗ ███████╗
      //  ██╔════╝██╔═══██╗████╗  ██║██╔════╝██║██╔════╝ ██║   ██║██╔══██╗██╔════╝
      //  ██║     ██║   ██║██╔██╗ ██║█████╗  ██║██║  ███╗██║   ██║██████╔╝█████╗
      //  ██║     ██║   ██║██║╚██╗██║██╔══╝  ██║██║   ██║██║   ██║██╔══██╗██╔══╝
      //  ╚██████╗╚██████╔╝██║ ╚████║██║     ██║╚██████╔╝╚██████╔╝██║  ██║███████╗
      //   ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝     ╚═╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚══════╝
      //
      //   ██████╗ ██████╗ ██████╗ ███████╗
      //  ██╔════╝██╔═══██╗██╔══██╗██╔════╝
      //  ██║     ██║   ██║██████╔╝███████╗
      //  ██║     ██║   ██║██╔══██╗╚════██║
      //  ╚██████╗╚██████╔╝██║  ██║███████║
      //   ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝

      //  ┌─┐┬  ┌─┐┌┐ ┌─┐┬    ┌─┐┌─┐┌┐┌┌─┐┬┌─┐
      //  │ ┬│  │ │├┴┐├─┤│    │  │ ││││├┤ ││ ┬
      //  └─┘┴─┘└─┘└─┘┴ ┴┴─┘  └─┘└─┘┘└┘└  ┴└─┘
      if (!_.isUndefined(sails.config.cors)) {
        sails.log.debug('The `sails.config.cors` config has been deprecated.');
        sails.log.debug('Please use `sails.config.security.cors` instead.');
        sails.log.debug('(we\'ll use your `sails.config.cors` settings for now).\n');
        sails.config.security.cors = _.extend(sails.config.security.cors, sails.config.cors);
      }

      // Fail to lift if `securityLevel` is used
      if (!_.isUndefined(sails.config.security.cors.securityLevel)) {
        throw flaverr({ name: 'userError', code: 'E_INVALID_SECURITY_CONFIG' }, new Error(
          '\n-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-\n'+
          'Invalid global CORS settings: `securityLevel` is no longer supported as of Sails v1.0.\n'+
          'Instead, to secure your socket requests use `sails.config.sockets.onlyAllowOrigins`.\n'+
          'For more info see: http://sailsjs.com/config/sockets.\n'+
          '-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-\n'
        ));
      }

      // Deprecate `origin` in favor of `allowOrigins`
      if (!_.isUndefined(sails.config.security.cors.origin)) {
        sails.log.debug('The `sails.config.security.cors.origin` config has been deprecated.');
        sails.log.debug('Please use `sails.config.security.cors.allowOrigins` instead.');
        sails.log.debug('(See http://sailsjs.com/config/security for more info.)'+'\n');
        sails.config.security.cors.allowOrigins = sails.config.security.cors.origin;
        delete sails.config.security.cors.origin;
      }

      // Deprecate declaring `allowOrigins` as a string (except for '*').
      if (_.isString(sails.config.security.cors.allowOrigins) && sails.config.security.cors.allowOrigins !== '*') {
        sails.log.debug('When specifying multiple origins, the `sails.config.security.cors.allowOrigins`');
        sails.log.debug('setting should be an array of strings. We\'ll split it up for you this time...\n');
        sails.config.security.cors.allowOrigins = _.map(sails.config.security.cors.allowOrigins.split(','), function(origin){ return origin.trim(); });
      }

      // Bail out if `allowOrigins` is not an array or `*`.
      else if (!_.isUndefined(sails.config.security.cors.allowOrigins) && sails.config.security.cors.allowOrigins !== '*' && !_.isArray(sails.config.security.cors.allowOrigins)) {
        throw flaverr({ name: 'userError', code: 'E_INVALID_SECURITY_CONFIG' }, new Error('Invalid global CORS settings: if `allowOrigins` is specified, it must be either \'*\' or an array of strings.  See http://sailsjs.com/config/security for more info.'));
      }

      // Deprecate `credentials` in favor of `allowCredentials`
      if (!_.isUndefined(sails.config.security.cors.credentials)) {
        sails.log.debug('The `sails.config.security.cors.credentials` config has been deprecated.');
        sails.log.debug('Please use `sails.config.security.cors.allowCredentials` instead.\n');
        sails.config.security.cors.allowCredentials = sails.config.security.cors.credentials;
        delete sails.config.security.cors.credentials;
      }

      // Deprecate `headers` in favor of `allowRequestHeaders`
      if (!_.isUndefined(sails.config.security.cors.headers)) {
        sails.log.debug('The `sails.config.security.cors.headers` config has been deprecated.');
        sails.log.debug('Please use `sails.config.security.cors.allowRequestHeaders` instead.\n');
        sails.config.security.cors.allowRequestHeaders = sails.config.security.cors.headers;
        delete sails.config.security.cors.headers;
      }

      // Deprecate `methods` in favor of `allowRequestMethods`
      if (!_.isUndefined(sails.config.security.cors.methods)) {
        sails.log.debug('The `sails.config.security.cors.methods` config has been deprecated.');
        sails.log.debug('Please use `sails.config.security.cors.allowRequestMethods` instead.\n');
        sails.config.security.cors.allowRequestMethods = sails.config.security.cors.methods;
        delete sails.config.security.cors.methods;
      }

      // Deprecate `sails.config.cors.exposeHeaders` in favor of `sails.config.cors.allowResponseHeaders`
      if (!_.isUndefined(sails.config.security.cors.exposeHeaders)) {
        sails.log.debug('The `sails.config.security.cors.exposeHeaders` config has been deprecated.');
        sails.log.debug('Please use `sails.config.security.cors.allowResponseHeaders` instead.\n');
        if (!sails.config.security.cors.allowResponseHeaders) {
          sails.config.security.cors.allowResponseHeaders = sails.config.security.cors.exposeHeaders;
        }
        delete sails.config.security.cors.exposeHeaders;
      }

      // Split up non-* strings into an array.
      // We'll complain about this later when we actually act on the route's CORS config
      // rather than just validating it.
      if (_.isString(sails.config.security.cors.allowOrigins) && sails.config.security.cors.allowOrigins !== '*') {
        sails.log.debug('When specifying multiple allowable CORS origins, the sails.config.security.cors.allowOrigins setting');
        sails.log.debug('should be an array of strings. We\'ll split it up for you this time...\n');
        sails.config.security.cors.allowOrigins = _.map(sails.config.security.cors.allowOrigins.split(','), function(origin){ return origin.trim(); });
      }
      // If `allowOrigins` is not `*` and not an array at this point, bail.
      else if (sails.config.security.cors.allowOrigins && sails.config.security.cors.allowOrigins !== '*' && !_.isArray(sails.config.security.cors.allowOrigins)) {
        throw flaverr({ name: 'userError', code: 'E_BAD_ORIGIN_CONFIG' }, new Error('Invalid global CORS settings: if `sails.config.security.cors.allowOrigins` is specified, it must be \'*\' or an array of strings.'));
      }

      // Validate the passed-in origins.
      // `checkOriginUrl` will throw if any origins are poorly-formed.
      if (_.isArray(sails.config.security.cors.allowOrigins)) {
        try {
          _.each(sails.config.security.cors.allowOrigins, function(origin) {
            checkOriginUrl(origin);
          });
        } catch (e) {
          // If we got a poorly-formed origin, throw a more descriptive error.
          if (e.code === 'E_INVALID') {
            throw flaverr({ name: 'userError', code: 'E_INVALID_SECURITY_CONFIG' }, new Error('Invalid global CORS `allowOrigins` setting: ' + e.message+'  (See http://sailsjs.com/config/security for help.)'));
          }
          // Otherwise just throw whatever error we got.
          throw e;
        }
      }

      // If the app attempts to set `allowOrigins: '*'` and `allowCredentials: true`, bail out
      if (sails.config.security.cors.allowOrigins === '*' && sails.config.security.cors.allowCredentials === true) {
        if (sails.config.security.cors.allowAnyOriginWithCredentialsUnsafe !== true) {
          throw flaverr({ name: 'userError', code: 'E_INVALID_SECURITY_CONFIG' }, new Error('Invalid global CORS settings: if `allowOrigins` is \'*\', `allowCredentials` cannot also be `true` (unless you enable the `allowAnyOriginWithCredentialsUnsafe` flag).  For more info, see http://sailsjs.com/config/security.'));
        }
        sails.config.security.cors.allowOrigins = true;
      }

      // If we're operating in unsafe mode, and origin is '*' and credentials is `true`,
      // set the default origin to `true` as well which means "reflect origin header".
      if (sails.config.security.cors.allowAnyOriginWithCredentialsUnsafe && sails.config.security.cors.credentials === true && sails.config.security.cors.allowOrigins === '*') {
        sails.config.security.cors.allowOrigins = true;
      }

      //  ┬─┐┌─┐┬ ┬┌┬┐┌─┐  ┌─┐┌─┐┌┐┌┌─┐┬┌─┐
      //  ├┬┘│ ││ │ │ ├┤   │  │ ││││├┤ ││ ┬
      //  ┴└─└─┘└─┘ ┴ └─┘  └─┘└─┘┘└┘└  ┴└─┘

      // Loop through all of the explicitly-configured routes and look for
      // deprecated config and/or fatal config issues.
      _.each(sails.config.routes, function(routeConfig, address) {

        // Get some info about the route, like its path and verb.
        // This is used in console messages.
        var routeInfo = detectVerb(address);
        var path = routeInfo.original.toLowerCase();
        var verb = routeInfo.verb.toLowerCase();

        // If this route doesn't have a CORS config, continue.
        if (!_.isPlainObject(routeConfig.cors)) { return; }

        // Get a reference to the route CORS config, so that we don't
        // accidentally mess with routeConfig instead.
        var routeCorsConfig = routeConfig.cors;

        // Handle deprecated config.
        // Deprecate `origin` in favor of `allowOrigins`
        if (!_.isUndefined(routeCorsConfig.origin)) {
          sails.log.debug('In route `' + ((verb ? (verb + ' ') : '') + path) + '`: ');
          sails.log.debug('The `cors.origin` config has been deprecated.');
          sails.log.debug('Please use `cors.allowOrigins` instead.');
          sails.log.debug('(See http://sailsjs.com/config/security for more info.)'+'\n');
          routeCorsConfig.allowOrigins = routeCorsConfig.origin;
          delete routeCorsConfig.origin;
        }

        // Deprecate `credentials` in favor of `allowCredentials`
        if (!_.isUndefined(routeCorsConfig.credentials)) {
          sails.log.debug('In route `' + ((verb ? (verb + ' ') : '') + path) + '`: ');
          sails.log.debug('The `cors.credentials` config has been deprecated.');
          sails.log.debug('Please use `cors.allowCredentials` instead.\n');
          routeCorsConfig.allowCredentials = routeCorsConfig.credentials;
          delete routeCorsConfig.credentials;
        }

        // Deprecate `headers` in favor of `allowRequestHeaders`
        if (!_.isUndefined(routeCorsConfig.headers)) {
          sails.log.debug('In route `' + ((verb ? (verb + ' ') : '') + path) + '`: ');
          sails.log.debug('The `cors.headers` config has been deprecated.');
          sails.log.debug('Please use `cors.allowRequestHeaders` instead.\n');
          routeCorsConfig.allowRequestHeaders = routeCorsConfig.headers;
          delete routeCorsConfig.headers;
        }

        // Deprecate `methods` in favor of `allowRequestMethods`
        if (!_.isUndefined(routeCorsConfig.methods)) {
          sails.log.debug('In route `' + ((verb ? (verb + ' ') : '') + path) + '`: ');
          sails.log.debug('The `cors.methods` config has been deprecated.');
          sails.log.debug('Please use `cors.allowRequestMethods` instead.\n');
          routeCorsConfig.allowRequestMethods = routeCorsConfig.methods;
          delete routeCorsConfig.methods;
        }

        // Deprecate `sails.config.cors.exposeHeaders` in favor of `sails.config.cors.allowResponseHeaders`
        if (!_.isUndefined(routeCorsConfig.exposeHeaders)) {
          sails.log.debug('In route `' + ((verb ? (verb + ' ') : '') + path) + '`: ');
          sails.log.debug('The `cors.exposeHeaders` config has been deprecated.');
          sails.log.debug('Please use `cors.allowResponseHeaders` instead.\n');
          if (!routeCorsConfig.allowResponseHeaders) {
            routeCorsConfig.allowResponseHeaders = routeCorsConfig.exposeHeaders;
          }
          delete routeCorsConfig.exposeHeaders;
        }

        // Apply the global CORS settings as defaults for the route CORS config.
        routeCorsConfig = _.defaults(routeCorsConfig, sails.config.security.cors);

        // Bail if `allowOrigins` is `*`, `allowCredentials` is `true` and `allowAnyOriginWithCredentialsUnsafe` is not true.
        if (routeCorsConfig.allowOrigins === '*' && routeCorsConfig.allowCredentials === true && routeCorsConfig.allowAnyOriginWithCredentialsUnsafe !== true) {
          throw flaverr({ name: 'userError', code: 'E_UNSAFE'}, new Error('Route `' + address + '` has invalid CORS settings: if `allowOrigins` is \'*\', `credentials` cannot be `true` unless `allowAnyOriginWithCredentialsUnsafe` is also true.'));
        }

        // Split up non-* strings into an array.
        if (_.isString(routeCorsConfig.allowOrigins) && routeCorsConfig.allowOrigins !== '*') {
          sails.log.debug('In route `' + ((verb ? (verb + ' ') : '') + path) + '`: ');
          sails.log.debug('When specifying multiple allowable CORS origins, the allowOrigins setting');
          sails.log.debug('should be an array of strings. We\'ll split it up for you this time...\n');
          routeCorsConfig.allowOrigins = _.map(routeCorsConfig.allowOrigins.split(','), function(origin){ return origin.trim(); });
        }
        // If `allowOrigins` is not `*` and not an array at this point, bail.
        else if (routeCorsConfig.allowOrigins && routeCorsConfig.allowOrigins !== '*' && !_.isArray(routeCorsConfig.allowOrigins)) {
          throw flaverr({ name: 'userError', code: 'E_BAD_ORIGIN_CONFIG'}, new Error('Route `' + address + '` has invalid CORS settings: if `allowOrigins` is specified, it must be \'*\' or an array of strings.'));
        }

        // If `allowOrigins` is an array, loop through and validate each origin.
        if (_.isArray(routeCorsConfig.allowOrigins)) {
          try {
            _.each(routeCorsConfig.allowOrigins, function(origin) {
              checkOriginUrl(origin);
            });
          }
          // If an error occurred validating an origin, forward it up the chain.
          catch (e) {
            // If it's an actual origin validation error, gussy it up first.
            if (e.code === 'E_INVALID') {
              throw flaverr({ name: 'userError', code: 'E_INVALID_ORIGIN'}, new Error('Route `' + address + '` has invalid CORS `allowOrigins` setting: ' + e.message));
            }
            // Otherwise just throw whatever error we got.
            throw e;
          }
        }

      });

    },

    initialize: function(cb) {

      try {
        initializeCors();
        initializeCsrf();
        return sails.hooks.security.registerActions(cb);
      }
      catch (err) {
        return cb(err);
      }

    },

    registerActions: function(cb) {

      // Add the csrf-token-granting action (see below for the function definition).
      sails.registerAction(grantCsrfToken, 'security/grant-csrf-token');

      return cb();

    }

  };

};
