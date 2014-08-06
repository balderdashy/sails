/**
 * Module dependencies
 */

var path = require('path');
var fs = require('fs');
var Err = require('../../../../errors');


/**
 * Normalize properties of a datastore/connection
 * (handles deprecation warnings / validation errors and making types consistent)
 *
 * @param {Object}  connection
 *          connection.adapter  // Name of adapter module used by this connection
 *          connection.module // Deprecated- equivalent to `connection.adapter`
 *
 * @param {String}  modelID
 *          // Optional, improves quality of error messages
 *          // Identity of the model this connection came from
 *
 * @throws {Err.fatal}    __UnknownConnection__
 * @throws {Err.fatal}    __InvalidConnection__
 * @throws {Err.fatal}    __InvalidAdapter__
 * @api private
 */

module.exports = function howto_normalizeDatastore(sails){
  return function normalizeDatastore(connection, modelID) {

    // Connection specified has not been configured
    var connectionObject = sails.config.connections[connection];
    if (!connectionObject) return Err.fatal.__InvalidConnection__(connection, modelID);

    // Backwards compatibilty for `connection.module`
    if (connectionObject.module) {
      sails.log.verbose(
        'Deprecation warning :: In model `' + modelID + '`\'s `connection` config, ' +
        'replacing `module` with `adapter`....');
      connectionObject.adapter = connectionObject.module;
      delete connectionObject.module;
    }

    var moduleName = connectionObject.adapter;

    // Adapter is required for a connection
    if (!connectionObject.adapter) {
      // Invalid connection found, throw fatal error.
      return Err.fatal.__InvalidConnection__(connectionObject, modelID);
    }

    // Verify that referenced adapter has been loaded
    // If it doesn't, try and load it as a dependency from `node_modules`
    if (!sails.adapters[connectionObject.adapter]) {

      // (Format adapter name to make sure we make the best attempt we can)
      if (!moduleName.match(/^(sails-|waterline-)/)) {
        moduleName = 'sails-' + moduleName;
      }

      // Since it is unknown so far, try and load the adapter from `node_modules`
      sails.log.verbose('Loading adapter (', moduleName, ') for ' + modelID, ' from `node_modules` directory...');

      // Before trying to actually require the adapter, make sure we know the real module path:
      var node_modules = path.resolve(sails.config.appPath, 'node_modules');
      var modulePath = path.join(node_modules, moduleName);

      // Then make sure the module exists
      if (!fs.existsSync(modulePath)) {

        // If adapter doesn't exist, log an error and exit
        return Err.fatal.__UnknownAdapter__(connectionObject.adapter, modelID, sails.majorVersion, sails.minorVersion);
      }

      // Since the module seems to exist, try to require it from the appPath (execute the code)
      try {
        sails.adapters[moduleName] = require(modulePath);
      } catch (e) {
        return Err.fatal.__InvalidAdapter__(moduleName, e);
      }
    }

    // Defaults connection object to its adapter's defaults
    // TODO: pull this out into waterline core
    var itsAdapter = sails.adapters[connectionObject.adapter];
    connection = sails.util.merge({}, itsAdapter.defaults, connectionObject);

    // If the adapter has a `registerCollection` method, it must be a v0.9.x adapter
    if (itsAdapter.registerCollection) {
      sails.log.warn('The adapter `' + connectionObject.adapter + '` appears to be designed for an earlier version of Sails.');
      sails.log.warn('(it has a `registerCollection()` method.)');
      sails.log.warn('Since you\'re running Sails v0.10.x, it probably isn\'t going to work.');
      sails.log.warn('To attempt to install the updated version of this adapter, run:');
      sails.log.warn('npm install ' + connectionObject.adapter + '@0.10.x');
      return Err.fatal.__InvalidAdapter__(moduleName, 'Adapter is not compatible with the current version of Sails.');
    }


    // Success- connection normalized and validated
    // (any missing adapters were either acquired, or the loading process was stopped w/ a fatal error)
    return connection;
  };
};
