# `.where()`

Specify a where clause for filtering a query.

```usage
.where(whereClause)
```


### Usage
|   |     Arguments      | Type                | Details    |
|---|:-------------------|---------------------|------------|
| 1 |  whereClause          |  ((dictionary))     | The [where clause](https://sailsjs.com/documentation/concepts/models-and-orm/query-language) to use for matching records in the database. |


### Example

To find all the users named Finn whose email addresses start with 'f':
```javascript
var users = await User.find()
.where({ name: 'Finn', 'emailAddress' : { startsWith : 'f' } });

return res.json(users);
```

### Notes
> The criteria provided in the `.where()` method takes precendence over the the criteria provided in `.find()`.

> The `.find()` method returns a chainable object if you don't supply a callback.  This method can be chained to `.find()` to further filter your results.



<docmeta name="displayName" value=".where()">
<docmeta name="pageType" value="method">
