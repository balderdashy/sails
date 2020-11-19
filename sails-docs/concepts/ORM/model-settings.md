# Model settings

In Sails, the top-level properties of model definitions are called **model settings**.  This includes everything from [attribute definitions](https://sailsjs.com/documentation/concepts/models-and-orm/model-settings#?attributes), to the [database settings](https://sailsjs.com/documentation/concepts/models-and-orm/model-settings#?datastore) the model will use, as well as a few other options.

The majority of this page is devoted to a complete tour of the model settings supported by Sails.  But before we begin, let's look at how to actually apply these settings in a Sails app.


### Overview

Model settings allow you to customize the behavior of the models in your Sails app.  They can be specified on a per-model basis by setting top-level properties in a [model definition](https://sailsjs.com/documentation/concepts/models-and-orm/models), or as app-wide defaults in [`sails.config.models`](https://sailsjs.com/documentation/reference/configuration/sails-config-models).

##### Changing default model settings

To modify the [default model settings](https://sailsjs.com/documentation/reference/configuration/sails-config-models) shared by all of the models in your app, edit [`config/models.js`](https://sailsjs.com/documentation/anatomy/my-app/config/models-js).

For example, when you generate a new app, Sails automatically includes three different default attributes in your `config/models.js` file:  `id`, `createdAt`, and `updatedAt`.  Let's say that, for all of your models, you wanted to use a slightly different, customized `id` attribute. To do so, you could just override `attributes: {  id: {...}  }` in your `config/models.js` definition.


##### Overriding settings for a particular model

To further customize these settings for a particular model, you can specify them as top-level properties in that model's definition file (e.g. `api/models/User.js`).  This will override default model settings with the same name.

For example, if you add `fetchRecordsOnUpdate: true` to one of your model definitions (`api/models/UploadedFile.js`), then that model will now return the records that were updated.  But the rest of your models will be unaffected: they will still use the default setting (which is `fetchRecordsOnUpdate: false`, unless you've changed it).


##### Choosing an approach

In your day to day development, the model setting you'll interact with most often is `attributes`. Attributes are used in almost every model definition, and some default attributes are included in `config/models.js`.  For future reference, here are a few additional tips:

+ If you are specifying a `tableName`, you should always do so on a per-model basis.  (An app-wide table name wouldn't make sense!)
+ There is no reason to specify an app-wide datastore, since you already have one out of the box (named "default"). Even so, you might want to override `datastore` for a particular model in certain situations&mdash;if, for example, your default datastore is PostgreSQL but you have an `CachedBloodworkReport` model that you want to live in Redis.
+ For the sake of clarity, it is best to only specify `migrate` and `schema` settings as app-wide defaults, never on a per-model basis.


Now that you have an idea of what model settings are and how to configure them, let's run through and have a look at each one.

--------------------




### attributes

The set of attribute definitions for a model.

```
attributes: { /* ... */ }
```

| Type           | Example                 | Default       |
| -------------- |:------------------------|:--------------|
| ((dictionary)) | _See below._            | `{}`          |

Most of the time, you'll define attributes in your individual model definitions (in `api/models/`), but you can also specify **default attributes** in `config/models.js`.  This allows you to define a set of global attributes in one place, then rely on Sails to make them available to all of your models implicitly and without repeating yourself.  Default attributes can also be overridden on a per-model basis by defining a replacement attribute with the same name in the relevant model definition.

```js
attributes: {
  id: { type: 'number', autoIncrement: true },
  createdAt: { type: 'number', autoCreatedAt: true },
  updatedAt: { type: 'number', autoUpdatedAt: true },
}
```

For a complete introduction to model attributes, including how to define and use them in your Sails app, see [Concepts > ORM > Attributes](https://sailsjs.com/documentation/concepts/orm/attributes).

### customToJSON

A function that allows you to customize the way a model's records are serialized to JSON.

```
customToJSON: function() { /*...*/ }
```

| Type         | Example                 | Default       |
| ------------ |:------------------------|:--------------|
| ((function)) | _See below._            | _n/a_         |

Adding the `customToJSON` setting to a model changes the way that the model&rsquo;s records are _stringified_.  In other words, it allows you to inject custom logic that runs any time one of these records are passed into `JSON.stringify()`.  This is most commonly used to implement a failsafe, making sure sensitive data like user passwords aren't accidentally included in a response (since [`res.send()`](https://sailsjs.com/documentation/reference/response-res/res-send) and actions2 may stringify data before sending).

The `customToJSON` function takes no arguments, but provides access to the record as the `this` variable.  This allows you to omit sensitive data and return the sanitized result, which is what `JSON.stringify()` will actually use when generating a JSON string.  For example:

```js
customToJSON: function() {
  // Return a shallow copy of this record with the password and ssn removed.
  return _.omit(this, ['password', 'ssn'])
}
```

The customToJSON function is deisgned not to support async capabilities. This allows synchronous bits in core to stay synchronous and provide better stability to the system as a whole.

> Note that the `this` variable available in `customToJSON` is a _direct reference to the actual record object_, so be careful not to modify it.  In other words, avoid writing code like `delete this.password`.  Instead, use methods like `_.omit()` or `_.pick()` to get a _copy_ of the record.  Or just construct a new dictionary and return that (e.g. `return { foo: this.foo }`).

### tableName

The name of the SQL table (/MongoDB collection) where a model will store and retrieve its records as rows (/MongoDB documents).

```
tableName: 'some_preexisting_table'
```

| Type        | Example                    | Default       |
| ----------- |:---------------------------|:--------------|
| ((string))  | `'some_preexisting_table'` | _Same as model's identity._

The **tableName** setting gives you the ability to customize the name of the underlying _physical model_ that a particular model should use.  In other words, it lets you control where a model stores and retrieves records within the database, _without_ affecting the code in your controller actions / helpers.

By default, Sails uses the model's [identity](https://sailsjs.com/documentation/concepts/models-and-orm/model-settings?identity) to determine its table name:

```js
await User.find();
// => SELECT * FROM user;
```

This is a recommended convention, and shouldn't need to be changed in most cases.  But, if you are sharing a legacy database with an existing application written for a different platform like Python or C#, or if your team prefers a different naming convention for their database tables, then it may be useful to customize this mapping.

Returning to the example above, if you modified your model definition in `api/models/User.js`, and set `tableName: 'foo_bar'`, then you'd see slightly different results:

```js
await User.find();
// => SELECT * FROM foo_bar;
```

> What's in a `tableName`?  In databases like MySQL and PostgreSQL, the setting refers to a literal "table".  In MongoDB, it refers to a "collection".  It's really just about familiarity: That which we call a "table", by any other word would query as well.



### migrate

The **auto-migration strategy** that Sails will run every time your app loads.

```
migrate: 'alter'
```

| Type        | Example                 | Default       |
| ----------- |:------------------------|:--------------|
| ((string))  | `'alter'`               | _You'll be prompted._<br/><br/>_**Note**: In production, this is always `'safe'`._

The `migrate` setting controls your app's auto-migration strategy.  In short, this tells Sails whether or not you'd like it to attempt to automatically rebuild the tables/collections/sets/etc. in your database(s).

##### Database migrations

In the course of developing an app, you will almost always need to make at least one or two **breaking changes** to the structure of your database.  Exactly _what_ constitutes a "breaking change" depends on the database you're using:  For example, imagine you add a new attribute to one of your model definitions.  If that model is configured to use MongoDB, then this is no big deal; you can keep developing as if nothing happened.  But if that model is configured to use MySQL, then there is an extra step: a column must be added to the corresponding table (otherwise model methods like `.create()` will stop working).  So for a model using MySQL, adding an attribute is a breaking change to the database schema.

> Even if all of your models use MongoDB, there are still some breaking schema changes to watch out for.  For example, if you add `unique: true` to one of your attributes, a [unique index](https://docs.mongodb.com/manual/core/index-unique/) must be created in MongoDB.


In Sails, there are two different modes of operation when it comes to [database migrations](https://en.wikipedia.org/wiki/Schema_migration):

1. **Manual migrations**: The art of updating your database tables/collections/sets/etc. by hand.  For example, writing a SQL query to [add a new column](http://dev.mysql.com/doc/refman/5.7/en/alter-table.html), or sending a [Mongo command to create a unique index](https://docs.mongodb.com/manual/core/index-unique/).  If the database contains data you care about (in production, for example), you must carefully consider whether that data needs to change to fit the new schema, and, if necessary, write scripts to migrate it.  While a [number of](https://www.npmjs.com/package/sails-migrations) great [open-source tools](http://knexjs.org/#Migrations-CLI) exist for managing manual migration scripts, as well as hosted products like the [database migration service on AWS](https://aws.amazon.com/blogs/aws/aws-database-migration-service/), we recommend doing all database migrations by hand, using [`sails run`](https://sailsjs.com/documentation/concepts/shell-scripts).
2. **Auto-migrations**: A convenient, built-in feature in Sails that allows you to make iterative changes to your model definitions during development, without worrying about the reprecussions.  Auto-migrations should _never_ be enabled when connecting to a database with data you care about.  Instead use auto-migrations with fake data, or with cached data that you can easily recreate.


Whenever you need to apply breaking changes to your _production database_, you should use manual database migrations. Otherwise, when you're developing on your laptop or running your automated tests, auto-migrations can save you tons of time.


##### How auto-migrations work

When you lift your Sails app in a development environment (e.g. running `sails lift` in a brand new Sails app), the configured auto-migration strategy will run.  If you are using `migrate: 'safe'`, then nothing additional will happen,  but if you are using `drop` or `alter`, Sails will load every record in your development database into memory, then drop and recreate the physical layer representation of the data (i.e. tables/collections/sets/etc.).  This allows any breaking changes you've made in your model definitions, like removing a uniqueness constraint, to be automatically applied to your development database.  Finally, if you are using `alter`, Sails will then attempt to re-seed the freshly generated tables/collections/sets with the records it saved earlier.


| Auto-migration strategy  | Description |
|:-------------------------|:---------------------------------------------|
| `safe`                    | never auto-migrate my database(s). I will do it myself, by hand.
| `alter`                   | auto-migrate columns/fields, but attempt to keep my existing data (experimental)
| `drop`                    | wipe/drop ALL my data and rebuild models every time I lift Sails


> Keep in mind that when using the `alter` or `drop` strategies, any manual changes you have made to your database since the last time you lifted your app may be lost.  This includes things like custom indexes, foreign key constraints, column order and comments.  In general, tables created by auto-migrations are not guaranteed to be consistent regarding any details of your physical database columns besides setting the column name, type (including character set / encoding if specified) and uniqueness.

##### Can I use auto-migrations in production?

The `drop` and `alter` auto-migration strategies in Sails exist as a feature for your convenience during development, and when running automated tests.  **They are not designed to be used with data you care about.**  Please take care to never use `drop` or `alter` with a production dataset.  In fact, as a failsafe to help protect you from doing this inadvertently, any time you lift your app [in a production environment](https://sailsjs.com/documentation/reference/configuration/sails-config#?sailsconfigenvironment), Sails _always_ uses `migrate: 'safe'`, no matter what you have configured.

In many cases, hosting providers automatically set the `NODE_ENV` environment variable to "production" when they detect a Node.js app.  Even so, please don't rely only on that failsafe, and take the usual precautions to keep your users' data safe.  Any time you connect Sails (or any other tool or framework) to a database with pre-existing production data, **do a dry run**,  especially the very first time.  Production data is sensitive, valuable, and in many cases irreplaceable.  Customers, users, and their lawyers are not cool with it getting flushed.

As a best practice, make sure to never lift or [deploy](https://sailsjs.com/documentation/concepts/deployment) your app with production database credentials unless you are 100% sure you are running in a production environment.  A popular approach for solving this at an organization-wide scale is simply to _never_ push up production database credentials to your source code repository in the first place, instead relying on [environment variables](https://sailsjs.com/documentation/reference/configuration) for all sensitive credentials.  (This is an especially good idea if your app is subject to regulatory requirements, or if a large number of people have access to your code base.)


##### Are auto-migrations slow?

If you are working with a relatively large amount of development/test data, the `alter` auto-migration strategy may take a long time to complete at startup.  If you notice that a command like `npm test`, `sails console`, or `sails lift` appears to hang, consider decreasing the size of your development dataset.  (Remember: Sails auto-migrations should only be used on your local laptop/desktop computer, and only with small, development datasets.)



### schema

Whether or not a model expects records to conform to a specific set of attributes.

```
schema: true
```

| Type        | Example                 | Default       |
| ----------- |:------------------------|:--------------|
| ((boolean)) | `true`                  | _Depends on the adapter._


The `schema` setting allows you to toggle a model between "schemaless" or "schemaful" mode.  More specifically, it governs the behavior of methods like `.create()` and `.update()`.  Normally you are allowed to store arbitrary data in a record, as long as the adapter you're using supports it.  But if you enable `schema:true`, only properties that correspond with the model's `attributes` will actually be stored.

> This setting is only relevant for models using schemaless databases like MongoDB.  When hooked up to a relational database like MySQL or PostgreSQL, a model is always effectively `schema:true`, since the underlying database can only store data in tables and columns that have been set up ahead of time.



### datastore

The name of the [datastore configuration](https://sailsjs.com/documentation/reference/configuration/sails-config-datastores) that a model will use to find records, create records, etc.

```
datastore: 'legacyECommerceDb'
```

| Type       | Example                 | Default       |
| ---------- |:------------------------|:--------------|
| ((string)) | `'legacyECommerceDb'`   | `'default'`   |

This allows you to indicate the database where this model will fetch and save its data.  Unless otherwise specified, every model in your app uses a built-in datastore named "default", which is included in every new Sails app out of the box.  This makes it easy to configure your app's primary database while still allowing you to override the `datastore` setting for any particular model.

For more about configuring your app's datastores, see [Reference > Configuration > Datastores](https://sailsjs.com/documentation/reference/configuration/sails-config-datastores).


### dataEncryptionKeys

A set of keys to use when decrypting data.  The `default` data encryption key (or "DEK") is always used for encryption unless configured otherwise.


```javascript
dataEncryptionKeys: {
  default: 'tVdQbq2JptoPp4oXGT94kKqF72iV0VKY/cnp7SjL7Ik='
}
```

> Unless your use case requires key rotation, the `default` key is all you need.  Any other data encryption keys besides `default` are just there to allow for decrypting older data that was encrypted with them.

##### Key rotation

To retire a data encryption key, you'll need to give it a new key id (like `2028`) and then create a new `default` key for use in any new encryption. For example, if you release a Sails app in year 2028 and your keys are rotated out yearly, then the following year your `dataEncryptionKeys` may look like this:

```javascript
dataEncryptionKeys: {
  default: 'DZ7MslaooGub3pS/0O734yeyPTAeZtd0Lrgeswwlt0s=',
  '2028': 'C5QAkA46HD9pK0m7293V2CzEVlJeSUXgwmxBAQVj+xU='
}
```

After changing out the default key _the year after that_ in January 2030, you might have:

```javascript
dataEncryptionKeys: {
  default: 'tVdQbq2JptoPp4oXGT94kKqF72iV0VKY/cnp7SjL7Ik=',
  '2029': 'DZ7MslaooGub3pS/0O734yeyPTAeZtd0Lrgeswwlt0s=',
  '2028': 'C5QAkA46HD9pK0m7293V2CzEVlJeSUXgwmxBAQVj+xU='
}
```


### cascadeOnDestroy

Whether or not to _always_ act like you set `cascade: true` any time you call `.destroy()` using this model.

```
cascadeOnDestroy: true
```

| Type        | Example                 | Default       |
| ----------- |:------------------------|:--------------|
| ((boolean)) | `true`                  | `false`

This is disabled by default, for performance reasons.  You can enable it with this model setting, or on a per-query basis using [`.meta({cascade: true})`](https://sailsjs.com/documentation/reference/waterline-orm/queries/meta).



### dontUseObjectIds

> ##### _**This feature is for use with the [`sails-mongo` adapter](https://sailsjs.com/documentation/concepts/extending-sails/adapters/available-adapters#?sailsmongo) only.**_

If set to `true`, the model will _not_ use an auto-generated MongoDB ObjectID object as its primary key.  This allows you to create models using the `sails-mongo` adapter with primary keys that are arbitrary strings or numbers, not just big long UUID-looking things.  Note that setting this to `true` means that you will have to provide a value for `id` in every call to [`.create()`](https://sailsjs.com/documentation/reference/waterline-orm/models/create) or [`.createEach()`](https://sailsjs.com/documentation/reference/waterline-orm/models/create-each).


| Type        | Example                 | Default       |
| ----------- |:------------------------|:--------------|
| ((boolean)) | `true`                  | `false`

This is disabled by default, for performance reasons.  You can enable it with this model setting, or on a per-query basis using [`.meta({dontUseObjectIds: true})`](https://sailsjs.com/documentation/reference/waterline-orm/queries/meta).



### Seldom-used settings

The following low-level settings are included in the spirit of completeness, but in practice, they should rarely (if ever) be changed.


##### primaryKey

The name of a model's primary key attribute.

> **You should never need to change this setting.  Instead, if you need to use a custom primary key, set a custom `columnName` on the "id" attribute.**

```javascript
primaryKey: 'id'
```

| Type       | Example       | Default       |
| ---------- |:--------------|:--------------|
| ((string)) | `'id'`        | `'id'`        |

Conventionally this is "id", a default attribute that is included for you automatically in the `config/models.js` file of new apps generated as of Sails v1.0.  The best way to change the primary key for your model is simply to customize the `columnName` of that default attribute.

For example, imagine you have a User model that needs to integrate with a table in a pre-existing MySQL database.  That table might have a column named something other than "id" (like "email_address") as its primary key.  To make your model respect that primary key, you'd specify an override for your `id` attribute in the model definition; like this:

```js
id: {
  type: 'string',
  columnName: 'email_address',
  required: true
}
```

Then, in your app's code, you'll be able to look up users by primary key, while the mapping to `email_address` in all generated SQL queries is taken care of for you automatically:

```js
await User.find({ id: req.param('emailAddress' });
```

> All caveats aside, lets say you're an avid user of MongoDB.  In your new Sails app, you'll start off by setting `columnName: '_id'` on your default "id" attribute in `config/models.js`.  Then you can use Sails and Waterline just like normal, and everything will work just fine.
>
> But what if you find yourself wishing that you could change the actual name of the "id" attribute itself for the sake of familiarity?  That way, when you call built-in model methods in your code, instead of the usual "id", you would use syntax like `.destroy({ _id: 'ba8319abd-13810-ab31815' })`.
>
> That's where this model setting might become useful.  All you'd have to do is edit `config/models.js` so that it contains `primaryKey: '_id'`, and then rename the default "id" attribute to "_id".  But there are some [good reasons to reconsider](https://gist.github.com/mikermcneil/9247a420488d86f09be342038e114a08) this course of action.

##### identity

The lowercase, unique identifier for a model.

> **A model's `identity` is read-only.  It is automatically derived, and should never be set by hand.**

```
Something.identity;
```

| Type       | Example       |
| ---------- |:--------------|
| ((string)) | `'purchase'`  |


In Sails, a model's `identity` is inferred automatically by lowercasing its filename and stripping off the file extension.  For example, the identity of `api/models/Purchase.js` would be `purchase`.  It would be accessible as `sails.models.purchase`, and if blueprint routes were enabled, you'd be able to reach it with requests like `GET /purchase` and `PATCH /purchase/1`.

```javascript
assert(Purchase.identity === 'purchase');
assert(sails.models.purchase.identity === 'purchase');
assert(Purchase === sails.models.purchase);
```



##### globalId

The unique global identifier for a model, which also determines the name of its corresponding global variable (if relevant).

> **A model's `globalId` is read-only.  It is automatically derived, and should never be set by hand.**

```
Something.globalId;
```

| Type       | Example       |
| ---------- |:--------------|
| ((string)) | `'Purchase'`  |

The primary purpose of a model's globalId is to determine the name of the global variable that Sails automatically exposes on its behalf&mdash;that is, unless globalization of models has been [disabled](https://sailsjs.com/documentation/concepts/globals?q=disabling-globals).  In Sails, a model's `globalId` is inferred automatically from its filename.  For example, the globalId of `api/models/Purchase.js` would be `Purchase`.

```javascript
assert(Purchase.globalId === 'Purchase');
assert(sails.models.purchase.globalId === 'Purchase');
if (sails.config.globals.models) {
  assert(sails.models.purchase === Purchase);
}
else {
  assert(typeof Purchase === 'undefined');
}
```


<docmeta name="displayName" value="Model settings">
