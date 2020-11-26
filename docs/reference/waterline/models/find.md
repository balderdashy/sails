# `.find()`

Find records in your database that match the given criteria.

```usage
var records = await Something.find(criteria);
```

### Usage

|   |     Argument        | Type              | Details                            |
|---|:--------------------|-------------------|:-----------------------------------|
| 1 |    criteria         | ((dictionary))    | The [Waterline criteria](https://sailsjs.com/documentation/concepts/models-and-orm/query-language) to use for matching records in the database.

##### Result

| Type                | Description      |
|---------------------|:-----------------|
| ((array)) of ((dictionary))   | The array of records from your database that match the given criteria.


##### Errors

|     Name        | Type                | When? |
|:----------------|---------------------|:---------------------------------------------------------------------------------|
| UsageError      | ((Error))           | Thrown if something invalid was passed in.
| AdapterError    | ((Error))           | Thrown if something went wrong in the database adapter.
| Error           | ((Error))           | Thrown if anything else unexpected happens.

See [Concepts > Models and ORM > Errors](https://sailsjs.com/documentation/concepts/models-and-orm/errors) for examples of negotiating errors in Sails and Waterline.


### Example

##### A basic find query

To find any users named Finn in the database:

```javascript
var usersNamedFinn = await User.find({name:'Finn'});
sails.log('Wow, there are %d users named Finn.  Check it out:', usersNamedFinn.length, usersNamedFinn);
```


##### Using projection

Projection selectively omits the fields returned on found records. This is useful for achieving faster performance and greater security when passing found records to the client. The select clause in a [Waterline criteria](https://sailsjs.com/documentation/concepts/models-and-orm/query-language) takes an array of strings that correspond with attribute names. The record ID is always returned.

```javascript
var usersNamedFinn = await User.find({
  where: {name:'Finn'},
  select: ['name', 'email']
});
```


might yield:

```javascript
[
  {
    id: 7392,
    name: 'Finn',
    email: 'finn_2017@gmail.com'
  },
  {
    id: 4427,
    name: 'Finn',
    email: 'walkingfinn@outlook.com'
  }
  // ...more users named Finn and their email addresses
]
```

### Notes
> + This method can be used with [`await`](https://github.com/mikermcneil/parley/tree/49c06ee9ed32d9c55c24e8a0e767666a6b60b7e8#usage), promise chaining, or [traditional Node callbacks](https://sailsjs.com/documentation/reference/waterline-orm/queries/exec).

<docmeta name="importance" value="10">
<docmeta name="displayName" value=".find()">
<docmeta name="pageType" value="method">
