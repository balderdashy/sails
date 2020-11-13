# `.leaseConnection()`

Lease a new connection from the datastore for use in running multiple queries on the same connection (i.e. so that the logic provided in `during` can reuse the db connection).


```usage
await datastore.leaseConnection(during);
```

_Or_

+ `var result = await datastore.leaseConnection(during);`


### Usage
|   |     Argument        | Type                | Details
|---|---------------------|---------------------|:------------|
| 1 | during              | ((function))        | A [procedural parameter](https://en.wikipedia.org/wiki/Procedural_parameter) that Sails will call automatically when a connection has been obtained and made ready for you.  It will receive the arguments specified in the "During" usage table below. |

##### During
|   |     Argument        | Type                | Details
|---|---------------------|---------------------|:------------|
| 1 | db                  | ((ref))             | Your newly-leased database connection.  (See [`.usingConnection()`](https://sailsjs.com/documentation/reference/waterline-orm/models/using-connection) for more information on what to do with this.) |

> Note that prior to Sails 1.1.0, the recommended usage of `.leaseConnection()` expected your "during" code to call a callback (`proceed`) when it finished.  This is no longer necessary as long as you do not actually include a second argument in the function signature of your "during" code.

##### Result

| Type                | Details |
|---------------------|:---------------------------------------------------------------------------------|
| ((Ref?))            | The optional result data sent back from `during`.  In other words, if, in your `during` function, you did `return 'foo';`, then this will be `'foo'`. |

##### Errors

|     Name        | Type                | When? |
|:----------------|---------------------|:---------------------------------------------------------------------------------|
| UsageError      | ((Error))           | Thrown if something invalid was passed in.
| AdapterError    | ((Error))           | Thrown if something went wrong in the database adapter.
| Error           | ((Error))           | Thrown if anything else unexpected happens.

See [Concepts > Models and ORM > Errors](https://sailsjs.com/documentation/concepts/models-and-orm/errors) for examples of negotiating errors in Sails and Waterline.

### Example

Lease a database connection from the default datastore, then use it to send two queries before releasing it back to the pool.

```javascript
var inventory = await sails.getDatastore()
.leaseConnection(async (db)=> {
  var location = await Location.findOne({ id: inputs.locationId })
  .usingConnection(db);
  if (!location) {
    let err = new Error('Cannot find location with that id (`'+inputs.locationId+'`)');
    err.code = 'E_NO_SUCH_LOCATION';
    throw err;
  }

  // Get all products at the location
  var productOfferings = await ProductOffering.find({ location: inputs.locationId })
  .populate('productType')
  .usingConnection(db);

  return productOfferings;
})
.intercept('E_NO_SUCH_LOCATION', 'notFound');

// All done!  Whatever we were doing with that database connection worked.
// Now we can proceed with our business.
```


<docmeta name="displayName" value=".leaseConnection()">
<docmeta name="pageType" value="method">
