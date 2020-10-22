# `.findOne()`

Attempt to find a particular record in your database that matches the given criteria.

```usage
var record = await Something.findOne(criteria);
```

### Usage

|   |     Argument        | Type                                         | Details                            |
|---|:--------------------|----------------------------------------------|:-----------------------------------|
| 1 |    criteria         | ((dictionary))                               | The [Waterline criteria](https://sailsjs.com/documentation/concepts/models-and-orm/query-language) to use for matching this record in the database.  (This criteria must never match more than one record.) `findOne` queries do not support pagination using `skip` or `limit`.

##### Result

| Type                | Description      |
|---------------------|:-----------------|
| ((dictionary?))     | The record that was found, or `undefined` if no such record could be located.

##### Errors

|     Name        | Type                | When? |
|:----------------|---------------------|:---------------------------------------------------------------------------------|
| UsageError      | ((Error))           | Thrown if something invalid was passed in.
| AdapterError    | ((Error))           | Thrown if something went wrong in the database adapter.
| Error           | ((Error))           | Thrown if anything else unexpected happens.

See [Concepts > Models and ORM > Errors](https://sailsjs.com/documentation/concepts/models-and-orm/errors) for examples of negotiating errors in Sails and Waterline.


### Example

To locate the user whose username is "finn" in your database:

```javascript
var finn = await Users.findOne({
  username: 'finn'
});

if (!finn) {
  sails.log('Could not find Finn, sorry.');
}
else {
  sails.log('Found "%s"', finn.fullName);
}
```



### Notes
> + This method can be used with [`await`](https://github.com/mikermcneil/parley/tree/49c06ee9ed32d9c55c24e8a0e767666a6b60b7e8#usage), promise chaining, or [traditional Node callbacks](https://sailsjs.com/documentation/reference/waterline-orm/queries/exec).
> + Being unable to find a record with the given criteria does **not** constitute an error for `findOne()`.  If no matching record is found, the result will be `undefined`.



<docmeta name="importance" value="10">
<docmeta name="displayName" value=".findOne()">
<docmeta name="pageType" value="method">

