# `req.allParams()`

Returns the value of _all_ parameters sent in the request, merged into a single dictionary (plain JavaScript object). Includes parameters parsed from the URL path, the request body, and the query string, _in that order_. See [`req.param()`](https://sailsjs.com/documentation/reference/request-req/req-param) for details.

### Usage

```usage
req.allParams();
```


### Example

Update the product with the specified `sku`, setting new values using the parameters that were passed in:

```javascript
var values = req.allParams();

// Don't allow `price` or `isAvailable` to be edited.
delete values.price;
delete values.isAvailable;

// At this point, `values` might look something like this:
// values ==> { displayName: 'Bubble Trouble Bubble Bath' }

Product.update({sku: sku})
.set(values)
.exec(function (err, newProduct) {
  // ...
});
```

### Notes

>+ The order of precedence means that URL path params override request body params, which will override query string params.
>+ In past versions of Sails, this method was known as `req.params.all()`, but this could be confusing&mdash;what if you had a route path parameter named "all"?  In apps built on Sails v1 or later, you should use `req.allParams()` in favor of `req.params.all()` to avoid such a situation.



<docmeta name="displayName" value="req.allParams()">
<docmeta name="pageType" value="method">

