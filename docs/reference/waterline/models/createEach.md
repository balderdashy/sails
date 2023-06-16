# `.createEach()`

Create a set of records in the database.

```usage
await Something.createEach(initialValues);
```

or

+ `var createdRecords = await Something.createEach(initialValues).fetch();`


### Usage

|   |     Argument        | Type                                         | Details                            |
|---|:--------------------|----------------------------------------------|:-----------------------------------|
| 1 |  initialValues      | ((array?))                                   | An array of dictionaries with attributes for the new records.

> **Note**: For performance reasons, as of Sails v1.0 / Waterline 0.13, the dictionaries in the `initialValues` array passed into this model method will be mutated in-place in most situations (whereas in Sails/Waterline v0.12, this was not necessarily the case).


##### Result

| Type                | Description      |
|---------------------|:-----------------|
| ((array?)) of ((dictionary))  | The created records are not provided as a result by default, in order to optimize for performance.  To override the default setting, chain `.fetch()` and the newly created records will be sent back. (Be aware that this requires an extra database query in some adapters.)


##### Errors

|     Name        | Type                | When? |
|--------------------|---------------------|:---------------------------------------------------------------------------------|
| UsageError            | ((Error))           | Thrown if something invalid was passed in.
| AdapterError     | ((Error))           | Thrown if something went wrong in the database adapter. See [Concepts > Models and ORM > Errors](https://sailsjs.com/documentation/concepts/models-and-orm/errors) for an example of how to negotiate a uniqueness error (arising from an attempt to create a record with a duplicate value that would violate a uniqueness constraint).
| Error             | ((Error))           | Thrown if anything else unexpected happens.

See [Concepts > Models and ORM > Errors](https://sailsjs.com/documentation/concepts/models-and-orm/errors) for examples of negotiating errors in Sails and Waterline.



##### Meta keys

| Key                 | Type              | Details                                                        |
|:--------------------|-------------------|:---------------------------------------------------------------|
| fetch               | ((boolean))       | If set to `true`, then the created records will be sent back.<br/><br/>Defaults to `false`.

> For more information on meta keys, see [.meta()](https://sailsjs.com/documentation/reference/waterline-orm/queries/meta).


### Example

To create users named Finn and Jake in the database:

```javascript
await User.createEach([{name:'Finn'}, {name: 'Jake'}]);
```

##### Fetching newly created records
```javascript
var createdUsers = User.createEach([{name:'Finn'}, {name: 'Jake'}]).fetch();
sails.log(`Created ${createdUsers.length} user${createdUsers.length===1?'':'s'}.`);
```

### Notes
> + This method can be used with [`await`](https://github.com/mikermcneil/parley/tree/49c06ee9ed32d9c55c24e8a0e767666a6b60b7e8#usage), promise chaining, or [traditional Node callbacks](https://sailsjs.com/documentation/reference/waterline-orm/queries/exec).
> + The number of records you can add with `.createEach` is limited by the maximum query size of the particular database you&rsquo;re using.  MySQL has a 4MB limit by default, but this can be changed via the [`max_allowed_packet` setting](https://dev.mysql.com/doc/refman/5.7/en/server-system-variables.html#sysvar_max_allowed_packet).  MongoDB imposes a 16MB limit on single documents, but essentially has no limit on the number of documents that can be created at once.  PostgreSQL has a very large (around 1GB) maximum size.  Consult your database&rsquo;s documentation for more information about query limitations.
> + Another thing to watch out for when doing very large bulk inserts is the maximum number of bound variables. This varies per databases but refers to the number of values being substituted in a query. See [maxmimum allowable parameters](http://stackoverflow.com/questions/6581573/what-are-the-max-number-of-allowable-parameters-per-database-provider-type) for more details.
> + When using `.fetch()` and manually specifying primary key values for new records, the sort order of returned records is not guaranteed (it varies depending on the database adapter in use).


<docmeta name="displayName" value=".createEach()">
<docmeta name="pageType" value="method">
