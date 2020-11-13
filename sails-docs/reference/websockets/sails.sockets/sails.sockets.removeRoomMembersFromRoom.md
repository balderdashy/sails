# `.removeRoomMembersFromRooms()`

Unsubscribe all members of a room from one or more other rooms.

```js
sails.sockets.removeRoomMembersFromRooms(sourceRoom, destRooms, cb);
```


### Usage

|   | Argument       | Type                         | Details |
|---|----------------|:----------------------------:|:--------|
| 1 | sourceRoom     | ((string))                   | The room from which to retrieve members.
| 2 | destRooms      | ((string)), ((array))        | The room or rooms from which to unsubscribe the members of `sourceRoom`.
| 3 | cb             | ((function?))                | An optional callback, which will be called when the operation is complete _on the current server_ (see notes below for more information), or if fatal errors were encountered.  In the case of errors, it will be called with a single argument (`err`).


### Example

In a controller action:

```javascript
unsubscribeFunRoomMembersFromFunnerRooms: function(req, res) {
  sails.sockets.removeRoomMembersFromRooms('funRoom', ['greatRoom', 'awesomeRoom'], function(err) {
    if (err) {return res.serverError(err);}
    res.json({
      message: 'Unsubscribed all members of `funRoom` from `greatRoom` and `awesomeRoom`!'
    });
  });
}
```

### Notes
> + In a multi-server environment, the callback function (`cb`) will be executed when the `.removeRoomMembersFromRooms()` call completes _on the current server_.  This does not guarantee that other servers in the cluster have already finished running the operation.

<docmeta name="displayName" value=".removeRoomMembersFromRooms()">
<docmeta name="pageType" value="method">
