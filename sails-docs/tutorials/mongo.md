# Using MongoDB with Node.js/Sails.js

Sails supports the popular [MongoDB database](https://www.mongodb.com/) via the [sails-mongo adapter](https://www.npmjs.com/package/sails-mongo).

> First, make sure you have access to a running MongoDB server, either on your development machine or in the cloud.  Below, 'mongodb://root@localhost/foo' refers to a locally-installed MongoDB using "foo" as the database name.  Be sure to replace that [connection URL](https://sailsjs.com/documentation/reference/configuration/sails-config-datastores#?the-connection-url) with the appropriate string for your database.

### Developing locally with MongoDB

To use MongoDB in your Node.js/Sails app during development:

1. Run `npm install sails-mongo` in your app folder.
2. In your `config/datastores.js` file, edit the `default` datastore configuration:

    ```js
    default: {
      adapter: 'sails-mongo',
      url: 'mongodb://root@localhost/foo'
    }
    ```
3. In your `config/models.js` file, edit the default `id` attribute to have the appropriate `type` and `columnName` for MongoDB's primary keys:

    ```js
    attributes: {
      id: { type: 'string', columnName: '_id' },
      //…
    }
    ```

That's it!  Lift your app again and you should be good to go.

#### Case-sensitivity

After configuring your project to use MongoDB, you may notice that your Waterline [queries](https://sailsjs.com/documentation/reference/waterline-orm/queries) are now case-sensitive by default. To do case-insensitive queries, you can use [`.meta({makeLikeModifierCaseInsensitive: true})`](https://sailsjs.com/documentation/reference/waterline-orm/queries/meta).

### Deploying your app with MongoDB

To use MongoDB in production, edit your adapter setting in `config/env/production.js`:

```js
adapter: 'sails-mongo',
```

You may also configure your [connection URL](https://sailsjs.com/documentation/reference/configuration/sails-config-datastores#?the-connection-url) -- but many developers prefer not to check sensitive credentials into version control.  Another option is to use an environment variable:

```
sails_datastores__default__url=mongodb://heroku_12345678:random_password@ds029017.mLab.com:29017/heroku_12345678
```

> To use MongoDB in your staging environment, edit `config/env/staging.js`.  Depending on your application, it may be acceptable to check in your staging database credentials to version control, since they are less of a security risk.


### Low-level MongoDB usage (advanced)

As with all of the [Sails database adapters](https://sailsjs.com/documentation/concepts/extending-sails/adapters/available-adapters), you can use any of the [Waterline model methods](https://sailsjs.com/documentation/reference/waterline-orm/models) to interact with your models when using `sails-mongo`.

For many apps, that's all you'll need-- from "hello world" to production.  Even if you run into limitations, they can usually be worked around without writing Mongo-specific code.  However, for situations when there is no alternative, it is possible to use the Mongo driver directly in your Sails app.

To access the lower-level &ldquo;native&rdquo; MongoDB client directly, use the [`.manager`](https://sailsjs.com/documentation/reference/waterline-orm/datastores/manager) property of the [datastore instance](https://sailsjs.com/documentation/reference/application/sails-get-datastore).

As of `sails-mongo` v2.0.0 and above, you can access the [`MongoClient`](https://mongodb.github.io/node-mongodb-native/3.5/api/MongoClient.html) object via `manager.client`. This gives you access to the latest MongoDB improvements, like [`ClientSession`](https://mongodb.github.io/node-mongodb-native/3.5/api/ClientSession.html),
and with it, transactions, [change streams](https://mongodb.github.io/node-mongodb-native/3.5/api/ChangeStream.html), and other new features.

```js
var mongoClient = Pet.getDatastore().manager.client;

var results = await mongoClient.db('test')
.collection('pet')
.find({}, { name: 1 })
.toArray();

console.log(results);
```

For a full list of methods available in the native MongoDB client, see the [Node.js MongoDB Driver API reference](https://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html).


<docmeta name="displayName" value="Using MongoDB">
