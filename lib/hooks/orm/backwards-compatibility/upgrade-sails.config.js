/**
 * Module dependencies
 */

var _ = require('lodash');
var STRINGFILE = require('sails-stringfile');



module.exports = function (sails) {
  return function (config) {

    var logDeprecationNotice = function (configAdapter, configConnection, params) {
      STRINGFILE.logDeprecationNotice(
        configAdapter,
        STRINGFILE.get('links.docs.migrationGuide.connections'),
        sails.log.debug) &&
      STRINGFILE.logUpgradeNotice(
          STRINGFILE.get(configConnection), params, sails.log.debug);
    };
    //////////////////////////////////////////////////////////////////////////////////////////
    // Backwards compat. for `config.adapters`
    //////////////////////////////////////////////////////////////////////////////////////////

    // `config.adapters` is now `config.connections`
    if (config.adapters) {

      // `config.adapters.default` is being replaced with `config.models.connection`
      if (config.adapters['default']) {

        sails.after('lifted', function() {

          logDeprecationNotice(
            'config.adapters.default',
            'upgrade.config.models.connection',
            []
          );

        });

        config.models.connection = config.models.connection || config.adapters['default'];
      }

      // Merge `config.adapters` into `config.connections`
      sails.after('lifted', function() {

        logDeprecationNotice(
          'config.adapters',
          'upgrade.config.connections',
          []
        );

      });
      _.each(config.adapters, function(legacyAdapterConfig, connectionName) {

        // Ignore `default`
        // (it was a special case in Sails versions <= v0.10)
        if (connectionName === 'default') {
          return;
        }

        // Normalize `module` to `adapter`
        var connection = _.clone(legacyAdapterConfig);
        connection.adapter = connection.module;
        delete connection.module;

        sails.after('lifted', function() {

          logDeprecationNotice(
            'config.adapters.*.module',
            'upgrade.config.connections.*.adapter',
            [connectionName]
          );

        });
        config.connections[connectionName] = config.connections[connectionName] = connection;
      });

      // If there was default adapter in config.adapters, migrate it to be the default connection.
      if (config.adapters && config.adapters.default) {
        config.models.connection = config.adapters.default;
      }

      delete config.adapters;

    } // </if (config.adapters) >

    return config;
  };
};
