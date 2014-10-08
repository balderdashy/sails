/**
 * Module dependencies
 */

var Err = require('../../../errors');


// TODO: use this again so we get a normalized error
// (currently it's not being used anywhere)


/**
 * Lookup a datastore/connection (e.g., `{ adapter: 'sails-disk' }`)
 * by name (e.g., 'devDB')
 *
 * @param {String}  connectionName
 *
 * @param {String}  modelID
 *          // Optional, improves quality of error messages
 *
 * @global  sails
 *      sails.config
 *      sails.config.connections {}
 *
 * @throws {Err.fatal}  __UnknownConnection__
 * @api private
 */

module.exports = function howto_lookupDatastore(sails){
  return function lookupDatastore(connectionName, modelID) {
    var connection = sails.config.connections[connectionName];

    // If this is not a known connection, throw a fatal error.
    if (!connection) {
      return Err.fatal.__UnknownConnection__(connectionName, modelID);
    }
    return connection;
  };
};
