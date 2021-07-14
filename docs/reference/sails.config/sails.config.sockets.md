# `sails.config.sockets`

### What is this?
These configuration options provide transparent access to Socket.IO, the WebSocket/PubSub server encapsulated by Sails.

### Commonly used options

| Property      | Type       | Default  | Details |
|:--------------|------------|:---------|:--------|
| `adapter`      |((string))  |`'memory'`| The queue Socket.IO will use to deliver messages.  Can be set to either `'memory'` or `'@sailshq/socket.io-redis'`.  If `'@sailshq/socket.io-redis'` is specified, you should be sure `@sailshq/socket.io-redis` is amongst your app's dependencies. |
| `transports`  |((array))  | `['websocket']`     | An array of allowed transport strategies that Sails/Socket.IO will use when connecting clients.  This should _always_ match the [configuration in your socket client (i.e. `sails.io.js`)](https://sailsjs.com/documentation/reference/web-sockets/socket-client#?configuring-the-sailsiojs-library)&mdash;if you change transports here, you need to configure them there, and vice versa.<br/><br/> <em>Note that if you opt to modify the default transports, then you may need to do additional configuration in production.  (For example, if you add the `polling` transport, and your app is running on multiple servers behind a load balancer like Nginx, then you will need to configure that load balancer to support TCP sticky sessions.  However, that _should not_ be necessary out of the box with only the `websocket` transport enabled.)  See [Deployment > Scaling](https://sailsjs.com/documentation/concepts/deployment/scaling) for more tips and best practices.</em> |
| `onlyAllowOrigins` | ((array)) | `undefined` | Array of hosts (beginning with http:// or https://) from which sockets will be allowed to connect.  By default (i.e. while this is `undefined`) Sails/Socket.IO will allow sockets from _any_ origin to connect, which is useful for testing.  But in production mode, as of Sails v1.0, the framework forces you to configure this option to prevent [cross-site WebSocket hijacking (CSWSH) attacks](https://sailsjs.com/documentation/concepts/security/socket-hijacking).  Consequently, there's a conventional place to configure this setting in [config/env/production.js](https://sailsjs.com/documentation/anatomy/config/env/production-js), or using environment variables.  For example, if you plan on serving web pages from a local Node.js/Sails.js server running in production mode while testing, you&rsquo;ll probably want to add `http://localhost:1337` to this array.<br/><br/>Note that as the name implies (and in contrast to the similar [CORS setting](https://sailsjs.com/documentation/reference/configuration/sails-config-security-cors)), _only_ the origins listed will be allowed to connect.  Also note that this **setting is ignored** if a connecting socket doesn't declare an "origin" header in its upgrade request (e.g. a non-browser environment like a native iOS app, command-line script, or custom hardware).  And if you are using a pseudo-browser development platform like Electron, Ionic, React Native, or Cordova/PhoneGap, you'll need to determine what (if any) "origin" header your tool is attaching to initial socket connection requests.  For example, Ionic, Cordova, and PhoneGap all send `file://` as their origin.<br/><br/>Finally, note that if you want to override this behavior altogether with your own custom implementation, you can opt to use the `beforeConnect` setting instead.

### Redis configuration

 If you are configuring your Sails app for production and plan to [scale to more than one server](https://sailsjs.com/documentation/concepts/deployment/scaling), then you should set `sails.config.sockets.adapter` to `'@sailshq/socket.io-redis'`, set up your Redis instance, and then use the following config to point at it from your app:

| Property      | Type       | Default  | Details |
|:--------------|------------|:---------|:--------|
| `url`          | ((string)) | `undefined` | The connection URL for the Redis instance to connect to.  This may include one or more of the other settings below, e.g. `redis://:mypass@myredishost.com:1234/5` would indicate a `host` of `myredishost.com`, a `port` of `1234`, a `pass` of `mypass` and a `db` of `5`.  In general, you should use either `url` _or_ a combination of the settings below, to avoid confusion (the `url` setting will override all of the settings below).
| `db`           | ((number))  |`undefined`   | The index of the database to use within your redis instance.  If specified, must be an integer.  _(On most Redis setups, this will be a number between 0 and 15.)_
| `host`         |((string))  |`'127.0.0.1'` | Hostname of your Redis instance.
| `pass`         | ((string)) | `undefined` | Password for your Redis instance.
| `port`         |((number)) |`6379`   | Port of your Redis instance.


### Advanced configuration

These configuration options provide lower-level access to the underlying Socket.IO server settings for complete customizability.

| Property   | Type      | Default  | Details |
|:-----------|:---------:|:---------|:--------|
| `beforeConnect`|((boolean)), ((function)) | `undefined` | A function that runs every time a new client-side socket attempts to connect to the server, and which can be used to reject or allow the incoming connection.  Useful for tweaking your production environment to prevent [DoS](https://sailsjs.com/documentation/concepts/security/ddos) attacks or reject Socket.IO connections based on business-specific heuristics. See [beforeConnect](https://sailsjs.com/documentation/reference/configuration/sails-config-sockets#?beforeconnect) below for more info. |
| `afterDisconnect`| ((function)) | `undefined` | A function to run when a client-side socket disconnects from the server.  To define your own custom logic, specify a function like `afterDisconnect: function (session, socket, cb) {}`.
| `allowUpgrades` | ((boolean)) | `true` | This is a raw configuration option exposed from Engine.io.  It indicates whether to allow Socket.io clients to upgrade the transport that they are using (e.g. start with polling, then upgrade to a true WebSocket connection).  |
| `cookie` | ((string)), ((boolean)) | `false` | This is a raw configuration option exposed from Engine.io.  It indicates the name of the HTTP cookie that contains the connecting Socket.IO client's socket id.  The cookie will be set when responding to the initial Socket.IO "handshake".  Alternatively, may be set to `false` to disable the cookie altogether.  Note that the `sails.io.js` client does not rely on this cookie, so it is disabled (set to `false`) by default for enhanced security.  If you are using Socket.IO directly and need to re-enable this cookie, keep in mind that the conventional setting is `"io"`.  |
| `grant3rdPartyCookie` | ((boolean)) | `true` | Whether to expose a `GET /__getcookie` route that sets an HTTP-only session cookie.  By default, if it detects that it is about to connect to a cross-origin server, the Sails socket client (`sails.io.js`) sends a JSONP request to this endpoint before it begins connecting.  For user agents where 3rd party cookies are possible, this allows `sails.io.js` to connect the socket to the cross-origin Sails server using a user's existing session cookie, if they have one (for example, if they were already logged in). Without this, virtual requests you make from the socket will not be able to access the same session and will need to reauthenticate using some other mechanism.   |
| `maxHttpBufferSize` | ((number)) | `10E7` | This is a raw configuration option exposed from Engine.io.  It reflects the maximum number of bytes or characters in a message when polling before automatically closing the socket (to avoid [DoS]((https://sailsjs.com/documentation/concepts/security/ddos)). |
| `path`        | ((string)) | `/socket.io` | Path that client-side sockets should connect to on the server.  See http://socket.io/docs/server-api/#server(opts:object).
| `pingInterval` | ((number)) | `25000` | This is a raw configuration option exposed from Engine.io.  It reflects the number of milliseconds to wait between "ping packets" (this is what "heartbeats" has become, more or less).  |
| `pingTimeout` | ((number)) | `60000` | This is a raw configuration option exposed from Engine.io.  It reflects how many milliseconds without a pong packet to wait before considering a Socket.IO connection closed. |
| `sendResponseHeaders`|((boolean))  | `true`     | Whether to include response headers in the JWR (JSON WebSocket Response) originated for each socket request (e.g. `io.socket.get()` in the browser). This doesn't affect direct Socket.IO usage, unless you're communicating with Sails via the request interpreter (e.g. making normal calls with the sails.io.js browser SDK).  This can be useful for squeezing out more performance when tuning high-traffic apps, since it reduces total bandwidth usage.  However, as of Sails v0.10, response headers are trimmed whenever possible, so this option should almost never need to be used, even in extremely high-scale applications. |
| `serveClient`|((boolean))  | `false`     | Whether to serve the default Socket.IO client at `/socket.io/socket.io.js`.  Occasionally useful for advanced debugging. |
| `onRedisDisconnect` | ((function)) | `undefined` | An optional function for Sails to call if the Redis connection is dropped.  Useful for placing your site in a temporary maintenance mode or "panic mode" (see [sails-hook-panic-mode](https://www.npmjs.com/package/sails-hook-panic-mode) for an example).
| `onRedisReconnect` | ((function)) | `undefined` | An optional function for Sails to call if a previously-dropped Redis connection is restored (see `onDisconnect` above).

> Note: `onRedisDisconnect` and `onRedisReconnect` will only be called for Redis clients that are created by Sails for you; if you provide your own Redis clients (see below), these functions will _not_ be called automatically in the case of a disconnect or reconnect.

### `beforeConnect`

During development, when a socket tries to connect, Sails allows it every time (much in the same way any HTTP request is allowed to reach your routes). Then, in production, the `onlyAllowOrigins` array ensures that only incoming socket connections that originate from the base URLs on the whitelist will be permitted to connect to your app.

If your app needs more flexibility, as an additional precaution you can define your own custom logic to allow or deny socket connections.  To do so, specify a `beforeConnect` function:
```javascript
beforeConnect: function(handshake, proceed) {

  // Send back `true` to allow the socket to connect.
  // (Or send back `false` to reject the attempt.)
  return proceed(undefined, true);

},
```

> Note that if `beforeConnect` is used, then the `onlyAllowOrigins` setting will be ignored.  This allows you to accept socket connections from non-traditional clients (for example, in an [Electron app](electron.atom.io)) that may not set an `origin` header.

### Sockets & sessions

When client sockets connect to a Sails app, they authenticate using a session cookie by default (with the session hook enabled).  This allows Sails to associate the virtual requests made from the socket with an existing user session, similar to how normal HTTP requests work.

> A note for browser clients: The user's session cookie is NOT (and will never be) accessible from client-side JavaScript. Using HTTP-only cookies is crucial for your app's security.

##### Cross-origin sockets
The sails.io.js client is usually initiated from an HTML page that was already fetched via HTTP, which means that sockets connecting from this sort of browser environment will usually provide a valid session cookie automatically. As a result, everything will behave normally and `req.session` will be available.

However, in the case of cross-origin sockets, it is possible to receive a connection upgrade request _without a cookie_ (for certain transports, anyway).  In this case, there is no way to keep track of the requesting user between virtual requests, since there is no identifying information to link them with a session. The sails.io.js client solves this by sending an HTTP request to a CORS+JSONP endpoint first, in order to get a 3rd party cookie. This cookie is then used when opening the socket connection.

##### Non-browser clients
Similarly, if a socket connects _without_ providing a session cookie or provides a corrupted cookie, then a temporary, throwaway session entry will be created for it.  The same thing happens if the provided session cookie doesn't match any known session entry.

You can also configure sails.io.js to pass along an override for the session cookie in the form of a `?cookie` query parameter in the [url when connecting the socket](https://sailsjs.com/documentation/reference/web-sockets/socket-client/io-sails).  Sails will use this instead of the actual session cookie that may or may not have been sent in the initial connection upgrade request.  For example, if you were building a standalone Electron app, and you disabled `autoConnect` in favor of connecting a socket manually, you might do:

```javascript
var hotSocket = io.sails.connect('http://localhost:1337?cookie=smokeybear');
```

### Providing your own Redis clients

By default, Sails will create new Redis clients in the background when using the `@sailshq/socket.io-redis` adapter.  In some cases, you may instead need to create your own Redis clients for PubSub (typically using the <a href="https://www.npmjs.com/package/node-redis" target="_blank">node-redis</a> or <a href="https://www.npmjs.com/package/ioredis">ioredis</a> modules) and provide them to Sails for use in PubSub.  This often comes up when using a <a href="https://redis.io/topics/sentinel" target="_blank">Redis Sentinel</a> setup, which requires that clients connect using a module like <a href="https://www.npmjs.com/package/ioredis" target="_blank">ioredis</a>.  The following advanced configuration options allow you to pass already-connected Redis clients and related config info to Sails.

| Property   | Type      | Default  | Details |
|:-----------|:---------:|:---------|:--------|
| `pubClient` | ((ref))  | `undefined` | A custom Redis client used for _publishing_ on channels used by Socket.IO.  If unspecified, Sails will create a client for you. |
| `subClient` | ((ref)) | `undefined` | A custom Redis client used for _subscribing_ to channels used by Socket.IO.  If unspecified, Sails will create a client for you. |
| `adminPubClient`| ((ref)) | `undefined` | A custom Redis client for _publishing_ on the internal Sails admin bus, which allows for inter-server communication.  If you provide a client for `pubClient`, you'll likely need to provide a client for this setting as well.
| `adminSubClient`| ((ref)) | `undefined` | A custom Redis client for _subscribing_ to the internal Sails admin bus, which allows for inter-server communication.  If you provide a client for `subClient`, you'll likely need to provide a client for this setting as well.
| `subEvent` | ((string)) | `message` | The Redis client event name to subscribe to.  When using clients created with `ioredis`, you&rsquo;ll likely need to set this to `messageBuffer`. |


### Notes
> + In older versions of Sails (&lt;v0.11) and Socket.IO (&lt;v1.0), the `beforeConnect` setting was called `authorization`.


<docmeta name="displayName" value="sails.config.sockets">
<docmeta name="pageType" value="property">

