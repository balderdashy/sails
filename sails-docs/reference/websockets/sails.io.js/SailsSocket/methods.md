# SailsSocket methods

This section describes the methods available on each SailsSocket instance.  Most of these methods can be called before the socket even connects to the server.  In the case of request methods like `.get()` and `.request()`, calls will be queued up until the socket connects, at which time they will be executed in order.

### Basic methods

The most common methods you will use with a SailsSocket instance are documented in the main Socket Client reference section.  These include [`.get()`](https://sailsjs.com/documentation/reference/web-sockets/socket-client/io-socket-get), [`.put()`](https://sailsjs.com/documentation/reference/web-sockets/socket-client/io-socket-put), [`.post()`](https://sailsjs.com/documentation/reference/web-sockets/socket-client/io-socket-post), [`.delete()`](https://sailsjs.com/documentation/reference/web-sockets/socket-client/io-socket-delete), [`.request()`](https://sailsjs.com/documentation/reference/web-sockets/socket-client/io-socket-request), [`.on()`](https://sailsjs.com/documentation/reference/web-sockets/socket-client/io-socket-on) and [`.off()`](https://sailsjs.com/documentation/reference/web-sockets/socket-client/io-socket-off).

### Advanced methods

In addition to the basic communication and event-listening methods, each SailsSocket instance (including `io.socket`) exposes several methods for dealing with server connections.

##### `.isConnected()`

Determines whether the SailsSocket instance is currently connected to a server; returns `true` if a connection has been established.

```js
io.socket.isConnected();
```

##### `.isConnecting()`

Determines whether the SailsSocket instance is currently in the process of connecting to a server; returns `true` if a connection is being attempted.

```js
io.socket.isConnecting();
```


##### `.mightBeAboutToAutoConnect()`

Detects when the SailsSocket instance has already loaded but is not yet fully configured or has not attempted to autoconnect. 

The `sails.io.js` library waits one tick of the event loop before checking whether [`autoConnect`](https://sailsjs.com/documentation/reference/web-sockets/socket-client/io-sails#?iosailsautoconnect) is enabled and, if so, trying to connect.  This allows you to configure the `SailsSocket` instance (for example, by setting `io.sails.url`) before an attempt is made to estabilish a connection.  The `mightBeAboutToAutoConnect()` method returns `true` in the situation where `sails.io.js` has loaded, but the requisite tick of the event loop has not yet elapsed.

```js
io.socket.mightBeAboutToAutoConnect();
```

##### `.disconnect()`

Disconnects a SailsSocket instance from the server; throws an error if the socket is already disconnected.

```js
io.socket.disconnect();
```

##### `.reconnect()`

Reconnects a SailsSocket instance to a server after it's been disconnected (either involuntarily or via a call to [`.disconnect()`](https://sailsjs.com/documentation/reference/web-sockets/socket-client/sails-socket/methods#?disconnect)).  The instance connects using its currently configured [properties](https://sailsjs.com/documentation/reference/web-sockets/socket-client/sails-socket/properties).  `.reconnect()` throws an error if the socket is already connected to a server.

```js
io.socket.reconnect();
```

> When an instance is in a disconnected state, its properties may be changed. This means that an instance that has been disconnected from one server can be reconnected to another without losing its event bindings or queued requests.


##### `.removeAllListeners()`

Stops listening for any server-related events on a SailsSocket instance, including `connect` and `disconnect`.

```js
io.socket.removeAllListeners();
```



<docmeta name="displayName" value="Methods">

