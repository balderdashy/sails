# `req.isSocket`

A flag indicating whether or not this request (`req`) originated from a Socket.io connection.


### Usage
```usage
req.isSocket;
```

### Example
```javascript
if (req.isSocket){
  // You're a socket.  Do cool socket stuff like subscribing.
  User.subscribe(req, [req.session.userId]);
}
else {
  // Just another HTTP request.
  // (`req.isSocket` is undefined)
}
```

### Notes

> + Useful for allowing HTTP requests to skip calls to PubSub or WebSocket-centric methods like `subscribe()` or `watch()`  that depend on an actual Socket.io request.  This allows you to reuse backend code for both WebSocket and HTTP clients.
> + As you might expect, `req.isSocket` doesn't need to be checked before running methods that **publish to other** connected sockets.  Those methods don't depend on the request, so they work either way.












<docmeta name="displayName" value="req.isSocket">
<docmeta name="pageType" value="property">
