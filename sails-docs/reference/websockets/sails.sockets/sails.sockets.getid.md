# `.getId()`

Parse the socket ID from an incoming socket request (`req`).

```javascript
sails.sockets.getId(req);
```

### Usage

|   |          Argument           | Type                | Details
|---| --------------------------- | ------------------- | -----------
| 1 |           req               | ((req))             | A socket request (`req`).


Once acquired, the socket object's ID can be used to send direct messages to that socket (see [sails.sockets.broadcast](https://sailsjs.com/documentation/reference/web-sockets/sails-sockets/broadcast)).


### Example

```javascript
// Controller action
getSocketID: function(req, res) {
  if (!req.isSocket) {
    return res.badRequest();
  }

  var socketId = sails.sockets.getId(req);
  // => "BetX2G-2889Bg22xi-jy"

  sails.log('My socket ID is: ' + socketId);

  return res.json(socketId);
}
```


### Notes
> + Be sure to check that `req.isSocket === true` before passing in `req`. This method does not work for HTTP requests!


<docmeta name="displayName" value=".getId()">
<docmeta name="pageType" value="method">

