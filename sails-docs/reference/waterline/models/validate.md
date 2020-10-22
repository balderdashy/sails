# `.validate()`

Verify that a value would be valid for a given attribute, then return it, loosely coerced.

```usage
Something.validate(attrName, value);
```

> This validates (and potentially coerces) the provided data as if it was one of the values passed into [`.update()`](https://sailsjs.com/documentation/reference/waterline-orm/models/update).  You might think about it like a "dry run".

### Usage

| # | Description   | Accepted Data Types          | Required ? |
|---|---------------|------------------------------|:-----------|
| 1 | attrName      | ((string))                   | The name of the attribute to validate against. |
| 2 | value         | ((ref))                      | The value to validate/normalize. |

### Example

Check the given string and return a normalized version.
> Note that if normalization is not possible, this throws an error.  **Be careful: You must manually handle any error thrown from within an asynchronous callback.**

```javascript
User.validate('emailAddress', req.param('email'));
User.validate('password', req.param('password'));
```

##### Negotiating errors

The `.validate()` method can throw any of the usage errors you might see when calling `.update()`.  For example:

```javascript
try {
  var normalizedBalance = BankAccount.validate('balance', '$349.86');
} catch (err) {
  switch (err.code) {
    case 'E_VALIDATION':
      // => '[Error: Invalid `bankAccount`]'
      _.each(e.all, function(woe){
        sails.log(woe.attrName+': '+woe.message);
      });
      break;
    default:
      throw err;
  }
}
```

### Notes
> + This is a synchronous method, so you don't need to use `await`, promise chaining, or traditional Node callbacks.
> + `.validate()` is exposed as a separate method for convenience.  You can always simply call `.create()` or `.update()`, _instead_ of calling `.validate()` first, since those model methods apply the same checks automatically.
> + `.validate()` is useful when implementing use cases where it is beneficial or more aesthetically pleasing (/[DRY](https://en.wikipedia.org/wiki/Don't_repeat_yourself)) to reuse your model validations for other purposes.  For example, you might want to validate some untrusted data before communicating with a 3rd party API like Mailgun or Stripe, or you might just want to run certain model validations initially to make some code easier to reason about.
> + `.validate()` does not communicate with the database, and thus it only detects _logical failures_ such as type safety errors and high-level validation rule violations.  It cannot detect problems with _physical-layer_ constraints like uniqueness, since those constraints are checked by the underlying database, not by Sails or Waterline.


<docmeta name="displayName" value=".validate()">
<docmeta name="pageType" value="method">
