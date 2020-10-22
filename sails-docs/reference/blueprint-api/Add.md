# Add (blueprint)

Add a foreign record (e.g. a comment) to one of this record's collections (e.g. "comments").

```usage
PUT /:model/:id/:association/:fk
```

This action adds a reference to some other record (the "foreign", or "child" record) onto a particular collection of this record (the "primary", or "parent" record).

+ If the specified `:id` does not correspond with a primary record that exists in the database, this responds using `res.notFound()`.
+ If the specified `:fk` does not correspond with a foreign record that exists in the database, this responds using `res.notFound()`.
+ If the primary record is already associated with this foreign record, this action will not modify any records.  (Note that currently, in the case of a many-to-many association, it _will_ add duplicate junction records!  To resolve this, add a multi-column index at the database layer, if possible.  We are currently working on a friendlier solution/default for users of MongoDB, sails-disk, and other NoSQL databases.)
+ Note that if the association is "2-way" (meaning it has `via`), then the foreign key or collection it points to with that `via` will also be updated on the foreign record.


### Parameters

 Parameter                          | Type                                    | Details
:-----------------------------------| --------------------------------------- |:---------------------------------
 model          | ((string))   | The [identity](https://sailsjs.com/documentation/concepts/models-and-orm/model-settings#?identity) of the containing model for the parent record.<br/><br/>e.g. `'employee'` (in `/employee/7/involvedinPurchases/47`)
 id                | ((string))    | The desired parent record's primary key value.<br/><br/>e.g. `'7'` (in `/employee/7/involvedInPurchases/47`)
 association       | ((string))                             | The name of the collection attribute.<br/><br/>e.g. `'involvedInPurchases'`
 fk | ((string))    | The primary key value (usually id) of the child record to add to this collection.<br/><br/>e.g. `'47'`


### Example

Add purchase #47 to the list of purchases that Dolly (employee #7) has been involved in:

```
PUT /employee/7/involvedInPurchases/47
```

[![Run in Postman](https://s3.amazonaws.com/postman-static/run-button.png)](https://www.getpostman.com/run-collection/96217d0d747e536e49a4)

##### Expected response

This returns "Dolly", the parent record.  Notice she is now involved in purchase #47:

```json
{
  "id": 7,
  "name": "Dolly",
  "createdAt": 1485462079725,
  "updatedAt": 1485476060873,
  "involvedInPurchases": [
    {
      "amount": 10000,
      "createdAt": 1485476060873,
      "updatedAt": 1485476060873,
      "id": 47,
      "cashier": 7
    }
  ]
}
```


##### Using jQuery

```javascript
$.put('/employee/7/involvedInPurchases/47', function (purchases) {
  console.log(purchases);
});
```

##### Using Angular

```javascript
$http.put('/employee/7/involvedInPurchases/47')
.then(function (purchases) {
  console.log(purchases);
});
```

##### Using sails.io.js

```javascript
io.socket.put('/employee/7/involvedInPurchases/47', function (purchases) {
  console.log(purchases);
});
```

##### Using [cURL](http://en.wikipedia.org/wiki/CURL)

```bash
curl http://localhost:1337/employee/7/involvedInPurchases/47 -X "PUT"
```


### Socket notifications

If you have WebSockets enabled for your app, then every client [subscribed](https://sailsjs.com/documentation/reference/web-sockets/resourceful-pub-sub) to the primary record will receive a notification in which the notification event name is the primary model identity (e.g. `'employee'`), and the message has the following format:

```usage
id: <the parent record primary key value>,
verb: 'addedTo',
attribute: <the parent record collection attribute name>,
addedIds: <the now-added child records' primary key values>
```

For instance, continuing the example above, all clients subscribed to Dolly, aka employee #7, (_except_ for the client making the request) would receive the following message:

```javascript
{
  id: 7,
  verb: 'addedTo',
  attribute: 'involvedInPurchases',
  addedIds: [ 47 ]
}
```

**Clients subscribed to the child record receive an additional notification:**

Assuming `involvedInPurchases` had a `via`, then either `updated` or `addedTo` notifications would also be sent to any clients who were [subscribed](https://sailsjs.com/documentation/reference/web-sockets/resourceful-pub-sub) to purchase #47, the child record we just added.

> If the `via`-linked attribute on the other side is [also plural](https://sailsjs.com/documentation/concepts/models-and-orm/associations/many-to-many) (e.g. `cashiers`), then another `addedTo` notification will be sent. Otherwise, if the `via` [points at a singular attribute](https://sailsjs.com/documentation/concepts/models-and-orm/associations/one-to-many) (e.g. `cashier`) then the [`updated` notification](https://sailsjs.com/documentation/reference/blueprint-api/update#?socket-notifications) will be sent.

**Finally, a third notification might be sent:**

If adding this purchase to Dolly's collection would "steal" it from another employee's `involvedInPurchases`, then any clients subscribed to that other, stolen-from employee record (e.g. Motoki, employee #12) would receive a `removedFrom` notification (see [**Blueprints > remove from**](https://sailsjs.com/documentation/reference/blueprint-api/remove-from#?socket-notifications).


### Notes

> + If you'd like to spend some more time with Dolly, a more detailed walkthrough related to the example above is available [here](https://gist.github.com/mikermcneil/e5a20b03be5aa4e0459b).
> + This action is for dealing with _plural_ ("collection") attributes.  If you want to set or unset a _singular_ ("model") attribute, just use [update](https://sailsjs.com/documentation/reference/blueprint-api/update) and set the foreign key to the id of the new foreign record (or `null` to clear the association).
> If you want to completely _replace_ the set of records in the collection with another set, use the [replace](https://sailsjs.com/documentation/reference/blueprint-api/replace) blueprint.
> + The example above assumes "rest" blueprints are enabled, and that your project contains at least an 'Employee' model with attribute: `involvedInPurchases: {collection: 'Purchase', via: 'cashier'}` as well as a `Purchase` model with attribute: `cashier: {model: 'Employee'}`.  You can quickly achieve this by running:
>
>   ```shell
>   $ sails new foo
>   $ cd foo
>   $ sails generate model purchase
>   $ sails generate model employee
>   ```
>
> ...then editing `api/models/Purchase.js` and `api/models/Employee.js`.


<docmeta name="displayName" value="add to">
<docmeta name="pageType" value="endpoint">
