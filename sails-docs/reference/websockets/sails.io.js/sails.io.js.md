# Socket client (`sails.io.js`)

> This section of the docs is about the Sails socket client SDK for the browser.  It is written in JavaScript, and is also usable on the server.
>
> There are also a handful of community projects implementing Sails/Socket.IO clients for native iOS, Android, and Windows Phone.


### Overview

The Sails socket client ([`sails.io.js`](https://github.com/balderdashy/sails.io.js)) is a tiny browser library that is bundled by default in new Sails apps.  It is a lightweight wrapper that sits on top of the Socket.IO client and whose purpose is to make sending and receiving messages from your Sails backend as simple as possible.

The main responsibility of `sails.io.js` is to provide a familiar, Ajax-like interface for communicating with your Sails app using WebSockets/Socket.IO.  That basically means providing `.get()`, `.post()`, `.put()`, and `.delete()` methods that allow you take advantage of realtime features while still reusing the same backend routes you're using for the rest of your app.  In other words, running `io.socket.post('/user')` in your browser will be routed within your Sails app in exactly the same way as an HTTP POST request to the same route.


### Basic usage (browser)

In the browser, all that is required to use `sails.io.js` is to include the library in a `<SCRIPT>` tag.  Sails adds the library to the `assets/js/dependencies` folder of all new apps, so you can write:

```html
<!--
  This will import the sails.io.js library bundled in your Sails app by default.
  The bundled version embeds minified code for the Socket.io client as well.
  One tick of the event loop after importing this script, a new "eager" socket
  will automatically be created begin connecting unless you configure it not to.
-->
<script type="text/javascript" src="/js/dependencies/sails.io.js"></script>
```

and then use `io.socket` as a global variable in subsequent inline or external scripts.  For detailed instructions and examples of everyday usage, see [`io.socket`](https://sailsjs.com/documentation/reference/web-sockets/socket-client/io-socket).




### Basic usage (Node.js)

To use the Sails socket client SDK in a Node.js script, you will need to install and require both the `sails.io.js` and `socket.io-client` libraries:

```javascript
// Initialize the sails.io.js library with the socket.io-client module,
// which will automatically create and connect a new socket as io.socket
// unless you configure it not to.
var io = require('sails.io.js')( require('socket.io-client') );
```

See the [sails.io.js GitHub repo](https://github.com/balderdashy/sails.io.js) for more information on using the Sails socket client from Node.js.


### Configuring the `sails.io.js` library

> This section focuses on the most common runtime environment for the JavaScript socket client: the browser.  See the [`sails.io.js` GitHub repository](https://github.com/balderdashy/sails.io.js) for help configuring the socket client for use in a Node.js script.

There are two ways to configure Sails' socket client in the browser: using HTML attributes on the `<script>` tag or by programmatically modifying the `io.sails` object.

##### Basic configuration using HTML attributes

The easiest way to configure the four most common settings for the socket client (`autoConnect`, `environment`, `headers`, and `url`) is by sticking one or more HTML attributes on the script tag:

```html
<script src="/js/dependencies/sails.io.js"
  autoConnect="false"
  environment="production"
  headers='{ "x-csrf-token": "<%= typeof _csrf !== 'undefined' ? _csrf : '' %>" }'
></script>
```

This example will disable the eager socket connection, force the client environment to "production" (which disables logs), and set an `x-csrf-token` header that will be sent in every socket request (unless overridden).  Note that composite values like the `headers` dictionary are wrapped in a pair of _single-quotes_. That's because composite values specified this way must be _JSON-encoded_, meaning that their key names and value strings must be enclosed in double quotes (for a simlilar reason, the strings within the value string are enclosed in single quotes). 

Any configuration that can be provided as an HTML attribute can alternately be provided prefixed with `data-` (e.g. `data-autoConnect`, `data-environment`, `data-headers`, `data-url`).  This is for folks who need to support browsers that have issues with nonstandard HTML attributes (or if the idea of using nonstandard HTML attributes just creeps you out). If both the standard HTML attribute and the `data-` prefixed HTML attribute are provided, the latter takes precendence.


> **Note:**
> In order to use this approach for configuring the socket client, if you are using the default Grunt asset pipeline (which automatically injects script tags), you will need to remove `sails.io.js` from your `pipeline.js` file, and instead include an explicit `<script>` tag, which imports it.




##### Programmatic configuration using `io.sails`

As of Sails v0.12.x, only the most basic configuration options may be set using HTML attributes.  If you want to configure any of the other options not mentioned above, you will need to interact with `io.sails` programmatically.  Fortunately, the approach described above is really just a convenient shortcut for doing just that!  Heres how it works:

When you load it on the page in a `<script>` tag, the `sails.io.js` library waits for one cycle of the event loop before _automatically connecting_ a socket (if `io.sails.autoConnect` is enabled, [see below](https://sailsjs.com/documentation/reference/web-sockets/socket-client/io-sails#?autoconnect)).  This allows any properties that you specify on `io.sails` to be set before the socket begins connecting.  However, in order to ensure that the `io.sails` properties are read before connection, you should put the code setting those properties immediately after the `<script>` tag that includes `sails.io.js`:

```html
<script src="/js/dependencies/sails.io.js"></script>
<script type="text/javascript">
  io.sails.url = 'https://myapp.com';
</script>
<!-- ...other scripts... -->
```

Normally, the socket client always connects to the server where the script is being served.  The example above will cause the eager (auto-connecting) socket to attempt a (cross-domain) socket connection to the Sails server running at `https://myapp.com`, instead.

> **Note:**
> If you are using the default Grunt asset pipeline (which automatically injects script tags), it is a good idea to exclude `sails.io.js` from your `pipeline.js` file, instead explicitly adding a `<script>` tag for it.  This ensures that your configuration will be applied _before_ the "eager" auto-connecting socket begins connecting, since it means that the inline `<script>` tag you are using for programmatic configuration (setting `io.sails.url = 'https://myapp.com';`, for example) is executed _immediately after_ the socket client.




### Advanced usage

You can also create and connect client sockets manually using [`io.sails.connect`](https://sailsjs.com/documentation/reference/web-sockets/socket-client/io-sails#?the-connect-method).  This returns an instance of the `SailsSocket`. For more information about use cases that are less common and more advanced, such as connecting multiple sockets, see [SailsSocket](https://sailsjs.com/documentation/reference/web-sockets/socket-client/sails-socket).

##### Advanced configuration

The `sails.io.js` library and its individual client sockets have a handful of configuration options.  Global configuration lives in [`io.sails`](https://sailsjs.com/documentation/reference/web-sockets/socket-client/io-sails), which&mdash;among other things&mdash;allows you to disable the "eager" socket and default settings for new sockets.  Individual sockets can also be configured when they are manually connected&mdash;see [`io.sails.connect()`](https://sailsjs.com/documentation/reference/web-sockets/socket-client/io-sails#?the-connect-method) for more information on that.






### Frequently asked questions

##### Can I use this with XYZ front-end framework?

Yes.  The Sails socket client can be used to great effect with any front-end framework, whether it's Angular, React, Ember, Backbone, Knockout, jQuery, [FishBerry](https://mrsharpoblunto.github.io/foswig.js/), etc.


##### Do I have to use this?

No. The Sails socket client is extremely helpful when building realtime/chat features in a browser-based UI, but like the rest of the `assets/` directory, it is probably not particularly useful if you are building a [native Android app](https://stackoverflow.com/questions/25081188/sending-socket-request-from-client-ios-android-to-sails-js-server/25081189#25081189) or an API with no user interface at all.

Fortunately, like every other boilerplate file and folder in Sails, the socket client is completely optional. To remove it, just delete `assets/js/dependencies/sails.io.js`.


##### How does this work?

Under the hood, the socket client (`sails.io.js`) emits Socket.IO messages with reserved names that, when interpreted by Sails, are routed to the appropriate policies/controllers/etc. according to your app's routes and blueprint configuration.

##### How do I tell my Sails app _not_ to connect a socket with the current browser session?

By default, a socket connection will be linked to the current browser session (if any) using the `cookie` header that is sent with the initial socket handshake.  In order to turn off this behavior, add `nosession=true` to the [`query` property](https://sailsjs.com/documentation/reference/web-sockets/socket-client/sails-socket/properties#?advanced-properties) of the socket before it connects. For example:

```
<script src="/js/dependencies/sails.io.js"></script>
<script type="text/javascript">io.sails.query='nosession=true';</script>
```

##### Can I bypass this client and use Socket.IO directly?

It is possible to bypass the request interpreter in your Sails app and communicate with Socket.IO directly.  However, it is not reccommended, since it breaks the convention-over-configuration philosophy used elsewhere in the framework. The Sails socket client (`sails.io.js`) is unobtrusive:  it works by wrapping the native Socket.IO client and exposing a higher-level API that takes advantage of the virtual request interpreter in Sails to send simulated HTTP requests.  This makes your backend code more reusable, reduces the barrier to entry for developers new to using WebSockets/Socket.IO, and keeps your app easier to reason about.

> **Note:**
> In very rare circumstances (e.g. compatibility with an existing/legacy frontend using Socket.IO directly), bypassing the request interpreter is a _requirement_.  If you find yourself in this position, you can use the Socket.IO client, SDK, and then use `sails.io` on the backend to access the raw Socket.IO instance.  Please embark on this road only if you have extensive experience working directly with Socket.IO, and only if you have first reviewed the internals of the [`sockets` hook](https://github.com/balderdashy/sails-hook-sockets) (particularly the "admin bus" implementation, a Redis integration that sits on top of @sailshq/socket.io-redis and powers Sails's multi-server support for joining/leaving rooms).


<docmeta name="displayName" value="Socket client">

