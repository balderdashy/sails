# `.catch()`

Execute a Waterline [query instance](https://sailsjs.com/documentation/reference/waterline-orm/queries) using promises.

```usage
.catch(callback)
```

> As of Sails v1 and Node.js v8, you can take advantage of [`await`](https://sailsjs.com/documentation/reference/waterline-orm/queries) instead of using this method.

### Usage

|   |     Argument        | Type                                         | Details                            |
|---|:--------------------|----------------------------------------------|:-----------------------------------|
| 1 |   filter            | ((dictionary?))                              | An optional dictionary whose properties will be checked against the error. If they all match, then the callback will run. Otherwise, it won't.
| 2 |   callback          | ((function))                                 | A function that runs if the query fails.<br/><br/> Takes the error as its argument.


##### Callback

|   |     Argument        | Type                | Details |
|---|:--------------------|---------------------|:---------------------------------------------------------------------------------|
| 1 |   _err_             | ((Error?))          | The Error that occurred, or `undefined` if there were no errors.


### Example

To look up the user with the specified email address:

```javascript
User.findOne({
  email: req.param('email')
})
.then(function (user){
  if(!user) { return res.notFound(); }
  return res.json(user);
})
// If there was some kind of usage / validation error
.catch({ name: 'UsageError' }, function (err) {
  return res.badRequest(err);
})
// If something completely unexpected happened.
.catch(function (err) {
  return res.serverError(err);
});
```


### Notes
> + Whenever possible, it is recommended that you use `await` instead of calling this method.
> + This is an alternative to `.exec()`.  When combined with `.then()`, it provides the same functionality.
> + The `.catch()` function also returns a promise to allow for chaining.  This is not recommended for any but the most advanced users of promises due to the complex (and arguably non-intuitive) behavior of chained `.catch()` calls.
> + For more information, see the [bluebird `.catch()` api docs](http://bluebirdjs.com/docs/api/catch).



<docmeta name="displayName" value=".catch()">
<docmeta name="pageType" value="method">
