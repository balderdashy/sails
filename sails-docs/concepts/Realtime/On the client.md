# Realtime communication between the client and the server

The easiest way to send a realtime message from a client to a Sails app is by using the [sails.io.js](https://sailsjs.com/documentation/reference/web-sockets/sails-io-js) library.  This library allows you to easily connect sockets to a running Sails app, and provides methods for making requests to [Sails routes](https://sailsjs.com/documentation/concepts/routes) that are handled in the same manner as a "regular" HTTP request.

The sails.io.js library is automatically added to the default [layout template](https://sailsjs.com/documentation/concepts/views/layouts) of new Sails apps using a `<script>` tag.  When a web page loads the `sails.io.js` script, it attempts to create a new [client socket](https://sailsjs.com/documentation/reference/web-sockets/socket-client/sails-socket) and connect it to the Sails app, exposing it as the global variable `io.socket`.

### Examples

Include the `sails.io.js` library, and make a request to the `/hello` route of a Sails app using the automatically-connected socket:

```html
<script type="text/javascript" src="/js/dependencies/sails.io.js"></script>
<script type="text/javascript">
io.socket.get('/hello', function responseFromServer (body, response) {
  console.log("The server responded with status " + response.statusCode + " and said: ", body);
});
</script>
```

Now consider this more advanced (and less common) use case: let's disable the eager (auto-connecting) socket, and instead create a new client socket manually.  When it successfully connects to the server, we'll make it log a message:
```html
<script type="text/javascript" src="/js/dependencies/sails.io.js" autoConnect="false"></script>
<script type="text/javascript">
var mySocket = io.sails.connect();
mySocket.on('connect', function onConnect () {
  console.log("Socket connected!");
});
</script>
```

### Socket requests vs traditional AJAX requests

You may have noticed that a client socket `.get()` is very similar to making an AJAX request, for example by using jQuery's `$.get()` method.  This is intentional&mdash;the goal is for you to be able to get the same response from Sails no matter where the request originated from.  The benefit to making the request using a client socket is that the [controller action](https://sailsjs.com/documentation/concepts/controllers#?actions) in your Sails app will have access to the socket which made the request, allowing it to _subscribe_ that socket to realtime notifications (see [sending realtime messages from the server](https://sailsjs.com/documentation/concepts/realtime/on-the-server)).

### Reference

* View the full [sails.io.js library](https://sailsjs.com/documentation/reference/web-sockets/socket-client) reference.
* See the [sails.sockets](https://sailsjs.com/documentation/reference/web-sockets/sails-sockets) reference to learn how to send messages from the server to connected sockets
* See the [resourceful pub-sub](https://sailsjs.com/documentation/reference/web-sockets/resourceful-pub-sub) reference to learn how to use Sails blueprints to automatically send realtime messages about changes to your [models](https://sailsjs.com/documentation/concepts/models-and-orm/models).
* Visit the [Socket.io](http://socket.io) website to learn more about the underlying library Sails uses for realtime communication

<docmeta name="displayName" value="On the client">
