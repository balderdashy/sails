# Errors

When a call to any model method or helper fails, Sails throws a [JavaScript Error instance](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) whose properties can be useful in diagnosing what went wrong.

Waterline normalizes these Error instances, classifying them with consistent `err.name` values and, when applicable, `err.code`:

```js
try {
  await Something.create({…});
} catch (err) {
  // err.name
  // err.code
  // …
}
```


### Negotiating errors

Catch-all error handling, while better than nothing, often just isn't enough. (There's a big difference between "that is not a valid username" and "we aren't able to create new users at all right now".)  In order to negotiate the different kinds of errors appropriately, you'll need to be able to examine them in a granular way.

Fortunately, Sails provides some syntactic sugar for doing this out of the box, without resorting to try… catch: [.intercept()](https://sailsjs.com/documentation/reference/waterline-orm/queries/intercept) and [.tolerate()](https://sailsjs.com/documentation/reference/waterline-orm/queries/tolerate).

```javascript
await Something.create({…})
.intercept((err)=>{
 // Return a modified error here (or a special exit signal)
 // and .create() will throw that instead
 err.message = 'Uh oh: '+err.message;
 return err;
});
```


| Property       | Type          | Details            |
|:---------------|---------------|:-------------------|
| name           | ((string))    | The broad classification of the error. <br/><br/> e.g.`'UsageError'`     |
| message        | ((string))    | <em>See [.message](https://nodejs.org/dist/latest/docs/api/errors.html#errors_error_message).</em> |
| stack          | ((string))    | <em>See [.stack](https://nodejs.org/dist/latest/docs/api/errors.html#errors_error_stack).<em>     |
| _code_         | ((string?))   | A narrower classification of the error that is sometimes included.<br/><br/>e.g. `'E_UNIQUE'`       |

When using code that interacts with Waterline (usually through model methods) there are a few different kinds of error you may encounter.


### Usage errors

When an error has `name: 'UsageError'`, this indicates that a Waterline method was used incorrectly, or executed with invalid options (for example, attempting to create a new record that would violate one of your model's [high-level validation rules](https://sailsjs.com/documentation/concepts/models-and-orm/validations#?validation-rules).)

This sort of error can come from any model method.

```
err.name === 'UsageError'
```

### Adapter errors

Adapter errors usually indicate a problem in the underlying adapter, and not in the request itself. This can happen when a database goes offline, when there is a permission issue, because of some database-specific edge case, or (more rarely) a bug in the adapter. This kind of error will have `name: 'AdapterError'`.

This sort of error can come from any model method.

```
err.name === 'AdapterError'
```


##### E_UNIQUE

A uniqueness error occurs when a value that _should_ be unique matches that of another record in the database. While this is considered an adapter error, it has its own `code` to differentiate it from a normal adapter error: `code: 'E_UNIQUE'`.

This sort of error can only come from the `.create()`, `.update()`, `.addToCollection()`, and `.replaceCollection()` model methods.

```
err.code === 'E_UNIQUE'
```

### Examples

The exact strategy you use to do this in your Sails app depends on whether you're using `await`, promises, or callbacks.

##### Negotiating errors with `await`

To handle the different errors that may occur when attempting to create a new user from within an action:

```javascript
await User.create({ emailAddress: inputs.emailAddress })
// Uniqueness constraint violation
.intercept('E_UNIQUE', (err)=> {
  return 'emailAlreadyInUse';
})
// Some other kind of usage / validation error
.intercept({name:'UsageError'}, (err)=> {
  return 'invalid';
});
// If something completely unexpected happened, the error will be thrown as-is.

return exits.success();
```

##### Negotiating errors with callbacks or promise chaining

If you're not able to use `await` because you're using Node.js <= v7.9, then prepare yourself: error handling works a bit differently when [using callbacks or promise chaining](https://github.com/mikermcneil/parley/tree/49c06ee9ed32d9c55c24e8a0e767666a6b60b7e8#flow-control) instead of `await`.

> Please use `await` if at all possible!  It is much safer for your app, your code will be cleaner, and you will be happier.

For example, if you're using promise chaining, here's how you might handle the different errors that could occur when attempting to create a new user:

```javascript
User.create({
  emailAddress: req.param('emailAddress')
})
.then(function (){
  res.ok();
})
// Uniqueness constraint violation
.catch({ code: 'E_UNIQUE' }, function (err) {
  res.sendStatus(409);
})
// Some other kind of usage / validation error
.catch({ name: 'UsageError' }, function (err) {
  res.badRequest();
})
// If something completely unexpected happened.
.catch(function (err) {
  res.serverError(err);
});
```

Here's the same example, but written with traditional Node.js callbacks instead of promise chaining:

```javascript
User.create({
  emailAddress: req.param('emailAddress')
})
.exec(function (err){
  if (err && err.code === 'E_UNIQUE') {
    return res.sendStatus(409);
  } else if (err && err.name === 'UsageError') {
    return res.badRequest();
  } else if (err) {
    return res.serverError(err);
  }

  return res.ok();
});
```

> But beware [uncaught exceptions](https://github.com/mikermcneil/parley/tree/49c06ee9ed32d9c55c24e8a0e767666a6b60b7e8#handling-uncaught-exceptions)!


<docmeta name="displayName" value="Errors">
