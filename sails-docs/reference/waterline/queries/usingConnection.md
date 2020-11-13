# `.usingConnection()`

Specify an existing database connection to use for this [query](https://sailsjs.com/documentation/reference/waterline-orm/queries).

```usage
.usingConnection(connection);
```

### Usage

|   |     Argument        | Type                                         | Details                            |
|---|:--------------------|----------------------------------------------|:-----------------------------------|
| 1 |   connection        | ((ref))                                      | An existing database connection obtained using [`.transaction()`](https://sailsjs.com/documentation/reference/waterline-orm/datastores/transaction) or [`.leaseConnection()`](https://sailsjs.com/documentation/reference/waterline-orm/datastores/lease-connection).

### Example

An example of `.usingConnection()` usage can be found in the example for [`.transaction()`](https://sailsjs.com/documentation/reference/waterline-orm/datastores/transaction#?example).


<docmeta name="displayName" value=".usingConnection()">
<docmeta name="pageType" value="method">
