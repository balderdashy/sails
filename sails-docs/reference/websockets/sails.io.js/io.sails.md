# The `io.sails` object

### Overview

The `io.sails` object is the home of global configuration options for the `sails.io.js` library and any sockets it creates.  Most of the properties on `io.sails` are used as settings when connecting a client socket to the server or as top-level configuration for the client library itself.  `io.sails` also provides a `.connect()` method used for creating new socket connections manually.

See [Socket Client](https://sailsjs.com/documentation/reference/web-sockets/socket-client) for information about your different options for configuring `io.sails`.

### The `.connect()` method

If [`io.sails.autoConnect`](https://sailsjs.com/documentation/reference/web-sockets/socket-client/io-sails#?autoconnect) is `false`, or if you need to create more than one socket connection with the `sails.io.js` library, you do so via `io.sails.connect([url], [options])`.  Both arguments are optional, and the value of the `io.sails` properties (like `url`, `transports`, etc.) are used as defaults.  See the [SailsSocket properties reference](https://sailsjs.com/documentation/reference/web-sockets/socket-client/sails-socket/properties) for options.

### `io.sails.autoConnect`

When `io.sails.autoConnect` is set to `true` (the default setting), the library will wait one cycle of the event loop after loading and then attempt to create a new [`SailsSocket`](https://sailsjs.com/documentation/reference/web-sockets/socket-client/sails-socket) and connect it to the URL specified by `io.sails.url`.  When used in the browser, the new socket will be exposed as `io.socket`.  When used in a Node.js script, the new socket will be attached as the `socket` property of the variable used to initialize the `sails.io.js` library.

### `io.sails.reconnection`

When `io.sails.reconnection` is set to `true`, sockets will automatically (and continuously) attempt to reconnect to the server if they become disconnected unexpectedly (that is, _not_ as the result of a call to [`.disconnect()`](https://sailsjs.com/documentation/reference/web-sockets/socket-client/sails-socket/methods#?disconnect)).  If set to `false` (the default), no automatic reconnection attempt will be made.  Defaults to `false`.

### `io.sails.environment`

Use `io.sails.environment` to set an environment for `sails.io.js`, which affects how much information is logged to the console.  Valid values are `development` (full logs) and `production` (minimal logs).

### Other properties and defaults

The other properties of `io.sails` are used as defaults when creating new sockets (either the eager socket or via [`io.sails.connect()`](https://sailsjs.com/documentation/reference/web-sockets/socket-client/io-sails#?the-connect-method)).  See the [SailsSocket properties reference](https://sailsjs.com/documentation/reference/web-sockets/socket-client/sails-socket/properties) for a full list of available options, as well as a table of the default `io.sails` values.  Here are the most commonly used properties:

  Property          | Type       | Default   | Details
 :------------------ |----------|:--------- |:-------
 url                | ((string)) | Value of [`io.sails.url`](https://sailsjs.com/documentation/reference/web-sockets/socket-client/sails-socket/properties#?iosails-defaults) | The URL that the socket is connected to, or will attempt to connect to.
 transports         | ((array))  | Value of [`io.sails.transports`](https://sailsjs.com/documentation/reference/web-sockets/socket-client/sails-socket/properties#?iosails-defaults) | The transports that the socket will attempt to connect using.  Transports will be tried in order, with upgrades allowed: that is, if you list both "polling" and "websocket", then after establishing a long-polling connection the server will attempt to upgrade it to a websocket connection.  This setting should match the value of `sails.config.sockets.transports` in your Sails app.
 headers   | ((dictionary)) | Value of [`io.sails.headers`](https://sailsjs.com/documentation/reference/web-sockets/socket-client/sails-socket/properties#?iosails-defaults) | Dictionary of headers to be sent by default with every request from this socket.  Can be overridden via the `headers` option in [`.request()`](https://sailsjs.com/documentation/reference/web-sockets/socket-client/io-socket-request).




<docmeta name="displayName" value="io.sails">
<docmeta name="pageType" value="property">
