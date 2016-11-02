module.exports = function(sails) {

  /**
   * Module dependencies.
   */

  var _ = require('@sailshq/lodash');

  var initializeCors = require('./cors')(sails);
  var initializeCsrf = require('./csrf')(sails);

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
        sails.log.error('`sails.config.csrf` is deprecated; please use `sails.config.security.csrf` instead (we\'ll use your `sails.config.csrf` settings for now).');
        sails.config.security.csrf = sails.config.csrf;
      }

      if (sails.config.cors) {
        sails.log.error('`sails.config.cors` is deprecated; please use `sails.config.security.cors` instead (we\'ll use your `sails.config.cors` settings for now).');
        sails.config.security.cors = _.extend(sails.config.security.cors, sails.config.cors);
      }

      // Deprecate `origin` in favor of `allowOrigins`
      if (sails.config.security.cors.origin) {
        sails.log.error('`sails.config.security.cors.origin` configuration is deprecated; please use `sails.config.security.cors.allowOrigins` instead.');
        sails.config.security.cors.allowOrigins = sails.config.security.cors.origin;
        delete sails.config.security.cors.origin;
      }

      // Deprecate `credentials` in favor of `allowCredentials`
      if (sails.config.security.cors.credentials) {
        sails.log.error('`sails.config.security.cors.credentials` configuration is deprecated; please use `sails.config.security.cors.allowCredentials` instead.');
        sails.config.security.cors.allowCredentials = sails.config.security.cors.credentials;
        delete sails.config.security.cors.credentials;
      }

      // Deprecate `headers` in favor of `allowRequestHeaders`
      if (sails.config.security.cors.headers) {
        sails.log.error('`sails.config.security.cors.headers` configuration is deprecated; please use `sails.config.security.cors.allowRequestHeaders` instead.');
        sails.config.security.cors.allowRequestHeaders = sails.config.security.cors.headers;
        delete sails.config.security.cors.headers;
      }

      // Deprecate `methods` in favor of `allowRequestMethods`
      if (sails.config.security.cors.methods) {
        sails.log.error('`sails.config.security.cors.methods` configuration is deprecated; please use `sails.config.security.cors.allowRequestMethods` instead.');
        sails.config.security.cors.allowRequestMethods = sails.config.security.cors.methods;
        delete sails.config.security.cors.methods;
      }

      // Deprecate `sails.config.cors.exposeHeaders` in favor of `sails.config.cors.allowResponseHeaders`
      if (sails.config.security.cors.exposeHeaders) {
        sails.log.error('`sails.config.security.cors.exposeHeaders` configuration is deprecated; please use `sails.config.security.cors.allowResponseHeaders` instead.');
        if (!sails.config.security.cors.allowResponseHeaders) {
          sails.config.security.cors.allowResponseHeaders = sails.config.security.cors.exposeHeaders;
        }
        delete sails.config.security.cors.exposeHeaders;
      }

      // If we're operating in unsafe mode, and origin is '*' and credentials is `true`,
      // set the default origin to `true` as well which means "reflect origin header".
      if (sails.config.security.cors.allowAnyOriginWithCredentialsUnsafe && sails.config.security.cors.credentials === true && sails.config.security.cors.allowOrigins === '*') {
        sails.config.security.cors.allowOrigins = true;
      }

      // If the default origin is a string, turn it into an array by splitting on `,`.
      // This is important to do even when the origin is a single domain, because the
      // default behavior of the `cors` module in that situation is to expose the
      // configured origin, which is weird (the exception is when origin is '*').
      if (_.isString(sails.config.security.cors.allowOrigins) && sails.config.security.cors.allowOrigins !== '*') {
        sails.config.security.cors.allowOrigins = _.map(sails.config.security.cors.allowOrigins.split(','), function(origin){ return origin.trim(); });
      }

    },

    initialize: function(cb) {

      try {
        initializeCors();
        initializeCsrf();
        return cb();
      }
      catch (err) {
        return cb(err);
      }

    }

  };

};
