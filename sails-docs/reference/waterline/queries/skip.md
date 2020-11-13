# `.skip()`

Indicate the number of records to skip before returning the results from executing a [query instance](https://sailsjs.com/documentation/reference/waterline-orm/queries).

```usage
.skip(numRecordsToSkip)
```


### Usage

|   |     Argument        | Type            | Details    |
|---|:--------------------|-----------------|------------|
| 1 |  numRecordsToSkip   | ((number))      | The number of records to skip. |


### Example

To retrieve records for all but the original user named Jake:

```javascript
var fakeJakes = await User.find({ name: 'Jake' });
.skip(1);

return res.json(fakeJakes);
```

### Notes
> If the &ldquo;skip&rdquo; value is greater than the number of records matching the query criteria, the query will return an empty array.
> The .find() method returns a chainable object if you don't supply a callback.  This method can be chained to .find() to further filter your results.


<docmeta name="displayName" value=".skip()">
<docmeta name="pageType" value="method">
