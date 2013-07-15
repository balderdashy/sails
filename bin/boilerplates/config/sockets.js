/**
 * Socket Configuration
 *
 * These configuration options provide transparent access to Sails' encapsulated
 * pubsub/socket server for complete customizability.
 *
 * For more information on using Sails with Sockets, check out:
 * http://sailsjs.org/#documentation
 */

module.exports.sockets = {

  // A array of allowed transport methods which the clients will try to use.
  // The flashsocket transport is disabled by default
  // You can enable flashsockets by adding 'flashsocket' to this list:
  transports: [
  'websocket',
  'htmlfile',
  'xhr-polling',
  'jsonp-polling'
 ],

  // The data store where socket.io will store its message queue 
  // and answer pubsub logic
  adapter: 'memory',




  // Node.js (and consequently Sails.js) apps scale horizontally.
  // It's a powerful, efficient approach, but it involves a tiny bit of planning.
  // At scale, you'll want to be able to copy your app onto multiple Sails.js servers
  // and throw them behind a load balancer.
  //
  // One of the big challenges of scaling an application is that these sorts of clustered 
  // deployments cannot share memory, since they are on physically different machines.
  // On top of that, there is no guarantee that a user will "stick" with the same server between
  // requests, since the load balancer will route each request to the server with the 
  // least impact on load. All pubsub processing and shared memory has to be offloaded
  // to a shared, remote messaging queue (usually Redis)
  //
  // Luckily, Sails provides production MQ support for Redis by default!

  // To enable a remote redis pubsub server: 
  // adapter: 'redis',

  // The IP address and configuration of your redis host:
  // (if left unset, Sails will try to connect to a redis via port 6379 on localhost)
  //
  // host: '127.0.0.1',
  // port: 6379,
  // db: 'sails',
  // pass: '<redis auth password>'



  // Match string representing the origins that are allowed to connect to the Socket.IO server
  origins: '*:*',

  // Should we use heartbeats to check the health of Socket.IO connections?
  heartbeats: true,

  // When client closes connection, the # of seconds to wait before attempting a reconnect.
  // This value is sent to the client after a successful handshake.
  'close timeout': 60,

  // The # of seconds between heartbeats sent from the client to the server
  // This value is sent to the client after a successful handshake.
  'heartbeat timeout': 60,

  // The max # of seconds to wait for an expcted heartbeat before declaring the pipe broken
  // This number should be less than the `heartbeat timeout`
  'heartbeat interval': 25,

  // The maximum duration of one HTTP poll-
  // if it exceeds this limit it will be closed.
  'polling duration': 20,

  // Enable the flash policy server if the flashsocket transport is enabled
  // 'flash policy server': true,

  // By default the Socket.IO client will check port 10843 on your server 
  // to see if flashsocket connections are allowed.
  // The Adobe Flash Player normally uses 843 as default port, 
  // but Socket.io defaults to a non root port (10843) by default
  //
  // If you are using a hosting provider that doesn't allow you to start servers
  // other than on port 80 or the provided port, and you still want to support flashsockets 
  // you can set the `flash policy port` to -1
  'flash policy port': 10843,

  // Used by the HTTP transports. The Socket.IO server buffers HTTP request bodies up to this limit. 
  // This limit is not applied to websocket or flashsockets.
  'destroy buffer size': '10E7',

  // Do we need to destroy non-socket.io upgrade requests?
  'destroy upgrade': true,

  // Should Sails/Socket.io serve the `socket.io.js` client? 
  // (as well as WebSocketMain.swf for Flash sockets, etc.)
  'browser client': true,

  // Cache the Socket.IO file generation in the memory of the process
  // to speed up the serving of the static files.
  'browser client cache': true,

  // Does Socket.IO need to send a minified build of the static client script?
  'browser client minification': false,

  // Does Socket.IO need to send an ETag header for the static requests?
  'browser client etag': false,

  // Adds a Cache-Control: private, x-gzip-ok="", max-age=31536000 header to static requests, 
  // but only if the file is requested with a version number like /socket.io/socket.io.v0.9.9.js.
  'browser client expires': 315360000,

  // Does Socket.IO need to GZIP the static files?
  // This process is only done once and the computed output is stored in memory. 
  // So we don't have to spawn a gzip process for each request.
  'browser client gzip': false,

  // Optional override function to serve all static files, 
  // including socket.io.js et al.
  // Of the form :: function (req, res) { /* serve files */ }
  'browser client handler': false,

  // Meant to be used when running socket.io behind a proxy. 
  // Should be set to true when you want the location handshake to match the protocol of the origin. 
  // This fixes issues with terminating the SSL in front of Node 
  // and forcing location to think it's wss instead of ws.
  'match origin protocol': false,

  // Global authorization for Socket.IO access, 
  // this is called when the initial handshake is performed with the server.
  // 
  // By default, Sails verifies that a valid cookie was sent with the upgrade request
  // However, in the case of cross-domain requests, no cookies are sent for some transports,
  // so sockets will fail to connect.  You might also just want to allow anyone to connect w/o a cookie!
  // 
  // To bypass this cookie check, you can set `authorization: false`,
  // which will silently create an anonymous cookie+session for the user
  // 
  // `authorization: true` indicates that Sails should use the built-in logic
  //
  // You can also use your own custom logic with:
  // `authorization: function (data, accept) { ... }`
  authorization: true,

  // Direct access to the socket.io MQ store config
  // The 'adapter' property is the preferred method
  // (`undefined` indicates that Sails should defer to the 'adapter' config)
  store: undefined,

  // A logger instance that is used to output log information.
  // (`undefined` indicates deferment to the main Sails log config)
  logger: undefined,

  // The amount of detail that the server should output to the logger.
  // (`undefined` indicates deferment to the main Sails log config)
  'log level': undefined,

  // Whether to color the log type when output to the logger.
  // (`undefined` indicates deferment to the main Sails log config)
  'log colors': undefined,

  // A Static instance that is used to serve the socket.io client and its dependencies.
  // (`undefined` indicates use default)
  'static': undefined,

  // The entry point where Socket.IO starts looking for incoming connections. 
  // This should be the same between the client and the server.
  resource: '/socket.io'

};