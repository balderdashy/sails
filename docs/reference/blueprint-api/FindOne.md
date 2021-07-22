# Find one (blueprint)

Look up the record with the specified `id` from the database, and (if possible) subscribe to the record in order to hear about any future changes.

```usage
GET /:model/:id
```


The **findOne()** blueprint action returns a single record from the model (given by `:model`) as a JSON object. The specified `id` is the [primary key](http://en.wikipedia.org/wiki/Unique_key) of the desired record.

If the action was triggered via a socket request, the requesting socket will be "subscribed" to the returned record. If the record is subsequently updated or deleted, a message will be sent to that socket's client informing them of the change. See the [.subscribe()](https://sailsjs.com/documentation/reference/web-sockets/resourceful-pub-sub/subscribe) docs for more info.


### Parameters

 Parameter                          | Type                                    | Details
 ---------------------------------- | --------------------------------------- |:---------------------------------
 model          | ((string))   | The [identity](https://sailsjs.com/documentation/concepts/models-and-orm/model-settings#?identity) of the containing model.<br/><br/>e.g. `'purchase'` (in `/purchase/7`)
 id                | ((string))    | The desired target record's primary key value<br/><br/>e.g. `'7'` (in `/purchase/7`).
 _populate_       | ((string?))    | If specified, overide the default automatic population process. Accepts a comma-separated list of attribute names for which to populate record values, or specify `false` to have no attributes populated. See [here](https://sailsjs.com/documentation/concepts/models-and-orm/records#?populated-values) for more information on how the population process fills out attributes in the returned record according to the model's defined associations.
 _select_         | ((string?))   | The attributes to include in the result, specified as a comma-delimited list.  By default, all attributes are selected.  Not valid for plural (&ldquo;collection&rdquo;) association attributes.<br/> <br/> e.g. `?select=name,age`.
 _omit_           | ((string?))   | The attributes to exclude from the result, specified as a comma-delimited list.  Cannot be used in conjuction with `select`.    Not valid for plural (&ldquo;collection&rdquo;) association attributes.<br/> <br/> e.g. `?omit=favoriteColor,address`.


### Example
Find the purchase with id #1:

```text
GET /purchase/1
```

[![Run in Postman](https://s3.amazonaws.com/postman-static/run-button.png)](https://www.getpostman.com/run-collection/96217d0d747e536e49a4)

##### Expected Response

 ```json
 {
   "amount": 49.99,
   "id": 1,
   "createdAt": 1485551132315,
   "updatedAt": 1485551132315
 }
 ```


<docmeta name="displayName" value="find one">
<docmeta name="pageType" value="endpoint">

