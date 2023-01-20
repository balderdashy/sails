# `.update()`

Update all records matching criteria.

```usage
await Something.update(criteria)
.set(valuesToSet);
```

or

+ `var updatedRecords = await Something.update(criteria).set(valuesToSet).fetch();`


### Usage

|   |     Argument        | Type              | Details                            |
|---|:--------------------|-------------------|:-----------------------------------|
| 1 | criteria            | ((dictionary))    | The [Waterline criteria](https://sailsjs.com/documentation/concepts/models-and-orm/query-language) to use for matching records in the database. `update` queries do not support pagination using `skip` and `limit`, or projections using `select`.
| 2 | valuesToSet         | ((dictionary))    | A dictionary (plain JavaScript object) of values that all matching records should be updated to have.  _(Note that, if this model is in ["schemaful" mode](https://sailsjs.com/documentation/concepts/models-and-orm/model-settings#?schema), then any extraneous keys will be silently omitted.)_

> **Note**: For performance reasons, as of Sails v1.0 / Waterline 0.13, the `valuesToSet` object passed into this model method will be mutated in-place in most situations (whereas in Sails/Waterline v0.12, this was not necessarily the case).

##### Result

| Type                | Description      |
|:--------------------|:-----------------|
| ((array?))          | The updated records are not provided as a result by default, in order to optimize for performance.  To override the default setting, chain `.fetch()` and an array of the updated records will be sent back. (Be aware that this requires an extra database query in some adapters.)


##### Errors

|     Name        | Type                | When? |
|:-------------------|---------------------|:---------------------------------------------------------------------------------|
| UsageError			| ((Error))           | Thrown if something invalid was passed in.
| AdapterError		| ((Error))           | Thrown if something went wrong in the database adapter. See [Concepts > Models and ORM > Errors](https://sailsjs.com/documentation/concepts/models-and-orm/errors) for an example of how to negotiate a uniqueness error (i.e. from attempting to update one or more records so that they violate a uniqueness constraint).
| Error    				| ((Error))           | Thrown if anything else unexpected happens.

See [Concepts > Models and ORM > Errors](https://sailsjs.com/documentation/concepts/models-and-orm/errors) for examples of negotiating errors in Sails and Waterline.


##### Meta keys

| Key                 | Type              | Details                                                        |
|:--------------------|-------------------|:---------------------------------------------------------------|
| fetch               | ((boolean))       | If set to `true`, then the array of updated records will be sent back.<br/><br/>Defaults to `false`.

> For more information on meta keys, see [.meta()](https://sailsjs.com/documentation/reference/waterline-orm/queries/meta).



### Example

To update a particular record, use [`.updateOne()`](https://sailsjs.com/documentation/reference/waterline-orm/models/update-one).

Or to update one or more records at the same time:

```javascript
await User.update({ name:'Pen' })
.set({
  name:'Finn'
});

sails.log('Updated all users named Pen so that their new name is "Finn".  I hope they like it.');
```

##### Fetching updated records

To fetch updated records, use enable the `fetch` meta key:

```javascript
var updatedUsers = await User.update({name:'Finn'})
.set({
  name:'Jake'
})
.fetch();

sails.log(`Updated all ${updatedUsers.length} user${updatedUsers.length===1?'':'s'} named "Finn" to have the name "Jake".  Here they are now:`);
sails.log(updatedUsers);
```

### Notes
> + This method can be used with [`await`](https://github.com/mikermcneil/parley/tree/49c06ee9ed32d9c55c24e8a0e767666a6b60b7e8#usage), promise chaining, or [traditional Node callbacks](https://sailsjs.com/documentation/reference/waterline-orm/queries/exec).
> + This method can be used to replace an entire collection association (for example, a user&rsquo;s list of friends), achieving the same result as the [`replaceCollection` method](https://sailsjs.com/documentation/reference/waterline-orm/models/replace-collection).  To modify items in a collection individually, use the [`addToCollection`](https://sailsjs.com/documentation/reference/waterline-orm/models/add-to-collection) or [removeFromCollection](https://sailsjs.com/documentation/reference/waterline-orm/models/remove-from-collection) methods.


<docmeta name="displayName" value=".update()">
<docmeta name="pageType" value="method">
