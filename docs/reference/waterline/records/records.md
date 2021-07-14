# Records

In Sails, [records](https://sailsjs.com/documentation/concepts/models-and-orm/records) come from model methods like `.find()` and represent data from your database. You can work with records just like you would any other data.

```js
var orders = await Order.find();
// `orders` is an array of records
```

### Working with populated records
If a record came from a query that used `.populate()`, it may contain populated values (or "child records") which represent the associated data. To add, remove, or replace these child records, use [model methods](https://sailsjs.com/documentation/reference/waterline-orm/models).


<docmeta name="displayName" value="Records">

