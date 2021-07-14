# SailsSocket

By default, [`sails.io.js`](https://sailsjs.com/documentation/reference/web-sockets/socket-client) automatically connects a single socket (`io.socket`) almost immediately after it loads.  This allows your client-side code to send socket requests to a particular Sails server and to receive events and data sent from that server.  For 99% of apps, this is all you need.

However, for certain advanced use cases (including automated tests), it can be helpful to connect additional sockets from the same instance of the socket client (e.g. browser tab).  For this reason, Sails exposes the `SailsSocket` class.


### Overview

The `sails.io.js` library works by wrapping low-level [Socket.io](http://socket.io) clients in instances of the `SailsSocket` class.  This class provides higher-level methods like [`.get()`](https://sailsjs.com/documentation/reference/web-sockets/socket-client/io-socket-get) and [`.post()`](https://sailsjs.com/documentation/reference/web-sockets/socket-client/io-socket-post) to your sockets, allowing you to communicate with your Sails app in a familiar way.


### Creating a SailsSocket instance

Any web page that loads the `sails.io.js` will create a new SailsSocket instance on page load unless [`io.sails.autoConnect`](https://sailsjs.com/documentation/reference/web-sockets/socket-client/io-sails#?autoconnect) is set to `false`.  This instance is then available as the global variable [`io.socket`](https://sailsjs.com/documentation/reference/web-sockets/socket-client/io-socket).

Additional SailsSocket instances can be created via calls to [`io.sails.connect`](https://sailsjs.com/documentation/reference/web-sockets/socket-client/io-sails#?the-connect-method):

```javascript
var newSailsSocket = io.sails.connect();
```


<docmeta name="displayName" value="SailsSocket">
<docmeta name="pageType" value="class">
