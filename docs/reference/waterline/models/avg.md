# `.avg()`

Get the aggregate mean of the specified attribute across all matching records.

```usage
var average = await Something.avg(numericAttrName, criteria);
```

### Usage

|   |     Argument        | Type                                         | Details                            |
|---|:--------------------|----------------------------------------------|:-----------------------------------|
| 1 |  numericAttrName    | ((string))                                   | The name of the numeric attribute whose mean will be calculated.
| 2 |  _criteria_         | ((dictionary?))                                | The [Waterline criteria](https://sailsjs.com/documentation/concepts/models-and-orm/query-language) to use for matching records in the database. If no criteria is specified, the average will be computed across _all_ of this model's records. `avg` queries do not support pagination using `skip` and `limit` or projections using `select`.


##### Result

| Type                | Description      |
|---------------------|:-----------------|
| ((number))          | The aggregate mean of the specified attribute across all matching records.


##### Errors

|     Name        | Type                | When? |
|:----------------|---------------------|:---------------------------------------------------------------------------------|
| UsageError       | ((Error))          | Thrown if something invalid was passed in.
| AdapterError     | ((Error))          | Thrown if something went wrong in the database adapter.
| Error            | ((Error))          | Thrown if anything else unexpected happens.

See [Concepts > Models and ORM > Errors](https://sailsjs.com/documentation/concepts/models-and-orm/errors) for examples of negotiating errors in Sails and Waterline.


### Example

Get the average balance of bank accounts owned by people between the ages of 35 and 45.

```javascript
var averageBalance = await BankAccount.avg('balance')
.where({
  ownerAge: { '>=': 35, '<=': 45 }
});
```

### Notes
> + This method can be used with [`await`](https://github.com/mikermcneil/parley/tree/49c06ee9ed32d9c55c24e8a0e767666a6b60b7e8#usage), promise chaining, or [traditional Node callbacks](https://sailsjs.com/documentation/reference/waterline-orm/queries/exec).
> + Some databases like MySQL may return `null` for this kind of query, however it's best practice for Sails/Waterline adapter authors to return `0` for consistency and type safety in app-level code.

<docmeta name="displayName" value=".avg()">
<docmeta name="pageType" value="method">
