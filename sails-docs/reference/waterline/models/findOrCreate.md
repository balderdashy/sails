# `.findOrCreate()`

Find the record matching the specified criteria.  If no such record exists, create one using the provided initial values.

```usage
var newOrExistingRecord = await Something.findOrCreate(criteria, initialValues);
```

or, if you need to know whether a new record was created,

```usage
Something.findOrCreate(criteria, initialValues)
.exec(function(err, newOrExistingRecord, wasCreated) {

});
```

#### Usage

| # | Argument      | Type                  | Details    |
|---|---------------|:----------------------|:-----------|
| 1 | _criteria_    | ((dictionary?))       | The [Waterline criteria](https://sailsjs.com/documentation/concepts/models-and-orm/query-language) to use for matching records in the database.  **This particular criteria should always match exactly zero or one records in the database.**
| 2 |  initialValues | ((dictionary))       | The initial values for the new record, if one is created.



#### Callback
|   |     Argument            | Type                | Details |
|---|:------------------------|---------------------|:---------------------------------------------------------------------------------|
| 1 |    _err_                | ((Error?))          | The error that occurred, or `undefined` if there were no errors.
| 2 | _newOrExistingRecord_   | ((dictionary?))     | The record that was found, or `undefined` if no such record could be located.
| 3 | wasCreated              | ((boolean))         | Whether a new record was created.


##### Errors

|     Name        | Type                | When? |
|:----------------|---------------------|:---------------------------------------------------------------------------------|
| UsageError      | ((Error))           | Thrown if something invalid was passed in.
| AdapterError    | ((Error))           | Thrown if something went wrong in the database adapter.
| Error           | ((Error))           | Thrown if anything else unexpected happens.

See [Concepts > Models and ORM > Errors](https://sailsjs.com/documentation/concepts/models-and-orm/errors) for examples of negotiating errors in Sails and Waterline.


### Example

Let's make sure our test user, Finn, exists:

```javascript
User.findOrCreate({ name: 'Finn' }, { name: 'Finn' })
.exec(async(err, user, wasCreated)=> {
  if (err) { return res.serverError(err); }
  
  if(wasCreated) {
    sails.log('Created a new user: ' + user.name);
  }
  else {
    sails.log('Found existing user: ' + user.name);
  }
});
```

### Notes
> + This method can be used with [`await`](https://github.com/mikermcneil/parley/tree/49c06ee9ed32d9c55c24e8a0e767666a6b60b7e8#usage), promise chaining, or [traditional Node callbacks](https://sailsjs.com/documentation/reference/waterline-orm/queries/exec). If you use `await`, be aware that the result will be the record only&mdash;you will not have access to `wasCreated`.
> + Behind the scenes, this uses `.findOne()`, so if more than one record in the database matches the provided criteria, there will be an error explaining so.

<docmeta name="displayName" value=".findOrCreate()">
<docmeta name="pageType" value="method">
