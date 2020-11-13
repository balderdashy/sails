# `io.socket.on()`

Start listening for socket events from Sails with the specified `eventName`.  Triggers the provided callback function when a matching event is received.

```js
io.socket.on(eventName, function (msg) {
  // ...
});
```


### Usage

|   | Argument    | Type         | Details |
|---|-------------|:------------:|:--------|
| 1 | eventName   | ((string))   | The name of the socket event, e.g. `'recipe'` or `'welcome'`.
| 2 | handlerFn   | ((function)) | An event handler that will be called when the server broadcasts a notification to this socket.  Will only be called if the incoming socket notification matches `eventName`.


##### Event handler

|   | Argument  | Type            | Details |
|---|:----------|:---------------:|:--------|
| 1 | msg       | ((json))        | The data from the socket notification.



### When is the event handler called?

This event handler is called when the client receives an incoming socket notification that matches the specified event name (e.g. `'welcome'`).  This happens when the server broadcasts a message to this socket directly, or to a room of which it is a member.  To broadcast a socket notification, you need to either use the [blueprint API](https://sailsjs.com/documentation/concepts/blueprints) or write some server-side code (e.g. in an action, helper, or even in a command-line script).  This is typically achieved in one of the following ways:


###### Low-level socket methods (`sails.sockets`)
+ server blasts out a message to all connected sockets (see [sails.sockets.blast()](https://sailsjs.com/documentation/reference/web-sockets/sails-sockets/blast))
+ server broadcasts a message directly to a particular socket using its unique ID or to an entire room full of sockets (see [sails.sockets.broadcast()](https://sailsjs.com/documentation/reference/web-sockets/sails-sockets/broadcast))


###### Resourceful Pubsub Methods
+ server broadcasts a message about a record, which multiple sockets might be subscribed to (see [Model.publish()](https://sailsjs.com/documentation/reference/web-sockets/resourceful-pub-sub/publish)
+ server broadcasts a message as part of the "Create" blueprint action _(only relevant if using [blueprints](https://sailsjs.com/documentation/concepts/blueprints))_



### Example

Listen for the "order" event:

```javascript
io.socket.on('order', function onServerSentEvent (msg) {
  // msg => {...whatever the server broadcasted...}
});
```


##### Realtime cafeteria

Imagine you're building an ordering system for a chain of restaurants:

```javascript
// In your frontend code...
// (This example uses jQuery and Lodash for simplicity. But you can use any library or framework you like.)

var ORDER_IN_LIST = _.template('<li data-id="<%- order.id %>"><p><%- order.summary %></p></li>');

$(function whenDomIsReady(){

  // Every time we receive a relevant socket event...
  io.socket.on('order', function (msg) {

    // Let's see what the server has to say...
    switch(msg.verb) {

      case 'created': (function(){

        // Render the new order in the DOM.
        var newOrderHtml = ORDER_IN_LIST(msg.data);
        $('#orders').append(newOrderHtml);

      })(); return;

      case 'destroyed': (function(){

        // Find any existing orders w/ this id in the DOM.
        //
        // > Remember: To prevent XSS attacks and bugs, never build DOM selectors
        // > using untrusted provided by users.  (In this case, we know that "id"
        // > did not come from a user, so we can trust it.)
        var $deletedOrders = $('#orders').find('[data-id="'+msg.id+'"]');

        // Then, if there are any, remove them from the DOM.
        $deletedOrders.remove();

      })(); return;

      // Ignore any unrecognized messages
      default: return;

    }//< / switch >

  });//< / io.socket.on() >

});//< / when DOM is ready >
```

> Note that this example assumes the backend calls [`.publish()`](https://sailsjs.com/documentation/reference/web-sockets/resourceful-pub-sub/publish) or [`.broadcast()`](https://sailsjs.com/documentation/reference/web-sockets/sails-sockets/broadcast) at some point.  That might be through custom code, or via the [blueprint API](https://sailsjs.com/documentation/concepts/blueprints).


### The `'connect'` event
By default, when the Sails socket client is loaded on a page, it begins connecting a socket for you automatically.  When using the default, auto-connecting socket (`io.socket`), you don't have to wait for the socket to connect before using it.  In other words, you can listen for other socket events or call methods like [`io.socket.get()`](https://sailsjs.com/documentation/reference/web-sockets/socket-client/io-socket-get) immediately.  The Sails socket client will queue up anything you do in the meantime and then replay it automatically once the connection is live.

Consequently, direct usage of the `'connect'` event **is not necessary for most apps**.  But in the spirit of completeness, it is worth mentioning that you can also bind your own `'connect'` handler:

```javascript
io.socket.on('connect', function onConnect(){
  console.log('This socket is now connected to the Sails server.');
});
```

### The `'disconnect'` event

If a socket's connection to the server was interrupted&mdash;perhaps because the server was restarted, or the client had some kind of network issue&mdash;it is possible to handle `disconnect` events in order to display an error message or even to manually reconnect the socket again.

```javascript
io.socket.on('disconnect', function onDisconnect(){
  console.log('This socket lost connection to the Sails server');
});
```

> Sockets can be configured to reconnect automatically.  However, as of Sails v1, the Sails socket client disables this behavior by default.  In practice, since your user interface might have missed socket notifications while disconnected, you'll almost always want to handle any related custom logic by hand.  (For example, a "Check your internet connection" error message).



### Notes
>+ Remember that a socket only stays subscribed to a room for as long as it is connected&mdash;e.g. as long as the browser tab is open&mdash;or until it is manually unsubscribed on the server using [`.unsubscribe()`](https://sailsjs.com/documentation/reference/web-sockets/resourceful-pub-sub/unsubscribe) or [`.leave()`](https://sailsjs.com/documentation/reference/web-sockets/sails-sockets/leave).
>+ When listening for socket messages from resourceful PubSub calls and blueprints, the event name is always the same as the identity of the calling model.  For example, if you have a model named "UserComment", the model's identity (and therefore the socket event name used by [`UserComment.publish()`](https://sailsjs.com/documentation/reference/web-sockets/resourceful-pub-sub)) is "usercomment".
>+ For context, socket notifications are also sometimes referred to as "server-sent events" or "[comet](http://en.wikipedia.org/wiki/Comet_(programming)) messages".


<docmeta name="displayName" value="io.socket.on()">
<docmeta name="pageType" value="method">

