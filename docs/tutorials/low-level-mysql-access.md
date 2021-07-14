# Low-level MySQL usage (advanced)

This tutorial steps through how to access the raw MySQL connection instance from the [`mysql` package](https://www.npmjs.com/package/mysql).  This is useful for getting access to low level APIs available only in the raw client itself. 

> Note: Many Node.js / Sails apps using MySQL will never need the kind of low-level usage described here.  If you find yourself running up against the limitations of the ORM, there is usually a workaround that does not involve writing code for the underlying database.  Even then, if you're just looking to use custom native SQL queries, read no further-- instead, check out [`sendNativeQuery()`](/documentation/reference/waterline-orm/datastores/send-native-query) instead.
>
> Also, before we proceed, make sure you have a datastore configured to use a functional MySQL database.

### Get access to an active MySQL connection

To obtain an active connection from the MySQL package you can call the [`.leaseConnection()`](/documentation/reference/waterline-orm/datastores/lease-connection) method of a registered datastore object (RDI).

1. Get the registered datastore instance for the connection:

```javascript
// Get the named datastore
var rdi = sails.getDatastore('default');

// Get the datastore configured for a specific model
var rdi = Product.getDatastore();
```

2. Call the `leaseConnection()` method to obtain an active connection:

```javascript
rdi.leaseConnection(function(connection, proceed) {
  db.query('SELECT * from `user`;', function(err, results, fields) {
    if (err) {
      return proceed(err);
    }

    proceed(undefined, results);
  });
}, function(err, results) {
  // Handle results here after the connection has been closed
})
```

### Get access to the low-level driver

To get access to the low-level driver and MySQL package in a Sails app, you can grab them from the registered datastore object (RDI).

1. Get the registered datastore instance for the connection:

```javascript
// Get the named datastore
var rdi = sails.getDatastore('default');

// Get the datastore configured for a specific model
var rdi = Product.getDatastore();
```

2. Get the driver from the datastore instance which contains the MySQL module:

```javascript
var mysql = rdi.driver.mysql;
```

3. You can now use the module to make native requests and call other function native to the MySQL module:

```javascript
// Get the named datastore
var rdi = sails.getDatastore('default');

// Grab the MySQL module from the datastore instance
var mysql = rdi.driver.mysql;

// Create a new connection
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'password',
  database: 'example_database'
});

// Make a query and pipe the results
connection.query('SELECT * FROM posts')
  .stream({highWaterMark: 5})
  .pipe(...);
```

<docmeta name="displayName" value="Low-level MySQL usage (advanced)">
