# `.leaveAll()`

Unsubscribe all members of a room (e.g. `chatroom7`) from that room _and_ every other room they are currently subscribed to, except the automatic room associated with their socket ID.

```javascript
sails.sockets.leaveAll(roomName, cb);
```


### Usage

|   | Argument   | Type        | Details |
|---|:-----------|:-----------:|:--------|
| 1 | roomName   | ((string)) | The room to evactuate.  Note that this room's members will be forced to leave _all of their rooms_, not just this one.
| 2 | cb         | ((function?))| An optional callback, which will be called when the operation is complete _on the current server_ (see notes below for more information), or if fatal errors were encountered.  In the case of errors, it will be called with a single argument (`err`).

### Example

In a controller action:

```javascript
unsubscribeFunRoomMembersFromEverything: function(req, res) {

  sails.sockets.leaveAll('funRoom', function(err) {
    if (err) { return res.serverError(err); }

    // Unsubscribed all sockets in "funRoom" from "funRoom".
    // And... from every other room too.

    return res.ok();

  });
}
```


### Notes
> + In a multi-server environment, the callback function (`cb`) will be executed when the `.leaveAll()` call completes _on the current server_.  This does not guarantee that other servers in the cluster have already finished running the operation.

<docmeta name="displayName" value=".leaveAll()">
<docmeta name="pageType" value="method">

