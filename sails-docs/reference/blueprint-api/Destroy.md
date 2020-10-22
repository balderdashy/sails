# Destroy (blueprint)

Delete the record specified by `id` from the database forever and notify subscribed sockets.

```usage
DELETE /:model/:id
```

This destroys the record that matches the **id** parameter and responds with a JSON dictionary representing the destroyed instance. If no model instance exists matching the specified **id**, a `404` is returned.

Additionally, a `destroy` event will be published to all sockets subscribed to the record room, and all sockets currently subscribed to the record will be unsubscribed from it.


### Parameters

 Parameter                          | Type                                    | Details
 ---------------------------------- | --------------------------------------- |:---------------------------------
 model          | ((string))   | The [identity](https://sailsjs.com/documentation/concepts/models-and-orm/model-settings#?identity) of the containing model.<br/><br/>e.g. `'purchase'` (in `/purchase/7`)
 id<br/>*(required)*                | ((string))                              | The primary key value of the record to destroy, specified in the path.  <br/>e.g. `'7'` (in `/purchase/7`) .



### Example

Delete Pinkie Pie:

`DELETE /user/4`

[![Run in Postman](https://s3.amazonaws.com/postman-static/run-button.png)](https://www.getpostman.com/run-collection/96217d0d747e536e49a4)

##### Expected response

```json
{
  "name": "Pinkie Pie",
  "hobby": "kickin",
  "id": 4,
  "createdAt": 1485550644076,
  "updatedAt": 1485550644076
}
```

### Socket notifications

If you have WebSockets enabled for your app, then every client [subscribed](https://sailsjs.com/documentation/reference/web-sockets/resourceful-pub-sub) to the destroyed record will receive a notification where the event name is that of the model identity (e.g. `user`), and the &ldquo;message&rdquo; has the following format:

```
verb: 'destroyed',
id: <the record primary key>,
previous: <a dictionary of the attribute values of the destroyed record (including populated associations)>
```

For instance, continuing the example above, all clients subscribed to `User` #4 (_except_ for the client making the request) might receive the following message:

```js
id: 4,
verb: 'destroyed',
previous: {
  name: 'Pinkie Pie',
  hobby: 'kickin',
  createdAt: 1485550644076,
  updatedAt: 1485550644076
}
```

**If the destroyed record had any links to other records, there might be some additional notifications:**

Assuming the record being destroyed in our example had an association with a `via`, then either `updated` or `removedFrom` notifications would also be sent to any clients who are [subscribed](https://sailsjs.com/documentation/reference/web-sockets/resourceful-pub-sub) to those child records on the other side of the relationship.  See [**Blueprints > remove from**](https://sailsjs.com/documentation/reference/blueprint-api/remove-from) and [**Blueprints > update**](https://sailsjs.com/documentation/reference/blueprint-api/update) for more info about the structure of those notifications.

> If the association pointed at by the `via` is plural (e.g. `cashiers`), then the `removedFrom` notification will be sent. Otherwise, if the `via` points at a singular association (e.g. `cashier`) then the `updated` notification will be sent.


<docmeta name="displayName" value="destroy">
<docmeta name="pageType" value="endpoint">

