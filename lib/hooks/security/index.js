module.exports = function(sails) {

  /**
   * Module dependencies.
   */

  var _ = require('lodash');

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
          credentials: false,
          methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
          allowedHeaders: 'content-type',
          exposedHeaders: '',
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

      // Deprecate `headers` in favor of `allowedHeaders`
      if (sails.config.security.cors.headers) {
        sails.log.error('`sails.config.security.cors.headers` configuration is deprecated; please use `sails.config.security.cors.allowedHeaders` instead.');
        sails.config.security.cors.allowedHeaders = sails.config.security.cors.headers;
        delete sails.config.security.cors.headers;
      }

      // Deprecate `sails.config.cors.exposeHeaders` in favor of `sails.config.cors.exposedHeaders`
      if (sails.config.security.cors.exposeHeaders) {
        sails.log.error('`sails.config.security.cors.exposeHeaders` configuration is deprecated; please use `sails.config.security.cors.exposedHeaders` instead.');
        if (!sails.config.security.cors.exposedHeaders) {
          sails.config.security.cors.exposedHeaders = sails.config.security.cors.exposeHeaders;
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
