# Replace (blueprint)

Replace all of the foreign records in one of this record's collections (e.g. "comments").

```usage
PUT /:model/:id/:association
```

This action resets references to "foreign", or "child" records that are members of a particular collection of _this_ record (the "primary", or "parent" record), replacing any existing references in the collection.

+ If the specified `:id` does not correspond with a primary record that exists in the database, this responds using `res.notFound()`.
+ Note that, if the association is "2-way" (meaning it has `via`), then the foreign key or collection on the foreign record(s) will also be updated.


### Parameters

 Parameter                          | Type                                    | Details
:-----------------------------------| --------------------------------------- |:---------------------------------
 model          | ((string))   | The [identity](https://sailsjs.com/documentation/concepts/models-and-orm/model-settings#?identity) of the containing model for the parent record.<br/><br/>e.g. `'employee'` (in `/employee/7/involvedinPurchases`)
 id                | ((string))    | The desired parent record's primary key value.<br/><br/>e.g. `'7'` (in `/employee/7/involvedInPurchases`)
 association       | ((string))                             | The name of the collection attribute.<br/><br/>e.g. `'involvedInPurchases'`
 fks | ((array))    | The primary key values (usually ids) of the child records to use as the new members of this collection.<br/><br/>e.g. `[47, 65]`

> _The `fks` parameter should be sent in the PUT request body, unless you are making this request using a development-only [shortcut blueprint route](https://sailsjs.com/documentation/concepts/blueprints/blueprint-routes#?shortcut-routes), in which case you can simply include it in the query string as `?fks=[47,65]`._

### Example
Suppose you are in charge of keeping records for a large chain of grocery stores, and Dolly the cashier (employee #7) had been taking credit for being involved in a large number of purchases, when really she had only checked out two customers. Since the owner of the grocery store chain is very forgiving, Dolly gets to keep her job, but now you have to update Dolly's `involvedInPurchases` collection so that it _only_ contains purchases #47 and #65:

`PUT /employee/7/involvedInPurchases`

```json
[47, 65]
```

[![Run in Postman](https://s3.amazonaws.com/postman-static/run-button.png)](https://www.getpostman.com/run-collection/96217d0d747e536e49a4)

##### Expected response

This returns Dolly, the parent record.  Notice that her record only shows her being involved in purchases #47 and #65:

```json
{
  "id": 7,
  "name": "Dolly",
  "createdAt": 1485462079725,
  "updatedAt": 1485476060873,
  "involvedInPurchases": [
    {
      "amount": 10000,
      "createdAt": 1485551132315,
      "updatedAt": 1486355134239,
      "id": 47,
      "cashier": 7
    },
    {
      "amount": 5667,
      "createdAt": 1483551158349,
      "updatedAt": 1485355134284,
      "id": 65,
      "cashier": 7
    }
  ]
}
```

### Socket notifications

If you have WebSockets enabled for your app, then every client [subscribed](https://sailsjs.com/documentation/reference/web-sockets/resourceful-pub-sub) to the parent record will receive one [`addedTo` notification](https://sailsjs.com/documentation/reference/blueprint-api/add-to#?socket-notifications) for each child record in the new collection (if any).

For instance, continuing the example above, let's assume that Dolly's previous `involvedInPurchases` included purchases #65, #42, and #33. All clients subscribed to Dolly's employee record (_except_ for the client making the request) would receive two kinds of notifications: `addedTo` for the purchase she was not previously involved in (#47), and `removedFrom` for the purchases she is no longer involved in (#42 and #33).

```javascript
{
  id: 7,
  verb: 'addedTo',
  attribute: 'involvedInPurchases',
  addedIds: [ 47 ]
}
```

and

```javascript
{
  id: 7,
  verb: 'removedFrom',
  attribute: 'involvedInPurchases',
  removedIds: [ 42, 33 ]
}
```

> Note that purchase #65 is not included in the `addedTo` notification, since it was in Dolly's previous list of `involvedInPurchases`.

**Clients subscribed to the child records receive additional notifications:**

Assuming `involvedInPurchases` had a `via`, then either `updated` or `addedTo`/`removedFrom` notifications would also be sent to clients who were [subscribed](https://sailsjs.com/documentation/reference/web-sockets/resourceful-pub-sub) to any of the purchases we just linked or unlinked.

> If the `via`-linked attribute on the other side (Purchase) is [also plural](https://sailsjs.com/documentation/concepts/models-and-orm/associations/many-to-many) (e.g. `cashiers`), then an `addedTo` or `removedFrom` notification will be sent. Otherwise, if the `via` [points at a singular attribute](https://sailsjs.com/documentation/concepts/models-and-orm/associations/one-to-many) (e.g. `cashier`) then the [`updated` notification](https://sailsjs.com/documentation/reference/blueprint-api/update#?socket-notifications) will be sent.

**Finally, a third kind of notification might be sent:**

If giving Dolly this new collection of Purchases would "steal" any of them from other employees' `involvedInPurchases`, then any clients subscribed to those other, stolen-from employee records (e.g. Motoki, employee #12 and Timothy, employee #4) would receive `removedFrom` notifications. (See [**Blueprints > remove from**](https://sailsjs.com/documentation/reference/blueprint-api/remove-from#?socket-notifications)).


### Notes

> + Remember, this blueprint replaces the _entire_ set of associated records for the given attribute.  To add or remove a single associated record from the collection, leaving the rest of the collection unchanged, use the "add" or "remove" blueprint actions. (See [**Blueprints > add to**](https://sailsjs.com/documentation/reference/blueprint-api/add-to) and [**Blueprints > remove from**](https://sailsjs.com/documentation/reference/blueprint-api/remove-from)).


<docmeta name="displayName" value="replace">
<docmeta name="pageType" value="endpoint">
