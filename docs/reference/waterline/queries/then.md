# `.then()`

Execute a Waterline [query instance](https://sailsjs.com/documentation/reference/waterline-orm/queries) using promises.

```usage
.then(callback)
```

> As of Sails v1 and Node.js v8, you can take advantage of [`await`](https://sailsjs.com/documentation/reference/waterline-orm/queries) instead of using this method.


### Usage

|   |     Argument        | Type                                         | Details                            |
|---|:--------------------|----------------------------------------------|:-----------------------------------|
| 1 |   callback          | ((function))                                 | A function that runs if the query successfully completes<br/><br/> Takes the result of the query as its argument.


##### Callback

|   |     Argument        | Type                | Details |
|---|:--------------------|---------------------|:---------------------------------------------------------------------------------|
| 1 |    _result_         | ((Ref?))            | The result from the database, if any.  Exact data type depends on the query.


### Example

To look up the user with the specified email address:

```javascript
User.findOne({
  email: req.param('email')
})
.then(function (user){
  if (!user) { return res.notFound(); }
  return res.json(user);
})
.catch(function (err) { return res.serverError(err); });
```


### Notes
> + Whenever possible, it is recommended that you use `await` instead of calling this method.
> + This is an alternative to `.exec()`.  When combined with `.catch()`, it provides the same functionality.
> + The `.then()` function returns a promise to allow for chaining.
> + For more information, see the [bluebird `.then()` api docs](http://bluebirdjs.com/docs/api/then).




<docmeta name="displayName" value=".then()">
<docmeta name="pageType" value="method">
