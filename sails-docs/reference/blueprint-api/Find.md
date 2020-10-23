# Find (blueprint)

Find a list of records that match the specified criteria and (if possible) subscribe to each of them.

```usage
GET /:model
```

Results may be filtered, paginated, and sorted based on the blueprint configuration and/or parameters sent in the request.

If the action was triggered via a socket request, the requesting socket will be "subscribed" to all records returned. If any of the returned records are subsequently updated or deleted, a message will be sent to that socket's client informing them of the change. See the [docs for Model.subscribe()](https://sailsjs.com/documentation/reference/web-sockets/resourceful-pub-sub/subscribe) for details.


### Parameters

 Parameter      | Type         | Details
 -------------- | ------------ |:---------------------------------
 model          | ((string))   | The [identity](https://sailsjs.com/documentation/concepts/models-and-orm/model-settings#?identity) of the containing model.<br/><br/>e.g. `'purchase'` (in `GET /purchase`)
 _*_              | ((string?))   | To filter results based on a particular attribute, specify a query parameter with the same name as the attribute defined on your model. <br/> <br/> For instance, if our `Purchase` model has an **amount** attribute, we could send `GET /purchase?amount=99.99` to return a list of $99.99 purchases.
 _where_          | ((string?))   | Instead of filtering based on a specific attribute, you may instead choose to provide a `where` parameter with the WHERE piece of a [Waterline criteria](https://sailsjs.com/documentation/concepts/models-and-orm/query-language), _encoded as a JSON string_.  This allows you to take advantage of `contains`, `startsWith`, and other sub-attribute criteria modifiers for more powerful `find()` queries. <br/> <br/> e.g. `?where={"name":{"contains":"theodore"}}`
 _limit_          | ((number?))   | The maximum number of records to send back (useful for pagination). Defaults to 30. <br/> <br/> e.g. `?limit=100`
 _skip_           | ((number?))   | The number of records to skip (useful for pagination). <br/> <br/> e.g. `?skip=30`
 _sort_           | ((string?))   | The sort order. By default, returned records are sorted by primary key value in ascending order. <br/> <br/> e.g. `?sort=lastName%20ASC`
 _select_         | ((string?))   | The attributes to include each record in the result, specified as a comma-delimited list.  By default, all attributes are selected.  Not valid for plural (&ldquo;collection&rdquo;) association attributes.<br/> <br/> e.g. `?select=name,age`.
 _omit_           | ((string?))   | The attributes to exclude from each record in the result, specified as a comma-delimited list.  Cannot be used in conjuction with `select`.    Not valid for plural (&ldquo;collection&rdquo;) association attributes.<br/> <br/> e.g. `?omit=favoriteColor,address`.
 _populate_       | ((string))    | If specified, overide the default automatic population process. Accepts a comma-separated list of attribute names for which to populate record values, or specify `false` to have no attributes populated. See [here](https://sailsjs.com/documentation/concepts/models-and-orm/records#?populated-values) for more information on how the population process fills out attributes in the returned list of records according to the model's defined associations.



### Example

Find up to 30 of the newest purchases in our database:

```text
GET /purchase?sort=createdAt DESC&limit=30
```

[![Run in Postman](https://s3.amazonaws.com/postman-static/run-button.png)](https://www.getpostman.com/run-collection/96217d0d747e536e49a4)

##### Expected response

e.g.
```json
[
 {
   "amount": 49.99,
   "id": 1,
   "createdAt": 1485551132315,
   "updatedAt": 1485551132315
 },
 {
   "amount": 99.99,
   "id": 47,
   "createdAt": 1485551158349,
   "updatedAt": 1485551158349
 }
]
```


##### Using jQuery

> See [jquery.com](http://jquery.com/) for more documentation.

```javascript
$.get('/purchase?sort=createdAt DESC', function (purchases) {
  console.log(purchases);
});
```


##### Using sails.io.js

> See [sails.io.js](https://sailsjs.com/documentation/reference/web-sockets/socket-client) for more documentation.

```javascript
io.socket.get('/purchase?sort=createdAt DESC', function (purchases) {
  console.log(purchases);
});
```

##### Using Angular

> See [Angular](https://angularjs.org/) for more documentation.

```javascript
$http.get('/purchase?sort=createdAt DESC')
.then(function (res) {
  var purchases = res.data;
  console.log(purchases);
});
```


##### Using cURL

> You can read more about [cURL on Wikipedia](http://en.wikipedia.org/wiki/CURL).

```bash
curl http://localhost:1337/purchase?sort=createdAt%20DESC
```


### Notes

> + The example above assumes "rest" blueprints are enabled, and that your project contains a `Purchase` model.  You can quickly achieve this by running:
>
>   ```bash
>   $ sails new foo
>   $ cd foo
>   $ sails generate model purchase
>   $ sails lift
>     # You will see a prompt about database auto-migration settings.
>     # Just choose 1 (alter) and press <ENTER>.
>   ```


<docmeta name="displayName" value="find where">
<docmeta name="pageType" value="endpoint">

