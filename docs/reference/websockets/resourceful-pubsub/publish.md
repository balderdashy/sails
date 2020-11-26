# `.publish()`

Broadcast an arbitrary message to socket clients [subscribed](https://sailsjs.com/documentation/reference/web-sockets/resourceful-pub-sub/subscribe) to one or more of this model's [records](https://sailsjs.com/documentation/concepts/models-and-orm).

```js
Something.publish(ids, data, req);
```

> The event name for this broadcast is the same as the model's identity.

### Usage

|   | Argument   | Type         | Details |
|---|:-----------|:------------:|:--------|
| 1 | ids        | ((array))    | An array of record ids (primary key values).
| 2 | data       | ((json))     | The data to broadcast.
| 3 | _req_      | ((req?))     | Optional.  If provided, then the requesting socket will *not* receive the broadcast.



### Example

```javascript
  // On the server:

  tellSecretToBobs: function (req, res) {

    // Get the secret from the request.
    var secret = req.param('secret');

    // Look up all users named "Bob".
    User.find({name: 'bob'}, function(err, bobs) {
      if (err) {return res.serverError(err);}

      // Tell the secret to every client who is subscribed to these users,
      // except for the client that made this request in the first place.
      // Note that the secret is wrapped in a dictionary with a `verb` property -- this is not
      // required, but helpful if you'll also be listening for events from Sails blueprints.
      User.publish(_.pluck(bobs, 'id'), {
        verb: 'published',
        theSecret: secret
      }, req);

      return res.send();
    });

  }
```

```javascript
  // On the client:

  // Subscribe this client socket to Bob-only secrets
  // > See the `.subscribe()` documentation for more info about subscribing to records:
  // > https://sailsjs.com/documentation/reference/web-sockets/resourceful-pub-sub/subscribe
  io.socket.get('/subscribeToBobSecrets');

  // Whenever a `user` event is received, do something.
  io.socket.on('user', function(msg) {
     if (msg.verb === 'published') {
       console.log('Got a secret only Bobs can hear:', msg.theSecret);
     }
     // else if (msg.verb === 'created') { ... }
     // else if (msg.verb === 'updated') { ... }
  });
```

### Notes
> + Be sure to check that `req.isSocket === true` before passing in `req` to refer to the requesting socket.  If used, the provided `req` must be from a socket request, not just any old HTTP request.


<docmeta name="displayName" value=".publish()">
<docmeta name="pageType" value="method">

