module.exports = function(sails) {


  /**
   * Module dependencies.
   */

  var loadSocketIO = require('./loadSocketIO')(sails);



  /**
   * Expose `sockets` hook definition
   */

  return {

    defaults: {

      // Self-awareness: the host the server *thinks it is*
      // host: 'localhost',

      // Port to run this app on
      port: 1337,

      // Users' SSL cert settings end up here
      ssl: {},

      // Socket.io configuration
      sockets: {

        // Whether to run code which supports legacy usage for connected
        // sockets running the v0.9 version of the socket client SDK (i.e. sails.io.js).
        // Disabled in newly generated projects, but enabled as an implicit default.
        'backwardsCompatibilityFor0.9SocketClients': true,

        // Whether to expose a 'get /__getcookie' route with CORS support
        // that sets a cookie (this is used by the sails.io.js socket client
        // to get access to a 3rd party cookie and to enable sessions).
        //
        // Warning: Currently in this scenario, CORS settings apply to interpreted
        // requests sent via a socket.io connetion that used this cookie to connect,
        // even for non-browser clients! (e.g. iOS apps, toasters, node.js unit tests)
        grant3rdPartyCookie: true,

        // Whether to send various aspects of an emulated HTTP response
        // down in the JWR originated from each socket request.
        // (doesn't affect direct socket.io usage-- only if you're using
        // the Sails SDK and therefore the request interpreter)
        sendResponseHeaders: true,
        sendStatusCode: true,

        // Default  behavior is a noop
        // Code to run when a new socket connects
        onConnect: function (session, socket) {},

        // Default behavior is a noop
        // Code to run when a socket disconnects
        onDisconnect: function (session, socket) {},

        // Setup adapter to use for socket.io MQ (pubsub) store
        // (`undefined` indicates default memory store)
        // NOTE: Default memory store will not work for clustered deployments with multiple instances.
        adapter: undefined,

        // A array of allowed transport methods which the clients will try to use.
        // The flashsocket transport is disabled by default
        // You can enable flashsockets by adding 'flashsocket' to this list:
        transports: [
          'websocket',
          'htmlfile',
          'xhr-polling',
          'jsonp-polling'
        ],

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
        'flash policy server': false,

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

        // Does Socket.IO need to serve the static resources like socket.io.js and WebSocketMain.swf etc.
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

        // A function that should serve all static handling, including socket.io.js et al.
        'browser client handler': false,

        // Meant to be used when running socket.io behind a proxy.
        // Should be set to true when you want the location handshake to match the protocol of the origin.
        // This fixes issues with terminating the SSL in front of Node
        // and forcing location to think it's wss instead of ws.
        'match origin protocol' : false,

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
        authorization: false,

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

      }
    },


    configure: function () {
      // onConnect must be valid function
      if (sails.config.sockets.onConnect && typeof sails.config.sockets.onConnect !== 'function') {
        throw new Error('Invalid `sails.config.sockets.onConnect`!  Must be a function.');
      }

      // If one piece of the ssl config is specified, ensure the other required piece is there
      if ( sails.config.ssl && (
          sails.config.ssl.cert && !sails.config.ssl.key
        ) || (
          !sails.config.ssl.cert && sails.config.ssl.key
        )
      ) {
        throw new Error('Invalid SSL config object!  Must include cert and key!');
      }
    },


    /**
     * Initialize is fired first thing when the hook is loaded
     *
     * @api public
     */

    initialize: function(cb) {

      if (sails.config.hooks.http) {

        // If http hook is enabled, wait until the http server is configured
        // before linking the socket server to it
        sails.after('hook:http:loaded', function () {
          sails.after('hook:session:loaded', function () {
            loadSocketIO(cb);
          });
        });

      }
      else {

        // TODO: implement standalone socket server usage
        var notImplementedError =
          'Socket server cannot be started without HTTP server because the feature ' +
          'has not been implemented yet!\n' +
          'For now, please reenable the `http` hook.';
        sails.log.error(notImplementedError);
        throw new Error(notImplementedError);

        // If not, configure the socket server immediately
        // loadSocketIO(cb);

        // // TODO: Start independent socket server as soon as sails is ready
        // sails.on('ready', function () {
        //  // TODO
        // });
      }

    },

    routes: {

      before: {

        'all /*': function addOriginHeader (req, res, next) {
          if (req.isSocket) {
            req.headers = req.headers || {};
            req.headers.origin = req.socket.handshake && req.socket.handshake.headers && req.socket.handshake.headers.origin;
          }
          return next();
        },

        'get /firehose': function firehose (req, res) {
          if (!req.isSocket) {
            sails.log.error("Cannot subscribe to firehose over HTTP!  Firehose is for socket messages only.");
            return;
          }
          if (process.env.NODE_ENV !== 'development') {
            sails.log.warn('Warning: A client socket was just subscribed to the firehose, but the environment is set to `'+process.env.NODE_ENV+'`.'+
              ' Firehose messages are only delivered in the development environment.');
          }
          sails.log.silly("A client socket was just subscribed to the firehose.");
          sails.sockets.subscribeToFirehose(req.socket);
          res.send(200);
        }
      },

      after: {

        'get /__getcookie': function sendCookie (req, res, next) {

          // Allow this endpoint to be disabled by setting:
          // sails.config.sockets.grant3rdPartyCookie = false;
          if ( !sails.config.sockets.grant3rdPartyCookie ) {
            return next();
          }

          res.send('_sailsIoJSConnect();');
        }

      }

    }
  };

};
