# `.tolerate()`

Tolerate (swallow) the specified error, and return a new result value (or `undefined`) instead.  (Don't throw.)

```usage
.tolerate(filter, handler)
```

_Or:_
+ `.tolerate(filter)`
+ `.tolerate(handler)` _(to tolerate all errors)_


### Usage
|   |     Argument    | Type                | Details    |
|---|-----------------|---------------------|:-----------|
| 1 | filter          | ((string)) or ((dictionary)) | The code of the error that you want to intercept, or a dictionary of criteria for identifying the error to intercept. |
| 2 | _handler_       | ((function?))        | An optional [procedural parameter](https://en.wikipedia.org/wiki/Procedural_parameter), called automatically by Sails if the anticipated error is thrown.  It receives the argument specified in the "Handler" usage table below. If specified, the handler should return a value that will be used as the result. If omitted, the anticipated error will be swallowed and the result of the query will be `undefined`. |

##### Handler
|   |     Argument        | Type                | Details
|---|---------------------|---------------------|:------------------------|
| 1 | err                 | ((Error))           | Your anticipated Error. |

> `.tolerate()` is useful for tolerating a kind of error (or all errors). If you chain on `.tolerate()` and it matches the error that occurs, then the underlying logic won't throw. Instead, it returns the return value of the handler function you passed into .tolerate().




### Example

Say you're building an address book that doesn't allow records with duplicate email addresses. To instead swallow the error caused by entering a non-unique email address and update the existing contact:

```javascript
let newOrExistingContact = await Contact.create({
  emailAddress,
  fullName
})
.fetch()
.tolerate('E_UNIQUE');

if(!newOrExistingContact) {
  newOrExistingContact = await Contact.updateOne({ emailAddress })
  .set({ fullName })
  .fetch();
}
```



<docmeta name="displayName" value=".tolerate()">
<docmeta name="pageType" value="method">
