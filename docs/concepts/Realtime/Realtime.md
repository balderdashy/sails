# Realtime communication (aka Sockets)

### Overview

Sails apps are capable of full-duplex, realtime communication between the client and server.  This means that a client (e.g. browser tab, Raspberry Pi, etc.) can maintain a persistent connection to a Sails backend, and messages can be sent from client to server (e.g. AJAX) or from server to client (e.g. "comet") at any time.  Two common uses of realtime communication are live chat implementations and multiplayer games.  Sails implements realtime on the server using the [socket.io](http://socket.io) library, and on the client using the [sails.io.js](https://sailsjs.com/documentation/reference/web-sockets/socket-client/io-socket-on) library.  Throughout the Sails documentation, the terms **socket** and **websocket** are commonly used to refer to a two-way, persistent communication channel between a Sails app and a client.

Communicating with a Sails app via sockets is similar to using AJAX, in that both methods allow a web page to interact with the server without refreshing.  However, sockets differ from AJAX in two important ways: first, a socket can stay connected to the server for as long as the web page is open, allowing it to maintain _state_ (AJAX requests, like all HTTP requests, are _stateless_).  Second, because of the always-on nature of the connection, a Sails app can send data down to a socket at any time (hence the "realtime" moniker), whereas AJAX only allows the server to respond when a request is made.


### Realtime model updates with resourceful pub-sub

Sockets making requests to Sails' [blueprint actions](https://sailsjs.com/documentation/reference/blueprint-api) are automatically subscribed to realtime messages about the models they retrieve via the [resourceful pub-sub API](https://sailsjs.com/documentation/reference/web-sockets/resourceful-pub-sub).  You can also use this API in your custom controller actions to send out messages to clients interested in certain models.

##### Example

Connect a client-side socket to the server, subscribe to the `user` event, and request `/user` to subscribe to current and future User model instances.

```html
<!-- Simply include the sails.io.js script, and a client socket will be created for you -->
<script type="text/javascript" src="/js/dependencies/sails.io.js"></script>
<script type="text/javascript">
// The automatically-created socket is exposed as io.socket.
// Use .on() to subscribe to the 'user' event on the client.
// This event is sent by the Sails "create", "update",
// "delete", "add" and "remove" blueprints to any socket that
// is subscribed to one or more User model instances.
io.socket.on('user', function gotHelloMessage (data) {
  console.log('User alert!', data);
});
// Using .get('/user') will retrieve a list of current User models,
// subscribe this socket to those models, AND subscribe this socket
// to notifications about new User models when they are created.
io.socket.get('/user', function gotResponse(body, response) {
  console.log('Current users: ', body);
})
</script>
```

### Custom realtime communication with `sails.sockets`

Sails exposes a rich API on both the client and the server for sending custom realtime messages.

##### Example

Here's the client-side code to connect a socket to the Sails/Node.js server and listen for an socket event named "hello":

```html
<!-- Simply include the sails.io.js script, and a client socket will be created and auto-connected for you -->
<script type="text/javascript" src="/js/dependencies/sails.io.js"></script>
<script type="text/javascript">

// The auto-connecting socket is exposed as `io.socket`.

// Use `io.socket.on()` to listen for the 'hello' event:
io.socket.on('hello', function (data) {
  console.log('Socket `' + data.id + '` joined the party!');
});
</script>
```

Then, also on the client, we can send a _socket request_.  In this case, we'll wire up the browser to send a socket request when a particular button is clicked:

```js
$('button#say-hello').click(function (){

  // And use `io.socket.get()` to send a request to the server:
  io.socket.get('/say/hello', function gotResponse(data, jwRes) {
    console.log('Server responded with status code ' + jwRes.statusCode + ' and data: ', data);
  });

});

```


Meanwhile, on the server...

To respond to requests to `GET /say/hello`, we use an action.  In our action, we'll subscribe the requesting socket to the "funSockets" room, then broadcast a "hello" message to all sockets in that room (excluding the new one).

```javascript
// In /api/controllers/SayController.js
module.exports = {

  hello: function(req, res) {

    // Make sure this is a socket request (not traditional HTTP)
    if (!req.isSocket) {
      return res.badRequest();
    }

    // Have the socket which made the request join the "funSockets" room.
    sails.sockets.join(req, 'funSockets');

    // Broadcast a notification to all the sockets who have joined
    // the "funSockets" room, excluding our newly added socket:
    sails.sockets.broadcast('funSockets', 'hello', { howdy: 'hi there!'}, req);

    // ^^^
    // At this point, we've blasted out a socket message to all sockets who have
    // joined the "funSockets" room.  But that doesn't necessarily mean they
    // are _listening_.  In other words, to actually handle the socket message,
    // connected sockets need to be listening for this particular event (in this
    // case, we broadcasted our message with an event name of "hello").  The
    // client-side code you'd need to write looks like this:
    // 
    //   io.socket.on('hello', function (broadcastedData){
    //       console.log(data.howdy);
    //       // => 'hi there!'
    //   }
    // 

    // Now that we've broadcasted our socket message, we still have to continue on
    // with any other logic we need to take care of in our action, and then send a
    // response.  In this case, we're just about wrapped up, so we'll continue on

    // Respond to the request with a 200 OK.
    // The data returned here is what we received back on the client as `data` in:
    // `io.socket.get('/say/hello', function gotResponse(data, jwRes) { /* ... */ });`
    return res.json({
      anyData: 'we want to send back'
    });

  }
}
```

### Reference

* See the full reference for the [sails.io.js library](https://sailsjs.com/documentation/reference/web-sockets/socket-client/io-socket-on) to learn how to use sockets on the client side to communicate with your Sails app.
* See the [sails.sockets](https://sailsjs.com/documentation/reference/web-sockets/sails-sockets) reference to learn how to send custom messages from the server to connected sockets.
* See the [resourceful pub-sub](https://sailsjs.com/documentation/reference/web-sockets/resourceful-pub-sub) reference to learn how Sails' blueprint API automatically sends realtime messages about changes to your [models](https://sailsjs.com/documentation/concepts/models-and-orm/models).
* Visit the [Socket.io](http://socket.io) website to learn more about the underlying library Sails uses for realtime communication

<docmeta name="displayName" value="Realtime">
