# `.populate()`

Modify a [query instance](https://sailsjs.com/documentation/reference/waterline-orm/queries) so that, when executed, it will populate child records for the specified collection, optionally filtering by `subcriteria`.  Populate may be called more than once on the same query, as long as each call is for a different association.


```usage
.populate(association, subcriteria)
```


### Usage

|   |     Argument           | Type                                         | Details                            |
|---|:-----------------------|----------------------------------------------|:-----------------------------------|
| 1 |    association         | ((string))                                   | The name of the association to populate.  e.g. `snacks`.
| 2 |    _subcriteria_       | ((dictionary?))                              | Optional.  When populating `collection` associations between two models which reside in the same database, a [Waterline criteria](https://sailsjs.com/documentation/concepts/models-and-orm/query-language) may be specified as a second argument to populate.  This will be used for filtering, sorting, and limiting the array of associated records (e.g. snacks) associated with each primary record.

> **Important:** Both the basic join polyfill (cross-datastore populate, or populate between models whose configured adapter does not provide a `.join()` implementation) and the subcriteria argument to `.populate()` are fully supported in Sails **individually**. However, using the subcriteria argument to `.populate()` at the same time as the join polyfill is experimental. This means that, if an association spans multiple datastores or its datastore's configured adapter does not support a physical layer join, then you should not rely on the subcriteria argument to `.populate()`. If you try that in production, you will see a warning logged to the console. SQL adapters such as [sails-postgresql](https://github.com/balderdashy/sails-postgresql) and [sails-mysql](https://github.com/balderdashy/sails-mysql) support native joins and should be okay to use the subcriteria argument.

> **Note:** If you are using `schema: false`, only defined attributes will be populated.

### Example

##### Populating a model association

The following finds any users named Finn in the database and, for each one, also populates their dad:
```javascript
var usersNamedFinn = await User.find({name:'Finn'}).populate('dad');

sails.log('Wow, there are %d users named Finn.', usersNamedFinn.length);
sails.log('Check it out, some of them probably have a dad named Joshua or Martin:', usersNamedFinn);

return res.json(usersNamedFinn);
```

This might yield:

```javascript
[
  {
    id: 7392,
    age: 13,
    name: 'Finn',
    createdAt: 1451088000000,
    updatedAt: 1545782400000,
    dad: {
      id: 108,
      age: 47,
      name: 'Joshua',
      createdAt: 1072396800000,
      updatedAt: 1356480000000,
      dad: null
    }
  },
  // ...more users
]
```


##### Populating a collection association

> This example uses the optional subcriteria argument.

The following finds any users named Finn in the database and, for each one, also populates their three hippest purple swords, in descending order of hipness:

```javascript
// Warning: This is only safe to use on large datasets if both models are in the same database,
// and the adapter supports optimized populates.
// (e.g. cannot do this with the `User` model in PostgreSQL and the `Sword` model in MongoDB)
var usersNamedFinn = await User.find({ name:'Finn' })
.populate('currentSwords', {
  where: {
    color: 'purple'
  },
  limit: 3,
  sort: 'hipness DESC'
});

// Note that Finns without any swords are still included -- their `currentSwords` arrays will just be empty.
sails.log('Wow, there are %d users named Finn.', usersNamedFinn.length);
sails.log('Check it out, some of them probably have non-empty arrays of purple swords:', usersNamedFinn);

return res.json(usersNamedFinn);
```

This might yield:

```javascript
[
  {
    id: 7392,
    age: 13,
    name: 'Finn',
    createdAt: 1451088000000,
    updatedAt: 1545782400000,
    dad: 108,//<< not populated
    swords: [//<< populated
      {
        id: 9,
        title: 'Grape Soda Sword',
        color: 'purple',
        createdAt: 1540944000000,
        updatedAt: 1540944000000
      },
      // ...more swords
    ]
  },
  // ...more users
]
```


<docmeta name="displayName" value=".populate()">
<docmeta name="pageType" value="method">

