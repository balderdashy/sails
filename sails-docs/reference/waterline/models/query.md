# `.query()`

> **As of Sails v1.0, this method is deprecated.**
> Instead, please use [`Model.getDatastore().sendNativeQuery()`](https://sailsjs.com/documentation/reference/waterline-orm/datastores/send-native-query), the new version of this method that standardizes the format of SQL escape bindings, as well as fully supporting `.exec()` and promise-based usage.

Execute a raw SQL query using the specified model's datastore.

```usage
SomeModel.query(sql, valuesToEscape, function(err, rawResult) {

});
```

> **WARNING:** Unlike other Waterine model methods, `.query()` supports neither promise-based usage nor the use of `.exec()`.  In other words, it does not utilize Waterline's normal deferred object mechanism.  Instead, it provides raw access directly to the underlying database driver.

### Usage

`.query()` is only available on Sails/Waterline models that are configured to use a SQL database (e.g. PostgreSQL or MySQL).  Its purpose is to perform raw SQL queries.  Note that exact usage and result format varies between adapters, so you'll need to refer to the documentation for the underlying database driver.  (See below for a couple of simple examples to help get you started.)


|   |     Argument        | Type              | Details                            |
|---|:--------------------|-------------------|:-----------------------------------|
| 1 |    sql              | ((string))        | A SQL string written in the appropriate dialect for this model's database.  Allows template syntax, (e.g. `?`, `$1`) the exact style of which depends on the underlying database adapter. _(See examples below.)_
| 2 |    valuesToEscape   | ((array))         | An array of dynamic, untrusted strings to SQL-escape and inject within the SQL string using the appropriate template syntax for this model's database.  _(If you have no dynamic values to inject, then just use an empty array here.)_
| 3 |    done             | ((function))      | A callback function that will be triggered when the query completes successfully, or if the adapter encounters an error.

##### Callback

|   |     Argument        | Type                | Details |
|---|:--------------------|---------------------|:---------------------------------------------------------------------------------|
| 1 |    _err_            | ((Error?))          | The error that occurred, or a falsy value if there were no errors.  _(The exact format of this error varies depending on the SQL query you passed in and the database adapter you're using.  See examples below for links to relevant documentation.)_
| 2 |    _rawResult_      | ((Ref?))            | The raw result from the adapter.  _(The exact format of this raw result data varies depending on the SQL query you passed in and the database adapter you're using.  See examples below for links to relevant documentation.)_



### Example

Remember that usage and result data vary depending on the SQL query you send and the adapter you're using.  Below, you'll find two examples: one for PostgreSQL and one for MySQL.

##### PostgreSQL example

Communicate directly with [`pg`](http://npmjs.com/package/pg), an NPM package used for communicating with PostgreSQL databases:

```js
Pet.query('SELECT pet.name FROM pet WHERE pet.name = $1', [ 'dog' ] ,function(err, rawResult) {
  if (err) { return res.serverError(err); }

  sails.log(rawResult);
  // (result format depends on the SQL query that was passed in, and the adapter you're using)

  // Then parse the raw result and do whatever you like with it.

  return res.ok();

});
```

##### MySQL example

Assuming the `Pet` model is configured to use the `sails-mysql` adapter, the following code will communicate directly with [`mysql`](http://npmjs.com/package/mysql), an NPM package used for communicating with MySQL databases:

```js
Pet.query('SELECT pet.name FROM pet WHERE pet.name = ?', [ 'dog' ] ,function(err, rawResult) {
  if (err) { return res.serverError(err); }

  sails.log(rawResult);
  // ...grab appropriate data...
  // (result format depends on the SQL query that was passed in, and the adapter you're using)

  // Then parse the raw result and do whatever you like with it.

  return res.ok();

});
```

### Notes
> + This method only works with SQL databases.  To get access to the raw MongoDB collection, use [`.native()`](https://sailsjs.com/documentation/reference/waterline-orm/models/native).
> + This method **does not** support `.exec()` or `.then()`, and it **does not** return a promise.  If you want to "promisify" `.query()`, have a look at [this](http://stackoverflow.com/questions/21886630/how-to-use-model-query-with-promises-in-sailsjs-waterline).



<docmeta name="displayName" value=".query()">
<docmeta name="pageType" value="method">
<docmeta name="isDeprecated" value="true">
