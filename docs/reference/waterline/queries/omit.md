# `.omit()`

Indicate which attributes to omit from the query. All attributes except for the
given attributes will be returned.

```usage
.omit(attributesToOmit)
```


### Usage

|   |     Argument      | Type      | Details    |
|---|:------------------|-----------|------------|
| 1 |  attributesToOmit | ((array)) | The names of fields to omit. |


### Example

To retrieve all attributes but `password` from the user named Rosa:

```javascript
var rosa = await User.findOne({ name: 'Rosa' })
.omit(['password'])

return res.json(rosa);
```

<docmeta name="displayName" value=".omit()">
<docmeta name="pageType" value="method">
