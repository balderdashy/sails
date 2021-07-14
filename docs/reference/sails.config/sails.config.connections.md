# `sails.config.datastores`

### What is this?

Datastore configurations (or simply datastores) are like "saved settings" for your adapters.

In Sails, [database adapters](https://sailsjs.com/documentation/concepts/extending-sails/adapters) are the middleman between your app and some kind of structured data storage (typically a database).  But in order for an adapter to communicate between your Sails app and a particular database, it needs some additional information.  That's where datastores come in.  Datastores are dictionaries (plain JavaScript objects) that specify an `adapter`, as well as other necessary configuration information, like `url`, or `host`, `port`, `user`, and `password`.

While this [can be overridden](https://sailsjs.com/documentation/concepts/orm/model-settings) on a per-model basis, out of the box, every model in your app uses a datastore named "default".


### The default datastore

##### The default development database
As a convenience during development, Sails provides a built-in database adapter called `sails-disk`.  This adapter simulates a real database by reading and writing database records to a JSON file on your computer's hard drive.  And while `sails-disk` makes it easy to run your Sails/Node.js app in almost any environment with minimal setup, it is not designed for production use.  Before deploying your app and exposing it to real users, you'll want to choose a proper database such as PostgreSQL, MySQL, MongoDB, etc.  To do that, you'll need to customize your app's default datastore.

##### Using a local MySQL database in development
Unsurprisingly, the default datastore shared by all of your app's models is named "default".  So to hook up a different database, that's the key you'll want to change.  For example, imagine you want to develop against a MySQL server installed locally on your laptop:

First, install the [MySQL adapter](http://npmjs.com/package/sails-mysql) for Sails and Waterline:

```bash
npm install sails-mysql --save --save-exact
```

Then edit your default datastore configuration in `config/datastores.js` so that it looks something like this:

```javascript
// config/datastores.js
module.exports.datastores = {
  default: {
    adapter: require('sails-mysql'),
    url: 'mysql://root:squ1ddy@localhost:3306/my_dev_db_name',
  }
};
```

That's it!  The next time you lift your app, all of your models will communicate with the specified MySQL database whenever your code executes built-in model methods like `.create()` or `.find()`.

> Want to use a different database?  Don't worry, MySQL is just an example. You can use any [supported database adapter](https://sailsjs.com/documentation/concepts/extending-sails/adapters/available-adapters) in your Sails app.


### The connection URL

You might have noticed that we used `url` here, instead of specifying individual settings like `host`, `port`, `user`, `password`, and `database`.  This is called a _connection URL_ (or "connection string"), and it's just another, more concise way, to tell Sails and Waterline about your datastore configuration.

One major benefit to this style of configuration is that the format of a connection URL is the same across various types of databases. In other words, whether you're using MySQL, PostgreSQL, MongoDB, or almost any other common database technology, you can specify basic configuration using a URL that looks roughly the same:

```
protocol://user:password@host:port/database
```

The `protocol://` chunk of the URL is always based on the adapter you're using (`mysql://`, `mongodb://`, etc.), and the rest of the URL is composed of the credentials and network information that your app needs to locate and connect to the database.  Here's a deconstructed version of the `url` from the MySQL example above that shows what each section is called:

```
mysql://  root  :  squ1ddy   @  localhost  :  3306  /  my_dev_db_name
|         |        |            |             |        |
|         |        |            |             |        |
protocol  user     password     host          port     database
```

In production, if you are using a cloud-hosted database, you'll probably be given a connection URL (e.g. `mysql://lkjdsf4:kw8sd@us-west-2.64-8.amazonaws.com:3306/4e843g`).  If not, it's usually a good idea to build one yourself from the individual pieces of information.  For more information about how to configure your particular database, check out the [database adapter reference](https://sailsjs.com/documentation/concepts/extending-sails/adapters/available-adapters).

##### Building your own connection URL

If you have all of the pieces of information mentioned above, building a connection URL is easy: you just stick them together.  But sometimes, you may not want to specify _all_ of those details (if you want to use the default port, or if you're using a local database that does not require a username and password, for example).

Fortunately, since database connection URLs are more or less just normal URLs, you can omit various pieces of information in the same way you might already be familiar with.  For example, here are a few common mashups, all of which are potentially valid connection URLs:

+ `protocol://user:password@host:port/databaseName`
+ `protocol://user:password@host/databaseName` _(no port)_
+ `protocol://user@host:port/databaseName` _(no password)_
+ `protocol://host:port/databaseName` _(neither a username nor a password)_

> Connection URLs are the recommended approach for configuring your Sails app's database(s), so it's best to stick with them if possible.  But technically, _some adapters_ also support configuration of individual settings (`user`, `password`, `host`, `port`, and `database`) as an alternative.  In that scenario, if both the `url` notation and individual settings are used, the non-url configuration options should always take precedence.  You should, however, always use one approach or the other: either the `url` or the individual properties.  Mixing the two configuration strategies may confuse the adapter, or cause the underlying database driver to reject your configuration.

### Production datastore configuration

When configuring your app for a production deployment, you won't actually use the `config/datastores.js` file.  Instead, you can take advantage of `config/env/production.js`, a special file of configuration overrides that only get applied in a production environment.  This allows you to override the `url` and `adapter` (or just the `url`) that you set in `config/datastores.js`:

```javascript
// config/env/production.js
module.exports = {
  // ...
  // Override the default datastore settings in production.
  datastores: {
    default: {
      // No need to set `adapter` again, because we already configured it in `config/datastores.js`.
      url: 'mysql://lkjdsf4a23d9xf4:kkwer4l8adsfasd@u23jrsdfsdf0sad.aasdfsdfsafd.us-west-2.ere.amazonaws.com:3306/ke9944a4x23423g',
    }
  },
  // ...
};
```

Connection URLs really shine in production, because you can change them by swapping out a single config key.  Not only does this make your production settings easier to understand, it also allows you to swap out your production database credentials simply by setting an [environment variable](https://sailsjs.com/documentation/concepts/configuration#?setting-sailsconfig-values-directly-using-environment-variables) (`sails_datastores__default__url`).  This is a handy way to avoid immortalizing sensitive database credentials as commits in your version control system.


### Supported databases

Sails's ORM, [Waterline](https://sailsjs.com/documentation/concepts/models-and-orm), has a well-defined adapter system for supporting all kinds of datastores.  The Sails core team maintains official adapters for [MySQL](http://npmjs.com/package/sails-mysql), [PostgreSQL](http://npmjs.com/package/sails-postgresql), [MongoDB](http://npmjs.com/package/sails-mongo), and [local disk](http://npmjs.com/package/sails-disk); and community adapters exist for databases like Oracle, DB2, MSSQL, OrientDB, and many more.

You can find an up-to-date list of supported database adapters [here](https://sailsjs.com/documentation/concepts/extending-sails/adapters/available-adapters).

> Still can't find the adapter for your database?  You can also create a [custom adapter](https://sailsjs.com/documentation/concepts/extending-sails/adapters/custom-adapters).  Or if you'd like to modify/update an existing adapter, get in touch with its maintainer.  (Need help?  Click [here](https://sailsjs.com/support) for additional resources.)


### Multiple datastores

You can set up more than one datastore pointed at the same adapter, or at different adapters.

For example, you might be using MySQL as your primary database but also need to integrate with a _second_ MySQL database that contains data from an existing Java or PHP app.  Meanwhile, you might need to integrate with a _third_ MongoDB database that was left over from a promotional campaign a few months ago.

You could set up `config/datastores.js` as follows:

```javascript
// config/datastores.js
module.exports.datastores = {
  default: {
    adapter: require('sails-mysql'),
    url: 'mysql://root@localhost:3306/dev',
  },
  existingEcommerceDb: {
    adapter: require('sails-mysql'),
    url: 'mysql://djbluegrass:0ldy3ll3r@legacy.example.com:3306/store',
  },
  q3PromoDb: {
    adapter: require('sails-mongo'),
    url: 'mongodb://djbluegrass:0ldy3ll3r@seasonal-pet-sweaters-promo.example.com:27017/promotional',
  }
};

```

> **Note:** If a datastore is using a particular adapter, then _all_ datastores that share that adapter will be loaded on `sails lift`, whether or not models are actually using them.  In the example above, if a model was defined with `datastore: 'existingEcommerceDb'`, then at runtime Waterline would create two MySQL connection pools: one for `existingEcommerceDb` and one for `default`.  Because of this behavior, we recommend commenting out or removing any "aspirational" datastore configurations that you're not actually using from `config/datastores.js`.


### Best practices
Some general rules of thumb:

+ To change the datastore you're using _during development_, edit the `default` key in `config/datastores.js` (or use `config/local.js` if you'd rather not check in your credentials).
+ To configure your default _production_ datastore, use `config/env/production.js` (or set environment variables if you'd rather not check in your credentials).
+ To override the datastore for a particular model, [set its `datastore`](https://sailsjs.com/documentation/concepts/models-and-orm/model-settings#?datastore).
+ Besides the `config/datastores.js` and `config/env/production.js` files, you can configure datastores in [the same way you configure anything else in Sails](https://sailsjs.com/documentation/concepts/configuration), including environment variables, command-line options, and more.



<docmeta name="displayName" value="sails.config.datastores">
<docmeta name="pageType" value="property">
