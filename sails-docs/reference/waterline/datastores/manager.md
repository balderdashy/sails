# `.manager`

The live connection manager for this datastore.

```usage
datastore.manager
```

>  Depending on the adapter, this might represent a connection pool, a single connection, or just a reference to a preconfigured client library instance.

### Example
Access a raw Mongo collection instance representing a model `Pet`.
```javascript
// Since the db connection manager exposed by `sails-mongo` is actually
// the same as the Mongo client's `db` instance, we can treat it as such.
var db = Pet.getDatastore().manager;

// Now we can do anything we could do with a Mongo `db` instance:
var rawMongoCollection = db.collection(Pet.tableName);
```

<docmeta name="displayName" value=".manager">
<docmeta name="pageType" value="property">
