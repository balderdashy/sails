# Custom adapters

Sails makes it fairly easy to write your own database adapter.  Custom adapters can be built directly in your app (`api/adapters/`) or published as NPM packages.  Check out [Intro to Custom Adapters](https://github.com/balderdashy/sails/blob/master/docs/contributing/intro-to-custom-adapters.md), the [Adapter Interface Reference](https://github.com/balderdashy/sails/blob/master/docs/contributing/adapter-specification.md), and [sails-adapter-boilerplate](https://github.com/balderdashy/sails-adapter-boilerplate) for more information about creating your own adapter.


### Where does my adapter go?

There are two different places you can build an adapter:

##### In your app's `api/adapters/` folder

If an adapter is only going to be used in one app (e.g. a short-term fork of an existing adapter) you can put it in `api/adapters/`.  This is what you get out of the box when you run `sails generate adapter`.  In this case, the name of the adapter is determined by the name of the folder inside `api/adapters/` (by convention, the entry point for your adapter should be `index.js`).

##### In a separate repo

Go with this option if you plan to share your adapter between multiple Sails apps, whether that's within your organization or as an open-source package for other members of the Sails/Node.js community at large.  To use an externalized adapter like this, you'll need to do `npm install your-adapter-package-name` or `npm link your-adapter-package-name`.

> Before you start on an open-source adapter, we recommend you search GitHub for `sails-databasename` and `waterline-databasename` to check if a project already exists. If it does, it's generally a good idea to approach the author of an existing adapter and offer to contribute instead of starting a new project. Most developers will welcome your help, and the combined efforts will likely result in a better quality adapter. If one doesn't exist, we recommend you create a new project and name it following the convention: `sails-databasename`.


### What goes in a custom adapter?

In Sails, database adapters expose **interfaces**, which imply a contract to implement certain functionality.  This allows us to guarantee conventional usage patterns across multiple models, developers, apps, and even companies, making app code more maintainable, efficient, and reliable.  Adapters are primarily useful for integrating with databases, but they can also be used to support any open API or internal/proprietary web service that is _purely_ RESTful.

> Not everything fits perfectly into a RESTful/CRUD mold.  Sometimes the service you're integrating with has an RPC-style interface with one-off methods.  For example, consider an API request to send an email, or to read a remote sensor on a piece of connected hardware.  For that, you'll want to write or extend a machinepack.  [Learn more about machinepacks here](http://node-machine.org).


### What kind of things can I do in an adapter?

Adapters are mainly focused on providing model-contextualized CRUD methods.  CRUD stands for create, read, update, and delete.  In Sails/Waterline, we call these methods `create()`, `find()`, `update()`, and `destroy()`.

For example, a `MySQLAdapter` implements a `create()` method which, internally, calls out to a MySQL database using the specified table name and connection information and runs an `INSERT ...` SQL query.

In practice, your adapter can really do anything it likes&mdash;any method you write will be exposed on the raw datastore objects and any models which use them.

### Building a custom adapter

Check out the [Sails docs](https://sailsjs.com/documentation), or see [`config/datastores.js`](https://sailsjs.com/anatomy/config/datastores.js) in a new Sails project for information on setting up this adapter in a Sails app.


#### Running the tests

Configure the interfaces you plan to support (and the targeted version of Sails) in the adapter's `package.json` file:

```javascript
{
  //...
  "sails": {
  	"adapter": {
	    "sailsVersion": "^1.0.0",
	    "implements": [
	      "semantic",
	      "queryable"
	    ]
	  }
  }
}
```

In your adapter's directory, run:

```sh
$ npm test
```


#### Publish your adapter

> You're welcome to write proprietary adapters and use them any way you wish&mdash;
> these instructions are for releasing an open-source adapter.

1. Create a [new public repo](https://github.com/new) and add it as a remote (`git remote add origin git@github.com:yourusername/sails-youradaptername.git).
2. Make sure you attribute yourself as the author and set the license in the package.json to "MIT".
3. Run the tests one last time.
4. Do a [pull request to the docs](https://github.com/balderdashy/sails/edit/master/docs/concepts/extending-sails/Adapters/adapterList.md), adding your adapter's repo.
5. We'll update the documentation with information about your new adapter.
6. Let the people of the world adore you with lavish praise.
7. Run `npm version patch`.
8. Run `git push && git push --tags`.
9. Run `npm publish`.



### Why would I need a custom adapter?

When building a Sails app, the sending or receiving of any asynchronous communication with another piece of hardware can _technically_ be normalized into an adapter (viz. API integrations).

> **From Wikipedia:**
> *http://en.wikipedia.org/wiki/Create,_read,_update_and_delete*

> Although a relational database provides a common persistence layer in software applications, numerous other persistence layers exist. CRUD functionality can be implemented with an object database, an XML database, flat text files, custom file formats, tape, or card, for example.

In other words, Waterline is not _necessarily_ just an ORM for your database.  It is a purpose-agnostic open standard and toolset for integrating with all kinds of RESTful services, datasources, and devices&mdash;whether it's LDAP, Neo4J, or [a lamp](https://www.youtube.com/watch?v=OmcQZD_LIAE).

> **But remember:** only use Waterline adapters for communicating with databases and APIs that support a "create", "read", "update", and "destroy" interface.  Not everything fits into that mold, and there are [better, more generic ways](http://node-machine.org) to address those other use cases.


### Why should I build a custom adapter?

To recap, writing your API integrations as adapters is **easier**, takes **less time**, and **absorbs a considerable amount of risk**, since you get the advantage of a **standardized set of conventions**, a **documented API**, and a **built-in community** of other developers who have gone through the same process.  Best of all, you (and your team) can **reuse the adapter** in other projects, **speeding up development** and **saving time and money**.

Finally, if you choose to release your adapter as open source, you provide a tremendous boon to our little framework and our budding Sails.js ecosystem.  Even if it's not via Sails, I encourage you to give back to the OSS community, even if you've never forked a repo before&mdash;don't be intimidated, it's not that bad!

The more high-quality adapters the Sails community collectively releases as open source, the less repetitive work we all have to do when we integrate with various databases and services.  Our vision is to make building server-side apps more fun and less repetitive for everyone, and that happens one community adapter (or machinepack/driver/generator/view engine/etc.) at a time.


### What is an adapter interface?

The functionality of database adapters is as varied as the services they connect.  That said, there is a standard library of methods, and a support matrix you should be aware of.  Adapters may implement some, all, or none of the interfaces below, but rest assured that **if an adapter implements one method in an interface, it should implement *all* of them**.  This is not always the case due to limitations and/or incomplete implementations, but at the very least, a descriptive error message should be used to keep developers informed of what's supported and what's not.

> For more information, check out the Sails docs, and specifically the [adapter interface reference](https://github.com/balderdashy/sails/blob/master/docs/contributing/adapter-specification.md).

### Are there examples I can look at?

If you're looking for some inspiration, a good place to start is with the core adapters.  Take a look at **[MySQL](https://github.com/balderdashy/sails-mysql)**, **[PostgreSQL](https://github.com/balderdashy/sails-postgresql)**, **[MongoDB](https://github.com/balderdashy/sails-mongo)**, **[Redis](https://github.com/balderdashy/sails-redis)**, or local [disk](https://github.com/balderdashy/sails-disk).


### Where do I get help?

An active community of Sails and Waterline users exists on GitHub, Stack Overflow, Google groups, IRC, Gitter, and more.  See the [Support page](https://sailsjs.com/support) for a list of recommendations.

> If you have an unanswered question that isn't covered here, and that you feel would add value for the community, please feel free to send a PR adding it to this section of the docs.




<docmeta name="displayName" value="Custom adapters">
