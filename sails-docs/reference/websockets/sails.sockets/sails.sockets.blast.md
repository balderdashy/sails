# `.blast()`

Broadcast a message to all sockets connected to the server (or any server in the cluster, if you have a multi-server deployment using Redis).

```javascript
sails.sockets.blast(data);
```

or:
+ `sails.sockets.blast(eventName, data);`
+ `sails.sockets.blast(data, socketToOmit);`
+ `sails.sockets.blast(eventName, data, socketToOmit);`



### Usage

|   |         Argument           | Type                | Details                                                           |
|---|:-------------------------- | ------------------- |:----------------------------------------------------------------- |
| 1 |        _eventName_         | ((string?))         | Optional. Defaults to `'message'`.
| 2 |        data                | ((json))            | The data to send in the message.
| 3 |       _socketToOmit_       | ((req?))            | Optional. If provided, the socket associated with this socket request will **not** receive the message blasted out to everyone else.  Useful when the broadcast-worthy event is triggered by a requesting user who doesn't need to hear about it again.




### Example

In a controller action...

```javascript
sails.sockets.blast('user_logged_in', {
  msg: 'User #' + user.id + ' just logged in.',
  user: {
    id: user.id,
    username: user.username
  }
}, req);
```

### Notes
> + Be sure to check that `req.isSocket === true` before passing in `req` to this method. For the socket to be omitted, the current `req`  must be from a socket request, not just any HTTP request.


<docmeta name="displayName" value=".blast()">
<docmeta name="pageType" value="method">
