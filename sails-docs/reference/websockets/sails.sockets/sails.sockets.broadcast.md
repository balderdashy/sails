# `.broadcast()`

Broadcast a message to all sockets in a room (or to a particular socket).

```javascript
sails.sockets.broadcast(roomNames, data);
```

_Or:_
+ `sails.sockets.broadcast(roomNames, eventName, data);`
+ `sails.sockets.broadcast(roomNames, data, socketToOmit);`
+ `sails.sockets.broadcast(roomNames, eventName, data, socketToOmit);`


### Usage

|   |          Argument           | Type                | Details
|---|:--------------------------- | ------------------- |:-----------
| 1 |        roomNames              | ((string)), ((Array))          | The name of one or more rooms in which to broadcast a message (see [sails.sockets.join](https://sailsjs.com/documentation/reference/web-sockets/sails-sockets/join)).  To broadcast to individual sockets, use their IDs as room names.
| 2 |        _eventName_            | ((string?))          | Optional. The unique name of the event used by the client to identify this message.  Defaults to `'message'`.
| 3 |        data                   | ((json))          | The data to send in the message.
| 4 |        _socketToOmit_         | ((req?))          | Optional. If provided, the socket belonging to the specified socket request will *not* receive the message.  This is useful if you trigger the broadcast from a client, but don't want that client to receive the message itself (for example, sending a message to everybody else in a chat room).


### Example

In an action, service, or arbitrary script on the server:

```javascript
sails.sockets.broadcast('artsAndEntertainment', { greeting: 'Hola!' });
```

On the client:

```javascript
io.socket.on('message', function (data){
  console.log(data.greeting);
});
```


##### Additional Examples

More examples of `sails.sockets.brodcast()` usage are [available here](https://gist.github.com/mikermcneil/0a4d05750768a99b4fcb), including broadcasting to multiple rooms, using a custom event name, and omitting the requesting socket.


### Notes
> + `sails.sockets.broadcast()` is more or less equivalent to the functionality of `.emit()` and `.broadcast()` in Socket.IO.
> + Every socket is automatically subscribed to a room with its ID as the name, allowing direct messaging to a socket via [`sails.sockets.broadcast()`](https://sailsjs.com/documentation/reference/web-sockets/sails-sockets/sails-sockets-broadcast)
> + Be sure to check that `req.isSocket === true` before passing in `req` as `socketToOmit`. For the requesting socket to be omitted, the request (`req`) must be from a socket request, not just any old HTTP request.
> + `data` must be JSON-serializable; i.e. it's best to use plain dictionaries/arrays, and make sure your data does not contain any circular references. If you aren't sure, build your broadcast `data` manually, or call something like [`rttc.dehydrate(data,true,true)`](https://github.com/node-machine/rttc/blob/master/README.md#dehydratevalue-allownullfalse-dontstringifyfunctionsfalse) on it first.

<docmeta name="displayName" value=".broadcast()">
<docmeta name="pageType" value="method">

