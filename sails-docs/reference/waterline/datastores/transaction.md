# `.transaction()`

Fetch a preconfigured, deferred object hooked up to the sails-mysql or sails-postgresql adapter (and consequently the appropriate driver).

```usage
await datastore.transaction(during);
```

or

+ `var result = await datastore.transaction(during);`

### Usage
|   |     Argument        | Type                | Details
|---|---------------------|---------------------|:------------|
| 1 | during              | ((function))        | See parameters in the "`during` usage" table below. |

##### During
|   |     Argument        | Type                | Details
|---|---------------------|---------------------|:------------|
| 1 | db                  | ((ref))             | The leased (transactional) database connection. (See [`.usingConnection()`](https://sailsjs.com/documentation/reference/waterline-orm/queries/using-connection) for more information on what to do with this.) |

> Note that prior to Sails 1.1.0, the recommended usage of `.transaction()` expected your "during" code to call a callback (`proceed`) when it finished.  This is no longer necessary as long as you do not actually include a second argument in the function signature of your "during" code.

##### Result
| Type                | Details |
|---------------------|:---------------------------------------------------------------------------------|
|  ((Ref?))            | The optional result data sent back from `during`.  In other words, if in your `during` function you did `return 'foo';`, then this will be `'foo'`. |

##### Errors

|     Name        | Type                | When? |
|:----------------|---------------------|:---------------------------------------------------------------------------------|
| UsageError      | ((Error))           | Thrown if something invalid was passed in.
| AdapterError    | ((Error))           | Thrown if something went wrong in the database adapter.
| Error           | ((Error))           | Thrown if anything else unexpected happens.

See [Concepts > Models and ORM > Errors](https://sailsjs.com/documentation/concepts/models-and-orm/errors) for examples of negotiating errors in Sails and Waterline.


### Example

Subtract the specified amount from one user's balance and add it to another's.

```javascript
// e.g. in an action:

var flaverr = require('flaverr');

await sails.getDatastore()
.transaction(async (db)=> {

  var myAccount = await BankAccount.findOne({ owner: this.req.session.userId })
  .usingConnection(db);
  if (!myAccount) {
    throw new Error('Consistency violation: Database is corrupted-- logged in user record has gone missing');
  }

  var recipientAccount = await BankAccount.findOne({ owner: inputs.recipientId }).usingConnection(db)
  if (!recipientAccount) {
    throw flaverr('E_NO_SUCH_RECIPIENT', new Error('There is no recipient with that id'));
  }

  // Do the math to subtract from the logged-in user's account balance,
  // and add to the recipient's bank account balance.
  var myNewBalance = myAccount.balance - inputs.amount;

  // If this would put the logged-in user's account balance below zero,
  // then abort.  (The transaction will be rolled back automatically.)
  if (myNewBalance < 0) {
    throw flaverr('E_INSUFFICIENT_FUNDS', new Error('Insufficient funds'));
  }

  // Update the current user's bank account
  await BankAccount.update({ owner: this.req.session.userId })
  .set({
    balance: myNewBalance
  })
  .usingConnection(db);

  // Update the recipient's bank account
  await BankAccount.update({ owner: inputs.recipientId })
  .set({
    balance: recipientAccount.balance + inputs.amount
  })
  .usingConnection(db);
})
.intercept('E_INSUFFICIENT_FUNDS', ()=>'badRequest')
.intercept('E_NO_SUCH_RECIPIENT', ()=>'notFound');
```

> Note that the example above is just a demonstration; in practice, this kind of increment/decrement logic should also include row-level locking.  [Unsure?](https://sailsjs.com/support).

<docmeta name="displayName" value=".transaction()">
<docmeta name="pageType" value="method">
