# `res.negotiate()`

> _**This method is deprecated**._
>
> You should use a [custom response](https://sailsjs.com/documentation/concepts/extending-sails/custom-responses) instead.
>
> To handle errors from [Waterline model methods](https://sailsjs.com/documentation/reference/waterline-orm/models), check the `name` property of the error (see the [Waterline error reference](https://sailsjs.com/documentation/concepts/models-and-orm/errors) for more details).

Given an error (`err`), attempt to guess which error response should be called (`badRequest`, `forbidden`, `notFound`, or `serverError`) by inspecting the `status` property.  If `err` is not a dictionary, or the `status` property does not match a known HTTP status code, then default to `serverError`.

Especially handy for handling potential validation errors from [Model.create()](https://sailsjs.com/documentation/reference/waterline-orm/models/create) or [Model.update()](https://sailsjs.com/documentation/reference/waterline-orm/models/update).

### Usage

```usage
return res.negotiate(err);
```

### Details

Like the other built-in custom response modules, the behavior of this method is customizable.

`res.negotiate()` examines the provided error (`err`) and determines the appropriate error-handling behavior from one of the following methods:

+ [`res.badRequest()`](https://sailsjs.com/documentation/reference/response-res/res-bad-request)   (400)
+ [`res.forbidden()`](https://sailsjs.com/documentation/reference/response-res/res-forbidden)    (403)
+ [`res.notFound()`](https://sailsjs.com/documentation/reference/response-res/res-not-found)     (404)
+ [`res.serverError()`](https://sailsjs.com/documentation/reference/response-res/res-server-error)  (500)

The determination is made based on `err`'s "status" property.  If a more specific diagnosis cannot be determined (e.g. `err` doesn't have a "status" property, or it's a string), Sails will default to `res.serverError()`.



### Example


```javascript
// Add Fido's birthday to the database:
Pet.update({name: 'fido'})
  .set({birthday: new Date('01/01/2010')})
  .exec(function (err, fido) {
    if (err) return res.negotiate(err);
    return res.ok(fido);
  });
```


### Notes
> + This method is **terminal**, meaning it is generally the last line of code your app should run for a given request (hence the advisory usage of `return` throughout these docs).
>+ `res.negotiate()` (like other userland response methods) can be overridden - just define a response module (`/responses/negotiate.js`) and export a function definition.
>+ This method is used as the default handler for uncaught errors in Sails.  That means it is called automatically if an error is thrown in _any_ request handling code, _but only within the initial step of the event loop_.  You should always specifically handle errors that might arise in callbacks/promises from asynchronous code.

<docmeta name="isDeprecated" value="true">





<docmeta name="displayName" value="res.negotiate()">
<docmeta name="pageType" value="method">

