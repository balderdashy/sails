# `.removeFromCollection()`

Remove one or more members (e.g. a comment) from the specified collection (e.g. the `comments` of BlogPost #4).

```usage
await Something.removeFromCollection(parentId, association)
.members(childIds);
```

### Usage

|   |     Argument        | Type                                         | Details                            |
|---|:--------------------|----------------------------------------------|:-----------------------------------|
| 1 |  parentId    | ((number)) or ((string))                   | The primary key value(s) (i.e. ids) for the parent record(s). <br/>Must be a number or string (e.g. `'507f191e810c19729de860ea'` or `49`).  <br/>Alternatively, an array of numbers or strings may be specified (e.g. `['507f191e810c19729de860ea', '14832ace0c179de897']` or `[49, 32, 37]`).  In this case, _all_ of the child records will be removed from the appropriate collection of each parent record.
| 2 |  association | ((string))                                   | The name of the plural ("collection") association (e.g. "pets")
| 3 |  childIds      | ((array))                                    | The primary key values (i.e. ids) of the child records to remove.  _Note that this does not [destroy](https://sailsjs.com/documentation/reference/waterline-orm/models/destroy) these records, it just detaches them from the specified parent(s)._


##### Errors

|     Name        | Type                | When? |
|:----------------|---------------------|:---------------------------------------------------------------------------------|
| UsageError      | ((Error))           | Thrown if something invalid was passed in.
| AdapterError    | ((Error))           | Thrown if something went wrong in the database adapter.
| Error           | ((Error))           | Thrown if anything else unexpected happens.

See [Concepts > Models and ORM > Errors](https://sailsjs.com/documentation/concepts/models-and-orm/errors) for examples of negotiating errors in Sails and Waterline.


### Example

For user 3, remove pets 99 and 98 from the "pets" collection:

```javascript
await User.removeFromCollection(3, 'pets')
.members([99,98]);
```


### Edge cases

+ If the parent id (or any _one_ of the parent ids, if specified as an array) does not actually correspond with an existing, persisted record, then this will modify the existing records and ignore the non-existent ones.
+ If one of the child ids does not actually correspond with an existing, persisted record, then that child id will be ignored, and only those members that correspond with the other provided child ids will be removed from the collection.
+ If a parent record's collection _does not have_ one or more of these child ids as members, then the ids of those non-members will be ignored. ((TODO: test with one-to-many))
+ If an empty array of child ids is provided, then this is a [no-op](https://en.wikipedia.org/wiki/NOP#Code).
+ If an empty array of parent ids is provided, then this is a [no-op](https://en.wikipedia.org/wiki/NOP#Code).

### Notes
> + This method can be used with [`await`](https://github.com/mikermcneil/parley/tree/49c06ee9ed32d9c55c24e8a0e767666a6b60b7e8#usage), promise chaining, or [traditional Node callbacks](https://sailsjs.com/documentation/reference/waterline-orm/queries/exec).
> + If the association is "two-way" (meaning it has `via`) then the child records will be modified accordingly.  If the attribute on the other (e.g. "Pet") side is singular, the each child record's foreign key ("owner") will be set to `null`.  If it's plural, then each child record's collection will be modified accordingly.




<docmeta name="displayName" value=".removeFromCollection()">
<docmeta name="pageType" value="method">
