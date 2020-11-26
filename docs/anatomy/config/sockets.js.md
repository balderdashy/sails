# config/sockets.js

This is a configuration file that allows you to customize the way your app talks to clients over Socket.IO.

It provides transparent access to Sails' encapsulated pubsub/socket server for complete customizability. In it you can do things on the list below (and more!).

- Override afterDisconnect function (server side)
- Define custom authorization logic for client socket connections
- Set transport method
- Change Heartbeat Interval
- Change socket store

### More Info
> Socket.IO configuration options can be found [here](https://github.com/LearnBoost/Socket.IO/wiki/Configuring-Socket.IO).

### Usage

See [`sails.config.sockets`](https://sailsjs.com/documentation/reference/configuration/sails-config-sockets) for all available options.


<docmeta name="displayName" value="sockets.js">
