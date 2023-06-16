# `.create()`

Create a record in the database.

```usage
await Something.create(initialValues);
```

or

+ `var createdRecord = await Something.create(initialValues).fetch();`

### Usage

|   | Argument            | Type                         | Details                               |
|---|:--------------------|------------------------------|:--------------------------------------|
| 1 | initialValues       | ((dictionary))               | The initial values for the new record.  _(Note that, if this model is in ["schemaful" mode](https://sailsjs.com/documentation/concepts/models-and-orm/model-settings#?schema), then any extraneous keys will be silently omitted.)_

> **Note**: For performance reasons, as of Sails v1.0 / Waterline 0.13, the `initialValues` dictionary passed into this model method will be mutated in-place in most situations (whereas in Sails/Waterline v0.12, this was not necessarily the case).

##### Result

| Type                | Description      |
|---------------------|:-----------------|
| ((dictionary?))     | For improved performance, the created record is not provided as a result by default.  But if you chain `.fetch()`, then the newly-created record will be sent back. (Be aware that this requires an extra database query in some adapters.)

##### Errors

|     Name        | Type                | When? |
|--------------------|---------------------|:---------------------------------------------------------------------------------|
| UsageError            | ((Error))           | Thrown if something invalid was passed in.
| AdapterError     | ((Error))           | Thrown if something went wrong in the database adapter. See [Concepts > Models and ORM > Errors](https://sailsjs.com/documentation/concepts/models-and-orm/errors) for an example of how to negotiate a uniqueness error (i.e. from attempting to create a record with a duplicate that would violate a uniqueness constraint).
| Error             | ((Error))           | Thrown if anything else unexpected happens.

See [Concepts > Models and ORM > Errors](https://sailsjs.com/documentation/concepts/models-and-orm/errors) for examples of negotiating errors in Sails and Waterline.


##### Meta keys

| Key                 | Type              | Details                                                        |
|:--------------------|-------------------|:---------------------------------------------------------------|
| fetch               | ((boolean))       | If set to `true`, then the created record will be sent back.<br/><br/>Defaults to `false`.

> For more information on meta keys, see [.meta()](https://sailsjs.com/documentation/reference/waterline-orm/queries/meta).



### Example

To create a user named Finn in the database:

```javascript
await User.create({name:'Finn'});

return res.ok();
```

##### Fetching the newly-created record
```javascript
var createdUser = await User.create({name:'Finn'}).fetch();

sails.log('Finn\'s id is:', createdUser.id);
```

### Negotiating errors

It's important to always handle errors from model methods.  But sometimes, you need to look at errors in a more granular way. To learn more about the kinds of errors Waterline returns, and for examples of how to handle them, see [Concepts > Models and ORM > Errors](https://sailsjs.com/documentation/concepts/models-and-orm/errors).

### Notes
> + This method can be used with [`await`](https://github.com/mikermcneil/parley/tree/49c06ee9ed32d9c55c24e8a0e767666a6b60b7e8#usage), promise chaining, or [traditional Node callbacks](https://sailsjs.com/documentation/reference/waterline-orm/queries/exec).


<docmeta name="displayName" value=".create()">
<docmeta name="pageType" value="method">
