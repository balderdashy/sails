# `.replaceCollection()`

Replace all members of the specified collection (e.g. the `comments` of BlogPost #4).

```usage
await Something.replaceCollection(parentId, association)
.members(childIds);
```

### Usage

|   |     Argument        | Type                                         | Details                            |
|---|:--------------------|----------------------------------------------|:-----------------------------------|
| 1 |  parentId           | ((number)) or ((string))                   | The primary key value(s) (i.e. ids) for the parent record(s). <br/>Must be a number or string (e.g. `'507f191e810c19729de860ea'` or `49`).  <br/>Alternatively, an array of numbers or strings may be specified (e.g. `['507f191e810c19729de860ea', '14832ace0c179de897']` or `[49, 32, 37]`). In this case, the child records will be replaced in each parent record.
| 2 |  association | ((string))                                   | The name of the plural ("collection") association (e.g. "pets")
| 3 |  childIds      | ((array))                                    | The primary key values (i.e. ids) for the child records that will be the new members of the association.  _Note that this does not [create](https://sailsjs.com/documentation/reference/waterline-orm/models/create) these records or [destroy](https://sailsjs.com/documentation/reference/waterline-orm/models/destroy) the old ones, it just attaches/detaches records to/from the specified parent(s)._


##### Errors

|     Name        | Type                | When? |
|:----------------|---------------------|:---------------------------------------------------------------------------------|
| UsageError      | ((Error))           | Thrown if something invalid was passed in.
| AdapterError    | ((Error))           | Thrown if something went wrong in the database adapter.
| Error           | ((Error))           | Thrown if anything else unexpected happens.

See [Concepts > Models and ORM > Errors](https://sailsjs.com/documentation/concepts/models-and-orm/errors) for examples of negotiating errors in Sails and Waterline.



### Example

For user 3, replace all pets in the "pets" collection with pets 99 and 98:

```javascript
await User.replaceCollection(3, 'pets')
.members([99,98]);
```

### Edge cases

+ If the parent id does not actually correspond with an existing, persisted record, then this will do nothing.
+ If one of the child ids does not actually correspond with an existing, persisted record, then that child id will be ignored, and only those members that correspond with the other provided child ids will be included in the replacement collection.
+ If an empty array of child ids is provided, or if none of the provided child ids correspond to existing records, then this will detach _all_ child records from the parent.

### Notes
> + This method can be used with [`await`](https://github.com/mikermcneil/parley/tree/49c06ee9ed32d9c55c24e8a0e767666a6b60b7e8#usage), promise chaining, or [traditional Node callbacks](https://sailsjs.com/documentation/reference/waterline-orm/queries/exec).
> + If the association is "2-way" (meaning it has `via`) then the child records will be modified accordingly.  If the attribute on the other side is singular, the each newly-linked-or-unlinked child record's foreign key will be changed.  If it's plural, then each child record's collection will be modified accordingly.
> + In addition, if the `via` points at a singular ("model") attribute on the other side, then `.addToCollection()` will "steal" these child records if necessary.  For example, imagine you have an Employee model with this plural ("collection") attribute: `involvedInPurchases: { collection: 'Purchase', via: 'cashier' }`.  If you executed `Employee.addToCollection(7, 'involvedInPurchases', [47])` to assign this purchase to employee #7 (Dolly), but purchase #47 was already associated with a different employee (e.g. #12, Motoki), then this would "steal" the purchase from Motoki and give it to Dolly.  In other words, if you executed `Employee.find([7, 12]).populate('involvedInPurchases')`, Dolly's `involvedInPurchases` array would contain purchase #47 and Motoki's would not.




<docmeta name="displayName" value=".replaceCollection()">
<docmeta name="pageType" value="method">
