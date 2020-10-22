# Adapters

### What is an adapter?

In Sails and Waterline, database adapters (often simply called "adapters", for short) allow the models in your Sails app to communicate with your database(s). In other words, when your code in a controller action or helper calls a model method like `User.find()`, what happens next is determined by the [configured adapter](https://sailsjs.com/documentation/reference/configuration/sails-config-datastores).

An adapter is defined as a dictionary (aka JavaScript object, like `{}`) with methods like `find`, `create`, etc.  Based on which methods it implements, and the completeness with which they are implemented, adapters are said to implement one or more **interface layers**.  Each interface layer implies a contract to implement certain functionality.  This allows Sails and Waterline to guarantee conventional usage patterns across multiple models, developers, apps, and even companies, making app code more maintainable, efficient, and reliable.

> In previous versions of Sails, adapters were sometimes used for other purposes, like communicating with certain kinds of RESTful web APIs, internal/proprietary web services, or even hardware.  But _truly_ RESTful APIs are very rare, and so, in most cases, writing a database adapter to integrate with a _non-database API_ can be limiting.  Luckily, there is now a [more straightforward way](https://sailsjs.com/documentation/concepts/helpers) to build these types of integrations.


### What kind of things can I do in an adapter?

Adapters are mainly focused on providing model-contextualized CRUD methods.  CRUD stands for create, read, update, and delete.  In Sails/Waterline, we call these methods `create()`, `find()`, `update()`, and `destroy()`.

For example, a `MySQLAdapter` implements a `create()` method which, internally, calls out to a MySQL database using the specified table name and connection information and runs an `INSERT ...` SQL query.


### Next steps

Read about [available adapters](https://sailsjs.com/documentation/concepts/extending-sails/adapters/available-adapters), or how to make your own [custom adapter](https://sailsjs.com/documentation/concepts/extending-sails/adapters/custom-adapters).


<docmeta name="displayName" value="Adapters">
<docmeta name="stabilityIndex" value="3">
