# `.getRoomName()`

Retrieve the name of the PubSub &ldquo;room&rdquo; for a given record.

```js
Something.getRoomName(id);
```

### Usage

|   | Argument   | Type         | Details |
|---|:-----------|:------------:|:--------|
| 1 | id         | ((number)) <br> or <br> ((string))    | The ID (primary key value) of the record to get the PubSub room name for.

### Example

```javascript
  // On the server:

  subscribeAllBobWatchersToKaren: function (req, res) {

    // Look up all users named "bob" or "karen".
    User.find({name: ['bob', 'karen']}, function(err, users) {
      if (err) {return res.serverError(err);}

      // Get Bob's ID.  We'll assume there is only one Bob.
      var bobId = _.find(users, { name: 'bob' }).id;

      // Get Karen's ID.  We'll assume there is only one Karen.
      var karenId = _.find(users, { name: 'karen' }).id;

      // Subscribe all of Bob's sockets to Karen.
      sails.sockets.addRoomMembersToRooms(User.getRoomName(bobId), User.getRoomName(karenId));

      return res.send();
    });

  }
```

<docmeta name="displayName" value=".getRoomName()">
<docmeta name="pageType" value="method">

