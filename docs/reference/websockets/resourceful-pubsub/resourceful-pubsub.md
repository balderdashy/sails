# Resourceful PubSub (RPS)

### Overview

For apps that rely heavily on [realtime](https://sailsjs.com/documentation/concepts/realtime) client-server communication&mdash;for example, peer-to-peer chat and social networking apps&mdash;sending and listening for socket events can quickly become overwhelming.  Sails helps smooth away some of the complexity associated with socket events by introducing the concept of **resourceful PubSub** ([Publish / Subscribe](http://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern)).  Every model in your app is automatically equipped with resourceful PubSub methods, which provide a conventional, data-centric interface for both _broadcasting notifications_ and _subscribing sockets to notifications_ about individual database records.

If your app is currently using the [blueprint API](https://sailsjs.com/documentation/reference/blueprint-api), you are already using resourceful PubSub methods!  They are embedded in the default blueprint actions bundled with Sails and are called automatically when those actions run, causing requesting sockets to be subscribed when data is fetched and messages to be broadcasted to already-subscribed sockets when data is changed. (Sockets can be subscribed via a call to [`.subscribe()`](https://sailsjs.com/documentation/reference/web-sockets/resourceful-pub-sub/subscribe) or due to a previous socket request to the [`find`](https://sailsjs.com/documentation/reference/blueprint-api/find) or [`findOne`](https://sailsjs.com/documentation/reference/blueprint-api/find-one) blueprints.)

Even when writing custom code, you can manually call the methods described in this section in lieu of using `sails.sockets.*` methods directly.  Think of resourceful PubSub methods as a way of standardizing the interface for socket communication across your application&mdash;these interface elements might be the names of rooms, the schema for data transmitted as socket messages, or the names of socket events.  These methods are designed _exclusively_ for scenarios where one or more user interfaces are listening to socket events in order to stay in sync with the backend.  If that does not fit your use case or if you are having trouble deciding, don't worry; just call [`sails.sockets.broadcast()`](https://sailsjs.com/documentation/reference/web-sockets/sails-sockets/broadcast), [`sails.sockets.join()`](https://sailsjs.com/documentation/reference/web-sockets/sails-sockets/join), or [`sails.sockets.leave()`](https://sailsjs.com/documentation/reference/web-sockets/sails-sockets/leave) directly, instead.  It is perfectly acceptable to use either approach, or even _both_ approaches in the same app.


### Methods

Sails exposes three different resourceful PubSub (RPS) methods: `.publish()`, `.subscribe()`, and `.unsubscribe()`.

To get a deeper understanding of resourceful PubSub methods, you may find it useful to familiarize yourself with the underlying [`sails.sockets.*`](https://sailsjs.com/documentation/reference/web-sockets/sails-sockets) methods first.  That's because each RPS method is more or less just a contextualized wrapper around one of the simpler `sails.sockets.*` methods:

+ [`.publish()`](https://sailsjs.com/documentation/reference/web-sockets/resourceful-pub-sub/publish) is like _[`sails.sockets.broadcast()`](https://sailsjs.com/documentation/reference/web-sockets/sails-sockets/broadcast)_
+ [`.subscribe()`](https://sailsjs.com/documentation/reference/web-sockets/resourceful-pub-sub/subscribe) is like _[`sails.sockets.join()`](https://sailsjs.com/documentation/reference/web-sockets/sails-sockets/join)_
+ [`.unsubscribe()`](https://sailsjs.com/documentation/reference/web-sockets/resourceful-pub-sub/unsubscribe)  is like _[`sails.sockets.leave()`](https://sailsjs.com/documentation/reference/web-sockets/sails-sockets/leave)_

The biggest difference between these methods and their counterparts in `sails.sockets.*` is that RPS methods expose a higher-level interface.  For example, RPS methods choose room names for you behind the scenes, and they infer a conventional event name based on your model's identity.


### Listening for events on the client

While you are free to use any JavaScript library to listen for socket events on the client, Sails provides its own socket client called [`sails.io.js`](https://sailsjs.com/documentation/reference/web-sockets/socket-client) as a convenient way to communicate with the Sails server from any web browser or Node.js process that supports Socket.IO.  Using the Sails socket client makes listening for resourceful PubSub events as easy as:

```javascript
io.socket.on('<model identity>', function (msg) {

});
```

> The _[model identity](https://sailsjs.com/documentation/concepts/models-and-orm/model-settings#?identity)_ is typically the lowercased version of the model name, unless it has been manually configured in the model file.


### Example

Let&rsquo;s say you have a model named `User` in your app, with a single &ldquo;name&rdquo; attribute.  First, we&rsquo;ll add a listener for &ldquo;user&rdquo; events:

```javascript
io.socket.on('user', function(msg){
  console.log(msg);
})
```

This will log any notifications that our client socket receives to the console, so long as those socket notifications have "user" as their event name.  However, we won&rsquo;t actually receive those messages until we *subscribe* this client socket to one or more existing `User` records (in our server-side code).

If your app has the blueprint API enabled, then subscribing the client socket to the `User` records is really easy.  In addition to fetching data, if the ["Find" blueprint action](https://sailsjs.com/documentation/reference/blueprint-api/find-where) is accessed via a [socket request](https://sailsjs.com/documentation/reference/web-sockets/socket-client/io-socket-get), then it calls [`User.subscribe()`](https://sailsjs.com/documentation/reference/web-sockets/resourceful-pub-sub/subscribe) (a resourceful PubSub method) automatically.

For example, imagine you write some client-side code that sends a socket `GET` request to `http://localhost:1337/user`:

```js
io.socket.get('/user', function(resData) {
  console.log(resData);
});
```

When that runs, it will hit the "Find" blueprint action, which returns the current list of users from the Sails server.  And if we'd sent a normal HTTP request (like `jQuery.get('/user')`), then that's all that would happen.  But because we sent a _socket request_, the server _also_ subscribed our client socket to future notifications (calls to [`.publish()`](https://sailsjs.com/documentation/reference/web-sockets/resourceful-pub-sub/publish)) about the user records that were returned.

> See [`io.socket.get()`](https://sailsjs.com/documentation/reference/web-sockets/socket-client/io-socket-get) for more info about using the `sails.io.js` client to send virtual requests.

Unlike `.subscribe()`, the RPS `.publish()` method can run from anywhere&mdash;a controller action triggered as the result of a socket request, an AJAX request, or even a cURL request from the command line.  Alternatively, `.publish()` could be called from a custom helper or in a command-line script.


Continuing with the above example, if you were to open an additional browser window and go to the following URL:

```
/user/create?name=joe
```

You would see something like the following in the console of the original window:

```js
{
	verb: 'created',
  id: 1,
  data: {
    id: 1,
    name: 'joe',
    createdAt: '2014-08-01T05:50:19.855Z'
    updatedAt: '2014-08-01T05:50:19.855Z'
  }
}
```

What you're seeing here is a dictionary (aka plain JavaScript object) that was broadcasted by the ["Create" blueprint action](https://sailsjs.com/documentation/reference/blueprint-api/create).  In the case of the blueprint API, the format of this data is standardized, but in your app, you can use `.publish()` to broadcast any data you like.


<docmeta name="displayName" value="Resourceful PubSub">
