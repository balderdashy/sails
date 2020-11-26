# Populate (blueprint)

Populate and return foreign record(s) for the given association of this record.


```usage
GET /:model/:id/:association
```

If the specified association is plural ("collection"), this action returns the list of associated records as a JSON-encoded array of dictionaries (plain JavaScript objects).  If the specified association is singular ("model"), this action returns the associated record as a JSON-encoded dictionary.


  Parameter      | Type         | Details
 :-------------- | ------------ |:---------------------------------
 model           | ((string))   | The [identity](https://sailsjs.com/documentation/concepts/models-and-orm/model-settings#?identity) of the containing model.<br/><br/>e.g. `'purchase'` (in `GET /purchase/47/cashier`)
 id              | ((string))   | The primary key of the parent record.<br/><br/>e.g. `'47'` (in `GET /purchase/47/cashier`)
 association     | ((string))   | The name of the association.<br/><br/>e.g. `'cashier'` (in `GET /purchase/47/cashier`) or `'products'` (in `GET /purchase/47/products`)
 _where_          | ((string?))   | Instead of filtering based on a specific attribute, you may instead choose to provide a `where` parameter with the WHERE piece of a [Waterline criteria](https://sailsjs.com/documentation/concepts/models-and-orm/query-language), _encoded as a JSON string_.  This allows you to take advantage of `contains`, `startsWith`, and other sub-attribute criteria modifiers for more powerful `find()` queries. <br/> <br/> e.g. `?where={"name":{"contains":"theodore"}}`
 _limit_          | ((number?))   | The maximum number of records to send back (useful for pagination). Defaults to 30. <br/> <br/> e.g. `?limit=100`
 _skip_           | ((number?))   | The number of records to skip (useful for pagination). <br/> <br/> e.g. `?skip=30`
 _sort_           | ((string?))   | The sort order. By default, returned records are sorted by primary key value in ascending order. <br/> <br/> e.g. `?sort=lastName%20ASC`
 _select_         | ((string?))   | The attributes to include in each record in the result, specified as a comma-delimited list.  By default, all attributes are selected.  Not valid for plural (&ldquo;collection&rdquo;) association attributes.<br/> <br/> e.g. `?select=name,age`.
 _omit_           | ((string?))   | The attributes to exclude from each record in the result, specified as a comma-delimited list.  Cannot be used in conjuction with `select`.    Not valid for plural (&ldquo;collection&rdquo;) association attributes.<br/> <br/> e.g. `?omit=favoriteColor,address`.


### Example

Populate the `cashier` who conducted purchase #47:

```text
`GET /purchase/47/cashier`
```

[![Run in Postman](https://s3.amazonaws.com/postman-static/run-button.png)](https://www.getpostman.com/run-collection/96217d0d747e536e49a4)

##### Expected response

```json
{
  "name": "Dolly",
  "id": 7,
  "createdAt": 1485462079725,
  "updatedAt": 1485476060873,
}
```

**Using [jQuery](http://jquery.com/):**

```javascript
$.get('/purchase/47/cashier', function (cashier) {
  console.log(cashier);
});
```

**Using [Angular](https://angularjs.org/):**

```javascript
$http.get('/purchase/47/cashier')
.then(function (cashier) {
  console.log(cashier);
});
```

**Using [sails.io.js](https://sailsjs.com/documentation/reference/web-sockets/socket-client):**

```javascript
io.socket.get('/purchase/47/cashier', function (cashier) {
  console.log(cashier);
});
```

**Using [cURL](http://en.wikipedia.org/wiki/CURL):**

```bash
curl http://localhost:1337/purchase/47/cashier
```

### Populating a collection

You can also populate a collection. For example, to populate the `involvedInPurchases` of employee #7:

`GET /employee/7/involvedInPurchases`

##### Expected response

```json
[
  {
    "amount": 10000,
    "createdAt": 1485476060873,
    "updatedAt": 1485476060873,
    "id": 47,
    "cashier": 7
  },
  {
    "amount": 50,
    "createdAt": 1487015460792,
    "updatedAt": 1487015476357,
    "id": 52,
    "cashier": 7
  }
]
```



### Notes

> + In the first example above, if purchase #47 did not have a `cashier` (i.e. `null`), then this action would respond with a 404 status code.
> + The examples above assume "rest" blueprint routing is enabled (or that you've bound this blueprint action as a comparable [custom route](https://sailsjs.com/documentation/concepts/routes/custom-routes)), and that your project contains at least an empty `Employee` model as well as a `Purchase` model, and that `Employee` has the association attribute: `involvedInPurchases: {model: 'Purchase'}` and that `Purchase` has `cashier: {model: 'Employee'}`.  You can quickly achieve this by running:
>
>   ```shell
>   $ sails new foo
>   $ cd foo
>   $ sails generate model purchase
>   $ sails generate model employee
>   ```
> ...then editing `api/models/Employee.js` and `api/models/Purchase.js`.


<docmeta name="displayName" value="populate where">
<docmeta name="pageType" value="endpoint">

