# `.subscribe()`

Subscribe the requesting client socket to changes/deletions of one or more database records.

```js
Something.subscribe(req, ids);
```


### Usage

|   | Argument   | Type         | Details |
|---|:-----------|:------------:|:--------|
| 1 | req        | ((req))      | The incoming socket request (`req`) containing the socket to subscribe.
| 2 | ids        | ((array))    | An array of record ids (primary key values).


When a client socket is subscribed to a record, it is a member of its dynamic "record room".  That means it will receive all messages broadcasted to that room by [`.publish()`](https://sailsjs.com/documentation/reference/web-sockets/resourceful-pub-sub/publish).

### Example


On the server, in a controller action:

```javascript
// On the server:

if (!this.req.isSocket) {
  throw {badRequest: 'Only a client socket can subscribe to Louies.  But you look like an HTTP request to me.'};
}

// Let's say our client socket has a problem with people named "louie".

// First we'll find all users named "louie" (or "louis" even-- we should be thorough)
let usersNamedLouie = await User.find({ or: [{name: 'louie'},{name: 'louis'}] });

// Now we'll subscribe our client socket to each of these records.
User.subscribe(this.req, _.pluck(usersNamedLouie, 'id'));

// All done!  We might send down some data, or just an empty 200 (OK) response.
```




Then, back in our client-side code:

```javascript
// On the client:

// Send a request to the "subscribeToLouies" action, subscribing this client socket
// to all future events that the server publishes about Louies.
io.socket.get('/foo/bar/subscribeToLouies', function (data, jwr){
  if (jwr.error) {
    console.error('Could not subscribe to Louie-related notifications: '+jwr.error);
    return;
  }

  console.log('Successfully subscribed.');

});
```


From now on, as long as our requesting client socket stays connected, it will receive a notification any time our server-side code (e.g. other actions or helpers) calls `User.publish()` for one of the Louies we subscribed to above.

In order for our client-side code to handle these future notifications, it must _listen_ for the relevant event with `.on()`.  For example:

```js
// On the client:

// Whenever a `user` event is received, say something.
io.socket.on('user', function(msg) {
  console.log('Got a message about a Louie: ', msg);
});
```

See [Concepts > Realtime](https://sailsjs.com/documentation/concepts/realtime) for more background on the difference between rooms and events in Sails/Socket.IO.



### Multiple rooms per record

For some applications, you may find yourself needing to manage two different channels related to the same record.  To accomplish this, you can combine [`.getRoomName()`](https://sailsjs.com/documentation/reference/web-sockets/resourceful-pub-sub/get-room-name) and [`sails.sockets.join()`](https://sailsjs.com/documentation/reference/web-sockets/sails-sockets/join):

```js
// On the server, in your subscribe action…

if (!orgId) { throw 'badRequest'; }

if (!this.req.isSocket) { throw {badRequest: 'This action is designed for use with WebSockets.'}; }

let me = await User.findOne({
  id: this.req.session.userId
})
.populate('globalAdminOfOrganizations');

// Subscribe to general notifications.
Organization.subscribe(this.req, orgId);

// If this user is a global admin of this organization, then also subscribe them to
// an additional private room (this is used for additional notifications intended only
// for global admins):
if (globalAdminOfOrganizations.includes(orgId)) {
  let privateRoom = Organization.getRoomName(`${orgId}-admins-only`);
  sails.sockets.join(this.req, privateRoom);
}

```

Later, to publish to one of these rooms, just compute the appropriate room name (e.g. "13-admins-only") and use [`sails.sockets.broadcast()`](https://sailsjs.com/documentation/reference/web-sockets/sails-sockets/broadcast) to blast out your notification.



### Notes

> + Be sure and check `req.isSocket === true` before passing in `req` to refer to the requesting socket.  The provided `req` must be from a socket request, not just any old HTTP request.
> + `.subscribe()` will only work with requests made over a Socket.IO connection (e.g. using `io.socket.get()`), *not* over an HTTP connection (e.g. using `jQuery.get()`).  See the [`sails.io.js` socket client documentation](https://sailsjs.com/documentation/reference/web-sockets/socket-client) for information on using client sockets to send WebSockets/Socket.IO messages with Sails.
> + This function does _not actually talk to the database_!  In fact, none of the resourceful PubSub methods do.  Rather, these make up a simplified abstraction layer built on top of the lower-level `sails.sockets` methods, designed to make your app cleaner and easier to debug by using conventional names for events/rooms/namespaces etc.




<docmeta name="displayName" value=".subscribe()">
<docmeta name="pageType" value="method">

