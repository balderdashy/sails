# `.destroyOne()`

Destroy the record in your database that matches the given criteria, if it exists.

```usage
var destroyedRecord = await Something.destroyOne(criteria);
```

> Before attempting to modify the database, Waterline will check to see if more than one record matches the given criteria. If so, it will throw an error instead of proceeding.


### Usage

|   |     Argument        | Type              | Details                            |
|---|:--------------------|-------------------|:-----------------------------------|
| 1 | criteria            | ((dictionary))    | The [Waterline criteria](https://sailsjs.com/documentation/concepts/models-and-orm/query-language) to use for matching the record in the database.

##### Result

| Type                | Description      |
|:--------------------|:-----------------|
| ((dictionary?))     | Since `.destroyOne()` never destroys more than one record, if a record is destroyed then it is always provided as a result.  Otherwise, `undefined` is returned.


##### Errors

See [Concepts > Models and ORM > Errors](https://sailsjs.com/documentation/concepts/models-and-orm/errors) for examples of negotiating errors in Sails and Waterline.


### Example

```javascript
var burnedBook = await User.destroyOne({id: 4})
if (burnedBook) {
  sails.log('Deleted book with `id: 4`.');
} else {
  sails.log('The database does not have a book with `id: 4`.');
}
```


### Notes
> + Because it _always_ returns the destroyed record, if one was matched, this method **does not support .fetch()**.
> + This method can be used with [`await`](https://github.com/mikermcneil/parley/tree/49c06ee9ed32d9c55c24e8a0e767666a6b60b7e8#usage), promise chaining, or [traditional Node callbacks](https://sailsjs.com/documentation/reference/waterline-orm/queries/exec).


<docmeta name="displayName" value=".destroyOne()">
<docmeta name="pageType" value="method">
