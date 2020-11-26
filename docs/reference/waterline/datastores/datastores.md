# Working with datastores

**Datastores** represent the data sources configured for your app.  A datastore usually represents a particular database, whether that's a database running within a locally installed MySQL server, a remote PostgreSQL database running in your company's data center, or a remote MongoDB database hosted by a cloud provider.

### Configuring datastores

Datastores are configured in [`sails.config.datastores`](https://sailsjs.com/documentation/reference/configuration/sails-config-datastores).

Sails apps start out with an implicit datastore which is used by all of your models by default.  For many apps, this is sufficient, but if you are building an app that needs to work with multiple databases, you may also find it helpful to configure additional, named datastores like `legacyProductDb`.

### Using datastores without a model

Every [model](https://sailsjs.com/documentation/concepts/models-and-orm/models) in a Sails app is wired up to a particular datastore, so every time you call a built-in model method, the model communicates with its configured datastore implicitly.

Even so, it's sometimes useful to be able to communicate with a datastore _outside_ of the context of any particular model.  So, when your app lifts, Sails automatically instantiates objects called _registered datastore instances_ for each of your configured datastores.  To access one of these at runtime, call either [`sails.getDatastore()`](https://sailsjs.com/documentation/reference/application/sails-get-datastore) or the [`.getDatastore()` model method](https://sailsjs.com/documentation/reference/waterline-orm/models/get-datastore).  

Registered datastores expose some methods and properties of their own, like `.leaseConnection()` and `.manager`, which provide an easy way to talk directly to the underlying database.  (The rest of the pages in this section of the documentation are devoted to covering these datastore methods and properties in detail.)


<docmeta name="displayName" value="Datastores">
