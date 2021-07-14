# `.addRoomMembersToRooms()`

Subscribe all members of a room to one or more additional rooms.

```js
sails.sockets.addRoomMembersToRooms(sourceRoom, destRooms, cb);
```



### Usage

|   | Argument   | Type        | Details |
|---|------------|:-----------:|:--------|
| 1 | sourceRoom | ((string)) | The room from which to retrieve members.
| 2 | destRooms  | ((string)), ((array))  | The room or rooms to which to subscribe the members of `sourceRoom`.
| 3 | cb         | ((function?))| An optional callback, which will be called when the operation is complete on the current server (see notes below for more information) or if fatal errors were encountered.  In the case of errors, it will be called with a single argument (`err`).


### Example

In a controller action:

```javascript
subscribeFunRoomMembersToFunnerRooms: function(req, res) {
  sails.sockets.addRoomMembersToRooms('funRoom', ['greatRoom', 'awesomeRoom'], function(err) {
    if (err) {return res.serverError(err);}
    res.json({
      message: 'Subscribed all members of `funRoom` to `greatRoom` and `awesomeRoom`!'
    });
  });
}
```

### Notes
> + In a multi-server environment, the callback function (`cb`) will be executed when the `.addRoomMembersToRooms()` call completes _on the current server_.  This does not guarantee that other servers in the cluster have already finished running the operation.

<docmeta name="displayName" value=".addRoomMembersToRooms()">
<docmeta name="pageType" value="method">
