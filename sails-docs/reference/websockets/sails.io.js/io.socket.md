# `io.socket`

### Overview

When used in the browser, `sails.io.js` creates a global instance of the [SailsSocket](https://sailsjs.com/documentation/reference/web-sockets/socket-client/sails-socket) class as soon as it loads and attempts to connect it to the server after waiting one event loop cycle (to allow for configuration options to be changed).  As with any [SailsSocket](https://sailsjs.com/documentation/reference/web-sockets/socket-client/sails-socket), you can start using its properties and methods even before it connects to the server. Any requests or event bindings will be queued up and replayed once the connection is established.

### Configuration Options

Like any [SailsSocket](https://sailsjs.com/documentation/reference/web-sockets/socket-client/sails-socket) instance, `io.socket` is affected by the global [`io.sails`](https://sailsjs.com/documentation/reference/web-sockets/socket-client/io-sails) settings.  The `sails.io.js` library waits for one event loop cycle before attempting to connect `io.socket` to the server, giving you a chance to change any settings first.

##### Example

Changing the server that `io.socket` connects to

```html
<script type="text/javascript" src="/js/dependencies/sails.io.js"></script>
<script type="text/javascript">
io.sails.url = "http://somesailsapp.com";
</script>
```

### Properties

See the [SailsSocket properties reference](https://sailsjs.com/documentation/reference/web-sockets/socket-client/sails-socket/properties) for a full list of properties available on `io.socket`.

### Methods

For basic server communication and event listening methods, see the other `io.socket.*` pages in this section.  For advanced methods involving server connection, see the [SailsSocket advanced methods reference](https://sailsjs.com/documentation/reference/web-sockets/socket-client/sails-socket/methods).

<docmeta name="displayName" value="io.socket">
<docmeta name="pageType" value="property">
