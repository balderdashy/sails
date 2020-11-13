# assets/dependencies/sails.io.js


This file adds a few custom methods to socket.io which provide the "built-in" websockets functionality for Sails.

Specifically, those methods allow you to send and receive Socket.IO messages to and from Sails by simulating a REST client interface on top of Socket.IO. It models its API after the $.ajax pattern from jQuery which you might be familiar with.

See the [Socket client reference](https://sailsjs.com/documentation/reference/web-sockets/socket-client) for more info about using the methods that this file provides.

<docmeta name="displayName" value="sails.io.js">

