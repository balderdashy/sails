# `.select()`

Indicate which attributes to select from the query. All attributes except for the
given attributes will be returned.

```usage
.select(attributesToInclude)
```


### Usage

|   |     Argument         | Type      | Details    |
|---|:---------------------|-----------|------------|
| 1 |  attributesToInclude | ((array)) | The names of fields to select. |


### Example

To retrieve only `name` from the user with id 1234

```javascript
var userInfo = await User.findOne({ id: 1234 })
.select(['name'])

return res.json(userInfo);
```

<docmeta name="displayName" value=".select()">
<docmeta name="pageType" value="method">
