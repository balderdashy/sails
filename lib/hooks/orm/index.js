/**
 * Module dependencies.
 */

var _ = require('lodash');
var async = require('async');
var prompt = require('prompt');
var howto_loadAppModelsAndAdapters = require('./load-user-modules');
var howto_normalizeModelDef = require('./normalize-model');
var howto_buildORM = require('./build-orm');
var howto_backwardsCompatibleConfig = require('./backwards-compatibility/upgrade-sails.config');
var howto_backwardsCompatibleDatastore = require('./backwards-compatibility/upgrade-datastore');



module.exports = function(sails) {

  // Hydrate freeze-dried (context-free) modules using the sails app instance
  var loadAppModelsAndAdapters = howto_loadAppModelsAndAdapters(sails);
  var backwardsCompatibleConfig = howto_backwardsCompatibleConfig(sails);
  var normalizeModelDef = howto_normalizeModelDef(sails);
  var buildORM = howto_buildORM(sails);



  /**
   * Hook definition
   */

  var hook = {

    defaults: {

      globals: {
        adapters: true,
        models: true
      },

      // Default model properties
      models: {

        // This default connection (i.e. datasource) for the app
        // will be used for each model unless otherwise specified.
        connection: 'localDiskDb'
      },


      // Connections to data sources, web services, and external APIs.
      // Can be attached to models and/or accessed directly.
      connections: {

        // Built-in disk persistence
        // (by default, creates the file: `.tmp/localDiskDb.db`)
        localDiskDb: {
          adapter: 'sails-disk'
        }
      }
    },

    configure: function() {

      // Backwards compatibilty
      sails.config = backwardsCompatibleConfig(sails.config);

      // Listen for reload events
      sails.on('hook:orm:reload', hook.reload);

      // Listen for lower event, and tear down all of the adapters
      sails.once('lower', hook.teardown);
    },


    ////////////////////////////////////////////////////////////////////////////
    // NOTE: If a user hook needs to add or modify model definitions,
    // the hook should wait until `hook:orm:loaded`, then reload the original
    // model modules `orm/loadUserModules`. Finally, the ORM should be flushed using
    // `reload()` below.
    ////////////////////////////////////////////////////////////////////////////
    initialize: function(cb) {

      var backwardsCompatibleDatastore = howto_backwardsCompatibleDatastore(sails);

      async.auto({

        // Load model and adapter definitions defined in the project
        _loadModules: function (next) {
          loadAppModelsAndAdapters(next);
        },

        // Load any adapters for connections with "forceLoadAdapter"
        forceLoadAdapters: function(next) {
          _.each(sails.config.connections, function(connection, connectionId) {
            if (connection.forceLoadAdapter) {
              backwardsCompatibleDatastore(connectionId, '<FORCE>');
            }
          });
          return next();
        },

        // Normalize model definitions and merge in defaults from
        // `sails.config.models.*`
        normalizedModelDefs: ['_loadModules', function normalizeModelDefs(next) {
          _.each(sails.models, function (model, identity) {
            normalizeModelDef(model, identity);
          });
          next(null, sails.models);
        }],

        // Before continuing any further to actually start up the ORM,
        // check the migrate settings for each model to (1) use migrate:safe
        // in production and (2) prompt the user to make a decision if no migrate
        // configuration is present.
        _doubleCheckMigration: ['normalizedModelDefs', function (next) {

          // If there are no models, we're good
          if (!_.keys(sails.models).length) {
            return next();
          }

          // If a project-wide migrate setting (sails.config.models.migrate) is defined, we're good.
          if (typeof sails.config.models.migrate !== 'undefined') {
            return next();
          }

          // Otherwise show a prompt
          console.log('-----------------------------------------------------------------');
          console.log();
          prompt.start();
          console.log('',
            'Excuse my interruption, but it looks like this app'+'\n',
            'does not have a project-wide "migrate" setting configured yet.'+'\n',
            '(perhaps this is the first time you\'re lifting it with models?)'+'\n',
            '\n',
            'In short, this setting controls whether/how Sails will attempt to automatically'+'\n',
            'rebuild the tables/collections/sets/etc. in your database schema.\n',
            'You can read more about the "migrate" setting here:'+'\n',
            'http://sailsjs.org/#/documentation/concepts/ORM/model-settings.html?q=migrate\n'
            // 'command(⌘)+click to open links in the terminal'
          );
          console.log('',
            'In a production environment (NODE_ENV==="production") Sails always uses'+'\n',
            'migrate:"safe" to protect inadvertent deletion of your data.\n',
            'However during development, you have a few other options for convenience:'+'\n\n',
            '1. safe  - never auto-migrate my database(s). I will do it myself (by hand)','\n',
            '2. alter - auto-migrate, but attempt to keep my existing data (experimental)\n',
            '3. drop  - wipe/drop ALL my data and rebuild models every time I lift Sails\n'
          );
          console.log('What would you like Sails to do?');
          console.log();
          sails.log.info('To skip this prompt in the future, set `sails.config.models.migrate`.');
          sails.log.info('(conventionally, this is done in `config/models.js`)');
          console.log();
          sails.log.warn('** DO NOT CHOOSE "2" or "3" IF YOU ARE WORKING WITH PRODUCTION DATA **');
          console.log();
          prompt.get(['?'], function(err, result) {
            if (err) return next(err);
            result = result['?'];

            switch (result) {
              case 'alter':
              case '2':
                sails.config.models.migrate = 'alter';
                break;
              case 'drop':
              case '3':
                sails.config.models.migrate = 'drop';
                break;
              default:
                sails.config.models.migrate = 'safe';
                break;
            }

            console.log();
            console.log(' Temporarily using `sails.config.models.migrate="%s"...', sails.config.models.migrate);
            console.log(' (press CTRL+C to cancel-- continuing lift automatically in 0.5 seconds...)');
            console.log();
            setTimeout(function (){
              return next();
            },600);
          });

          // async.eachSeries(_.keys(sails.models), function (identity, nextModel) {
          //   // If migrate setting is defined, continue without doing anything else.
          //   if (typeof sails.models[identity].migrate !== 'undefined') {
          //     return nextModel();
          //   }

          //   // If migrate setting is not specififed on this model,
          //   // display a prompt and require the user to make a decision about
          //   // their migration strategy.
          //   var thisModel = sails.models[identity];

          // }, next);


        }],

        // Once all user model and adapter definitions are loaded
        // and normalized, go ahead and initialize the ORM, which
        // creates instantiated model objects and stuffs them in
        // sails.models.
        instantiatedCollections: ['_doubleCheckMigration', function (next, async_data) {
          buildORM(async_data.normalizedModelDefs, next);
        }]

      }, cb);
    },


    // Reload ORM hook
    // (which mostly just runs the hook's `initialize()` fn again)
    reload: function () {

      // Teardown all of the adapters, since initialize() will restart them
      hook.teardown(function() {
        hook.initialize(function(err) {
          if (err) {
            sails.log.error('Failed to reinitialize ORM.');
            sails.log.error(err);
            // TODO: emit "error" on app instance instead of throwing
            throw new Error(err);
          }
          else {
            // If the re-initialization was a success, trigger an event
            // in case something needs to respond to the ORM reload (e.g. pubsub hook)
            sails.emit('hook:orm:reloaded');
          }
        });
      });
    },


    // Teardown ORM hook
    teardown: function (cb) {
      cb = cb || function(err) {
        if (err) {
          sails.log.error('Failed to teardown ORM hook.');
          sails.log.error(err);
        }
      };
      async.forEach(Object.keys(sails.adapters || {}), function(name, next) {
        var adapter = sails.adapters[name];
        if (adapter.teardown) {
          adapter.teardown(null, next);
        } else {
          next();
        }
      }, cb);
    }
  };

  return hook;

};
