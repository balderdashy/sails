# sails.getDatastore()
Access a particular [datastore](https://sailsjs.com/documentation/concepts/models-and-orm#?datastores), or the default datastore.

```usage
sails.getDatastore(datastoreName);
```

### Usage


|   |          Argument           | Type                | Details
|---|---------------------------- | ------------------- |:-----------
| 1 |        datastoreName        | ((string?))         |  If specified, this is the name of the datastore to look up. Otherwise, if you leave this blank, this `getDatastore()` will return the default datastore for your app.

#### Returns

**Type:** ((Dictionary))

A [datastore instance](https://sailsjs.com/documentation/reference/waterline-orm/datastores).

<docmeta name="displayName" value="sails.getDatastore()">
<docmeta name="pageType" value="method">
