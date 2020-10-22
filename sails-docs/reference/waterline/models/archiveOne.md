# `.archiveOne()`

Archive ("soft-delete") the record that matches the specified criteria, saving it (if it exists) as a new record in the built-in Archive model, then destroying the original.

```usage
var originalRecord = await Something.archiveOne(criteria);
```

> Before attempting to modify the database, Waterline will check to see if the given criteria would match more than one record and, if so, it will throw an error instead of proceeding.


### Usage

|   |     Argument        | Type              | Details                            |
|---|:--------------------|-------------------|:-----------------------------------|
| 1 | criteria            | ((dictionary))    | The [Waterline criteria](https://sailsjs.com/documentation/concepts/models-and-orm/query-language) to use for matching the record in the database.

##### Result

| Type                | Description      |
|:--------------------|:-----------------|
| ((dictionary?))     | Since this method never archives more than one record, if a record is archived then it is always provided as a result.  Otherwise, this returns `undefined`.


##### Errors

See [Concepts > Models and ORM > Errors](https://sailsjs.com/documentation/concepts/models-and-orm/errors) for examples of negotiating errors in Sails and Waterline.


### Example

```javascript
var finn = await User.archiveOne({ firstName: 'Finn' });
if (finn) {
  sails.log('Archived the user named "Finn".');
} else {
  sails.log('The database does not have a user named "Finn".');
}
```


### Notes
> This method is best used in situations where you would otherwise use [`.destroyOne()`](https://sailsjs.com/documentation/reference/waterline-orm/models/destroy-one), but you still need to keep the deleted data somewhere (for compliance reasons, maybe).  If you anticipate needing to access the data again in your app (if you allow un-deleting, for example), you may want to consider using an `isDeleted` flag instead, since archived records are more difficult to work with programmatically.  (There is no built-in "unarchive".)
> + This method **does not support .fetch()**, because it _always_ returns the archived record, if one was matched.


<docmeta name="displayName" value=".archiveOne()">
<docmeta name="pageType" value="method">
