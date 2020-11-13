# Create (blueprint)

Create a new record in your database.

```usage
POST /:model
```

Responds with a JSON dictionary representing the newly created instance.  If a validation error occurred, a JSON response with the invalid attributes and a `400` status code will be returned instead.

Additionally, if the [`autoWatch` setting](https://sailsjs.com/documentation/reference/configuration/sails-config-blueprints?properties) is on (which it is by default), then a "created" notification will be published to all client sockets which are _watching_ this model; that is, client sockets who have previously sent a request to the "Find" blueprint action.  Those same sockets will also be subscribed to hear about subsequent changes to the new record.

Finally, if this blueprint action is triggered via a socket request, then the requesting socket will ALSO be subscribed to the newly created record.  In other words, if the record is subsequently updated or deleted using blueprints, a message will be sent to that client socket informing them of the change.  See [`.subscribe()`](https://sailsjs.com/documentation/reference/web-sockets/resourceful-pub-sub/subscribe) for more info.

### Parameters

Parameters should be sent in the [request body](https://www.getpostman.com/docs/requests#body).  By default, Sails understands the most common types of encodings for body parameters, including url-encoding, form-encoding, and JSON.

 Parameter      | Type                                                      | Details
 -------------- | --------------------------------------------------------- |:---------------------------------
 model          | ((string))   | The [identity](https://sailsjs.com/documentation/concepts/models-and-orm/model-settings#?identity) of the model in which the new record should be created.<br/><br/>e.g. `'purchase'` (in `POST /purchase`)
 _*_            | ((json?))                                                  | Send [body parameters](https://www.getpostman.com/docs/requests#body) with the same names as the attribute defined on your model to set those values on your new record.  <br/> <br/>These values are handled the same way as if they were passed into the model's <a href="https://sailsjs.com/documentation/reference/waterline-orm/models/create">.create()</a> method.

### Example

Create a new user named "Applejack" with a hobby of "pickin", who is involved in purchases #13 and #25:

`POST /pony`

```json
{
  "name": "Applejack",
  "hobby": "pickin",
  "involvedInPurchases": [13,25]
}
```

[![Run in Postman](https://s3.amazonaws.com/postman-static/run-button.png)](https://www.getpostman.com/run-collection/96217d0d747e536e49a4)

##### Example response
```json
{
  "id": 47,
  "name": "Applejack",
  "hobby": "pickin",
  "createdAt": 1485550575626,
  "updatedAt": 1485550603847,
  "involvedInPurchases": [
    {
      "id": 13,
      "amount": 10000,
      "createdAt": 1485550525451,
      "updatedAt": 1485550544901
    },
    {
      "id": 25,
      "amount": 4.50,
      "createdAt": 1485550561340,
      "updatedAt": 1485550561340
    }
  ]
}
```

### Socket notifications

If you have WebSockets enabled for your app, then every socket client who is "watching" this model (has sent a request to the model's ["find where" blueprint action](https://sailsjs.com/documentation/reference/blueprint-api/find-where)) will receive a "created" notification where the event name is the model identity (e.g. `user`), and the message has the following format:

```
verb: 'created',
data: <a dictionary of the attribute values of the new record (without associations)>
id: <the new record primary key>,
```

For instance, continuing the example above, all clients who are watching the `User` model (_except_ for the client making the request) would receive the following message:
```js
id: 47,
verb: 'created',
data: {
  id: 47,
  name: 'Applejack',
  hobby: 'pickin',
  createdAt: 1485550575626,
  updatedAt: 1485550603847
}
```

**Clients subscribed to newly-associated child records will receive a notification, too:**

Since the new record in our example included an initial value for `involvedInPurchases`, an association pointed at by `via` on the other side, then `addedTo` notifications would also be sent to any clients who are [subscribed](https://sailsjs.com/documentation/reference/web-sockets/resourceful-pub-sub) to those now-associated child records on the other side of the relationship&mdash;in this case, purchases 13 and 25.  See [**Blueprints > add to**](https://sailsjs.com/documentation/reference/blueprint-api/add-to) for more info about the structure of those notifications.

<docmeta name="displayName" value="create">
<docmeta name="pageType" value="endpoint">

