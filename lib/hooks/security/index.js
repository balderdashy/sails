module.exports = function(sails) {

  /**
   * Module dependencies.
   */

  var _ = require('@sailshq/lodash');

  var checkOriginUrl = require('../../util/check-origin-url');

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

      if (sails.config.csrf) {
        sails.log.error('The `sails.config.csrf` config has been deprecated.');
        sails.log.error('Please use `sails.config.security.csrf` instead.');
        sails.log.error('(we\'ll use your `sails.config.csrf` settings for now).\n');
        sails.config.security.csrf = sails.config.csrf;
      }

      if (sails.config.cors) {
        sails.log.error('The `sails.config.cors` config has been deprecated.');
        sails.log.error('Please use `sails.config.security.cors` instead.');
        sails.log.error('(we\'ll use your `sails.config.cors` settings for now).\n');
        sails.config.security.cors = _.extend(sails.config.security.cors, sails.config.cors);
      }

      // Fail to lift if `securityLevel` is used
      if (sails.config.security.cors.securityLevel) {
        throw new Error(
                        '\n-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-\n'+
                        'Invalid global CORS settings: `securityLevel` is no longer supported as of Sails v1.0.\n'+
                        'Instead, to secure your socket requests use `sails.config.sockets.onlyAllowOrigins`.\n'+
                        'For more info see: http://sailsjs.com/config/sockets.\n'+
                        '-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-\n'
                       );
      }

      // Deprecate `origin` in favor of `allowOrigins`
      if (sails.config.security.cors.origin) {
        sails.log.error('The `sails.config.security.cors.origin` config has been deprecated.');
        sails.log.error('Please use `sails.config.security.cors.allowOrigins` instead.\n');
        sails.config.security.cors.allowOrigins = sails.config.security.cors.origin;
        delete sails.config.security.cors.origin;
      }

      // Deprecate declaring `allowOrigins` as a string (except for '*').
      if (_.isString(sails.config.security.cors.allowOrigins) && sails.config.security.cors.allowOrigins !== '*') {
        sails.log.warn('When specifying multiple origins, the `sails.config.security.cors.allowOrigins`');
        sails.log.warn('setting should be an array of strings. We\'ll split it up for you this time...\n');
        sails.config.security.cors.allowOrigins = _.map(sails.config.security.cors.allowOrigins.split(','), function(origin){ return origin.trim(); });
      }

      // Bail out if `allowOrigins` is not an array or `*`.
      else if (!_.isUndefined(sails.config.security.cors.allowOrigins) && sails.config.security.cors.allowOrigins !== '*' && !_.isArray(sails.config.security.cors.allowOrigins)) {
        throw new Error('Invalid global CORS settings: if `allowOrigins` is specified, it must be \'*\' or an array of strings.');
      }

      // Deprecate `credentials` in favor of `allowCredentials`
      if (sails.config.security.cors.credentials) {
        sails.log.error('The `sails.config.security.cors.credentials` config has been deprecated.');
        sails.log.error('Please use `sails.config.security.cors.allowCredentials` instead.\n');
        sails.config.security.cors.allowCredentials = sails.config.security.cors.credentials;
        delete sails.config.security.cors.credentials;
      }

      // Deprecate `headers` in favor of `allowRequestHeaders`
      if (sails.config.security.cors.headers) {
        sails.log.error('The `sails.config.security.cors.headers` config has been deprecated');
        sails.log.error('Please use `sails.config.security.cors.allowRequestHeaders` instead.\n');
        sails.config.security.cors.allowRequestHeaders = sails.config.security.cors.headers;
        delete sails.config.security.cors.headers;
      }

      // Deprecate `methods` in favor of `allowRequestMethods`
      if (sails.config.security.cors.methods) {
        sails.log.error('The `sails.config.security.cors.methods` config has been deprecated');
        sails.log.error('Please use `sails.config.security.cors.allowRequestMethods` instead.\n');
        sails.config.security.cors.allowRequestMethods = sails.config.security.cors.methods;
        delete sails.config.security.cors.methods;
      }

      // Deprecate `sails.config.cors.exposeHeaders` in favor of `sails.config.cors.allowResponseHeaders`
      if (sails.config.security.cors.exposeHeaders) {
        sails.log.error('The `sails.config.security.cors.exposeHeaders` config has been deprecated');
        sails.log.error('Please use `sails.config.security.cors.allowResponseHeaders` instead.\n');
        if (!sails.config.security.cors.allowResponseHeaders) {
          sails.config.security.cors.allowResponseHeaders = sails.config.security.cors.exposeHeaders;
        }
        delete sails.config.security.cors.exposeHeaders;
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
            throw new Error('Invalid global CORS `allowOrigins` setting: ' + e.message);
          }
          // Otherwise just throw whatever error we got.
          throw e;
        }
      }

      // If we're operating in unsafe mode, and origin is '*' and credentials is `true`,
      // set the default origin to `true` as well which means "reflect origin header".
      if (sails.config.security.cors.allowAnyOriginWithCredentialsUnsafe && sails.config.security.cors.credentials === true && sails.config.security.cors.allowOrigins === '*') {
        sails.config.security.cors.allowOrigins = true;
      }

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
