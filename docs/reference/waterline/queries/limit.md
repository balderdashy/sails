# `.limit()`

Set the maximum number of records to retrieve when executing a [query instance](https://sailsjs.com/documentation/reference/waterline-orm/queries).

```usage
.limit(maximum)
```

### Usage
|   |     Argument        | Type         | Details    |
|---|:--------------------|--------------|------------|
| 1 |  maximum            |  ((number))  | The maximum number of records to retrieve. |

### Example

To retrieve records for up to 10 users named Jake:

```javascript
var jakes = await User.find({ name: 'Jake' }).limit(10);

return res.json(jakes);
```

### Notes
> * If you set the limit to 0, the query will always return an empty array.
> * If the limit is greater than the number of records matching the query criteria, all of the matching records will be returned.
> * The .find() method returns a chainable object if you don't supply a callback.  This method can be chained to .find() to further filter your results.


<docmeta name="displayName" value=".limit()">
<docmeta name="pageType" value="method">
