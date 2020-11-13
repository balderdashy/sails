# `.exec()`

Execute a Waterline [query instance](https://sailsjs.com/documentation/reference/waterline-orm/queries).

```usage
.exec(function (err, result) {

})
```

> As of Sails v1 and Node.js v8, you can take advantage of [`await`](https://sailsjs.com/documentation/reference/waterline-orm/queries) instead of using this method.

### Usage

|   |     Argument        | Type                                         | Details                            |
|---|:--------------------|----------------------------------------------|:-----------------------------------|
| 1 |    callback         | ((function))                                 | The Node-style callback that will be called when the query completes, successfully or otherwise.

##### Callback

|   |     Argument        | Type                | Details |
|---|:--------------------|---------------------|:---------------------------------------------------------------------------------|
| 1 |    _err_            | ((Error?))          | The Error that occurred, or `undefined` if there were no errors.
| 2 |    _result_         | ((Ref?))            | The result from the database, if any.  Exact data type depends on the query.  If an error occurred (i.e. `err` is truthy), then this result argument should be ignored.





### Example

```javascript
Zookeeper.find().exec((err, zookeepers)=>{
  if (err) {
    return res.serverError(err);
  }

  // would you look at all those zookeepers?
  return res.json(zookeepers);
});
//
// (don't put code out here)
```


### Notes
> + If you don't run `.exec()` or use promises, your query will not execute. For help using `.exec()` with model methods like `.find()`, read more about the [chainable query object](https://sailsjs.com/documentation/reference/waterline-orm/queries).




<docmeta name="displayName" value=".exec()">
<docmeta name="pageType" value="method">

