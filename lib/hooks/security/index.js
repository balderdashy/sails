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

      // Deprecate `origin` in favor of `allowOrigins`
      if (sails.config.security.cors.origin) {
        sails.log.error('The `sails.config.security.cors.origin` config has been deprecated.');
        sails.log.error('Please use `sails.config.security.cors.allowOrigins` instead.\n');
        sails.config.security.cors.allowOrigins = sails.config.security.cors.origin;
        delete sails.config.security.cors.origin;
      }

      // Deprecate declaring `allowOrigins` as a string (except for '*').
      if (_.isString(sails.config.security.cors.allowOrigins) && sails.config.security.cors.allowOrigins !== '*') {
        sails.log.warn('When specifying multiple origins,');
        sails.log.warn('the `sails.config.security.cors.allowOrigins`setting');
        sails.log.warn('should be an array of strings.');
        sails.log.warn('We\'ll split it up for you this time...\n');
        sails.config.security.cors.allowOrigins = _.map(sails.config.security.cors.allowOrigins.split(','), function(origin){ return origin.trim(); });
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
        return cb();
      }
      catch (err) {
        return cb(err);
      }

    }

  };

};
