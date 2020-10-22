# `.driver`

The generic, stateless, low-level driver for this datastore (if supported by the adapter).

```usage
datastore.driver;
```

> This property is not guaranteed to exist for all database adapters.  If the datastore's underlying adapter does not support the [standardized driver interface](https://github.com/node-machine/driver-interface), then `driver` will not exist.


### Example

Imagine you're building your own structured data visualizer (e.g. phpMyAdmin).  You might want to connect to any number of different databases dynamically.

```javascript
// Get the generic, stateless driver for our database (e.g. MySQL).
var Driver = sails.getDatastore().driver;

// Create our own dynamic connection manager (e.g. connection pool)
var manager = (
  await Driver.createManager({ connectionString: req.param('connectionUrl') })
).manager;

var db;
try {
  db = (
    await Driver.getConnection({ manager: managerReport.manager })
  ).connection;
} catch (err) {
  await Driver.destroyManager({ manager: managerReport.manager });
  throw err;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Do some stuff here...
// e.g.
//     await Driver.sendNativeQuery({
//       connection: db,
//       nativeQuery: '...'
//     });
// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// Finally, before we continue, tear down the dynamic connection manager.
// (this also takes care of releasing the active connection we acquired above)
await Driver.destroyManager({ manager: managerReport.manager });

return res.ok();
```

<docmeta name="displayName" value=".driver">
<docmeta name="pageType" value="property">
