/**
 * Module dependencies.
 */
var flaverr = require('flaverr');
var _ = require('@sailshq/lodash');

/**
 * ensureRedisConnection()
 *
 * Ensure that a connection has been made to the Redis server specified in the session
 * config, or else return an error that will cause the hook (and Sails lift) to fail.
 *
 * @param  {sailsApp}   app The current Sails app
 * @param  {Function} cb  Callback to call when the connection is established, or determined to have failed.
 */

module.exports = function ensureRedisConnection(app, cb) {

  // Future-proof by ensuring that there is a client object, and that it is an event emitter.
  // If not, we'll continue, but warn that we can't be sure that the session is really there.
  if (!app.config.session.store.client || !(app.config.session.store.client instanceof require('events').EventEmitter)) {

    app.log.debug('The version of connect-redis used does not have a `client` property that is an event emitter.');
    app.log.debug('It is therefore not possible to determine whether Redis is actually running.');
    app.log.debug('Continuing on, but be aware that the session store might not be online!\n');

    return cb();

  }

  // If the client is already connected (because it was provided in the config)
  // then just continue.
  if (app.config.session.store.client.connected) {return cb();}

  // Get a reference to the session store client, for use with the event handlers below.
  var client = app.config.session.store.client;

  // Declare a var to hold the Redis connection timeout identifier, so it can be cleared later.
  var redisConnectionTimeout;

  // Adapted from machinepack-redis/get-connection
  // https://github.com/treelinehq/machinepack-redis/blob/f4dc7087df27694d5c723784e99a116213d4910e/machines/get-connection.js#L98
  ////////////////////////////////////////////////////////////////////////
  //
  // These two functions (`onPreConnectionError`, `onPreConnectionEnd`)
  // have to be defined ahead of time (otherwise, they are not in scope
  // from within each other's implementations; and so cannot be used as
  // the second argument to `removeListener()`)
  var redisConnectionError;
  function onPreConnectionError (err){
    redisConnectionError = err;
  }
  function onPreConnectionEnd(){
    clearTimeout(redisConnectionTimeout);
    client.removeListener('end', onPreConnectionEnd);
    client.removeListener('error', onPreConnectionError);

    // Prevent automatic reconnection attempts.
    client.end(true);

    var redisError = redisConnectionError || new Error('Redis client fired "end" event before it finished connecting.');
    return cb(flaverr('E_REDIS_CONNECTION_FAILED', new Error('Sails could not connect to the specified Redis session server.\n' + redisError.stack)));
  }

  // Add a timeout for the initial Redis session connection.
  redisConnectionTimeout = setTimeout(function() {
    // If Sails is already exiting when the timeout fires, just ignore it.
    if (sails._exiting) {return;}
    return cb(flaverr('E_REDIS_CONNECTION_TIMED_OUT', new Error('Sails took too long to connect to the specified Redis session server.\nYou can change the allowed connection time by setting `sails.config.session.timeout` (currently ' + app.config.session.timeout + 'ms).')));
  }, app.config.session.timeout || 15000);


  ////////////////////////////////////////////////////////////////////////

  // Bind an "error" listener so that we can track errors that occur
  // during the connection process.
  client.on('error', onPreConnectionError);

  // Bind an "end" listener in case the client "ends" before
  // it successfully connects...
  client.on('end', onPreConnectionEnd);

  // Bind a "ready" listener so that we know when the client has connected.
  client.once('ready', function onConnectionReady(){
    // Remove the pre-connection handlers.
    clearTimeout(redisConnectionTimeout);
    client.removeListener('end', onPreConnectionEnd);
    client.removeListener('error', onPreConnectionError);
    // Add a new "end" handler.
    client.on('end', function(){
      if (_.isFunction(app.config.session.onRedisDisconnect)) {
        app.config.session.onRedisDisconnect();
      }
      app.log.error('Redis session server went off-line...');
    });
    // Add a new "error" handler.
    client.on('error', function(err){app.log.verbose('Redis session server reported error: ', err.stack);});
    // Add a new "ready" handler that will be triggered on a reconnect.
    client.on('ready', function(err){
      if (_.isFunction(app.config.session.onRedisReconnect)) {
        app.config.session.onRedisReconnect();
      }
      app.log.error('Redis session server came back on-line...');
    });

    // When Sails is lowering, disconnect the Redis client so that the process doesn't hang.
    app.after('lower', function() {
      client.end(true);
    });

    return cb();
  });

};
