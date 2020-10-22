# `.count()`

Get the total number of records matching the specified criteria.

```usage
var numRecords = await Model.count(criteria);
```

### Usage

| # | Argument      | Type                  | Details    |
|---|---------------|:----------------------|:-----------|
| 1 | _criteria_    | ((dictionary?))       | The [Waterline criteria](https://sailsjs.com/documentation/concepts/models-and-orm/query-language) to use for matching records in the database.  Note that `count` queries do not support pagination using `skip` and `limit` or projections using `select`.


##### Result

| Type                | Description      |
|---------------------|:-----------------|
| ((number))          | The number of records from your database that match the given criteria.


##### Errors

| Name                | Type                | When?                                                        |
|:--------------------|---------------------|:-------------------------------------------------------------|
| UsageError          | ((Error))           | Thrown if something invalid was passed in.
| AdapterError        | ((Error))           | Thrown if something went wrong in the database adapter.
| Error               | ((Error))           | Thrown if anything else unexpected happens.

See [Concepts > Models and ORM > Errors](https://sailsjs.com/documentation/concepts/models-and-orm/errors) for examples of negotiating errors in Sails and Waterline.

### Example

```javascript
var total = await User.count({name:'Flynn'});
sails.log(`There ${total===1?'is':'are'} ${total} user${total===1?'':'s'} named "Flynn".`);
```

### Notes
> + This method can be used with [`await`](https://github.com/mikermcneil/parley/tree/49c06ee9ed32d9c55c24e8a0e767666a6b60b7e8#usage), promise chaining, or [traditional Node callbacks](https://sailsjs.com/documentation/reference/waterline-orm/queries/exec).


<docmeta name="displayName" value=".count()">
<docmeta name="pageType" value="method">
