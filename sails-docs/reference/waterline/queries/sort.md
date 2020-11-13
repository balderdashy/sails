# `.sort()`

Set the order in which retrieved records should be returned when executing a [query instance](https://sailsjs.com/documentation/reference/waterline-orm/queries).

```usage
.sort(sortClause)
```

### Usage
|   |     Argument     | Type                | Details |
|---|:-----------------|---------------------|------------|
| 1 |  sortClause      | ((string)) _or_ ((array)) of ((dictionary)) | If specified as a string, this should be formatted as: an attribute name, followed by a space, followed by either `ASC` or `DESC` to indicate an _ascending_ or _descending_ sort (e.g. `name ASC`). <br/>If specified as an array, then each array item should be a dictionary with a single key representing the attribute to sort by, whose value is either `ASC` or `DESC`. The array syntax allows for sorting by multiple attributes, using the array order to establish precedence <br/>(e.g. `[ { name: 'ASC' }, { age:  'DESC'} ]`). |

### Example

To sort users named Jake by age, in ascending order:
```javascript
var users = await User.find({ name: 'Jake'})
.sort('age ASC');

return res.json(users);
```

To sort users named Finn, first by age, then by when they joined:
```javascript
var users = await User.find({ name: 'Finn'})
.sort([
  { age: 'ASC' },
  { createdAt: 'ASC' },
]);

return res.json(users);
```

### Notes
> The .find() method returns a chainable object if you don't supply a callback.  This method can be chained to .find() to further filter your results.

<docmeta name="displayName" value=".sort()">
<docmeta name="pageType" value="method">
