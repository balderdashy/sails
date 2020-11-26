# `.leave()`

Unsubscribe a socket from a room.


```js
sails.sockets.leave(socket, roomName);
```

or:

+ `sails.sockets.leave(socket, roomName, cb);`


### Usage

|   | Argument   | Type        | Details |
|---|------------|:-----------:|:--------|
| 1 | socket     | ((string)), ((req)) | The socket to be unsubscribed.  May be either the incoming socket request (req) or the ID of another socket.
| 2 | roomName   | ((string))  | The name of the room to which the socket will be unsubscribed.
| 3 | _cb_       | ((function?))| An optional callback, which will be called when the operation is complete on the current server (see notes below for more information), or if fatal errors were encountered.  In the case of errors, it will be called with a single argument (`err`).


### Example

In a controller action, unsubscribe the requesting socket from the specified room:

```javascript
leaveFunRoom: function(req, res) {
  if ( _.isUndefined(req.param('roomName')) ) {
    return res.badRequest('`roomName` is required.');
  }

  if (!req.isSocket) {
    return res.badRequest('This endpoints only supports socket requests.');
  }

  var roomName = req.param('roomName');
  sails.sockets.leave(req, roomName, function(err) {
    if (err) {return res.serverError(err);}
    return res.json({
      message: 'Left a fun room called '+roomName+'!'
    });
  });
}
```


##### Additional Examples

More examples of `sails.sockets.leave()` usage are [available here](https://gist.github.com/mikermcneil/971b4e92d833211a0243), including unsubscribing other sockets by ID, deeper integration with the database, usage within a service, and usage with the `async` library.


### Notes
> + `sails.sockets.leave()` is more or less equivalent to the functionality of `.leave()` in Socket.IO, but with additional built-in support for multi-server deployments.  With [recommended production settings](https://sailsjs.com/documentation/concepts/deployment/scaling), `sails.sockets.leave()` works as documented no matter what server the code happens to be running on or the server to which the target socket is connected.
> + In a multi-server environment, when calling `.leave()` with a socket ID argument, the callback function (`cb`) will be executed when the `.leave()` call completes _on the current server_.  This does not guarantee that other servers in the cluster have already finished running the operation.
> + Be sure to check that `req.isSocket === true` before passing in `req` as the socket to be unsubscribed.  For that to work, the provided `req` must be from a socket request, not just any old HTTP request.



<docmeta name="displayName" value=".leave()">
<docmeta name="pageType" value="method">
