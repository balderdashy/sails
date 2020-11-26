# WebSockets

For a full discussion of realtime concepts in Sails, see the [Realtime concept documentation](https://sailsjs.com/documentation/concepts/realtime).

For information on client-to-server socket communication, see the [Socket Client (sails.io.js)](https://sailsjs.com/documentation/reference/web-sockets/socket-client).

For information on server-to-client socket communication, see the [sails.sockets](https://sailsjs.com/documentation/reference/web-sockets/sails-sockets).

For information on using realtime messages to communicate changes in Sails models, see the [Resourceful PubSub reference](https://sailsjs.com/documentation/reference/web-sockets/resourceful-pub-sub).

Sails uses [socket.io](http://socket.io) as the underlying engine for realtime communication.  Every Sails app has a Socket.IO instance available as `sails.io`.  However, most `socket.io` functionality is wrapped for convenience (and safety) by a `sails.sockets` method.

<docmeta name="displayName" value="WebSockets">

