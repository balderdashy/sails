# Models

A model represents a set of structured data, called records.  Models usually correspond to a table/collection in a database, attributes correspond to columns/fields, and records correspond to rows/documents.

### Defining models

By convention, models are defined by creating a file in a Sails app's `api/models/` folder:

```javascript
// api/models/Product.js
module.exports = {
  attributes: {
    nameOnMenu: { type: 'string', required: true },
    price: { type: 'string', required: true },
    percentRealMeat: { type: 'number', defaultsTo: 20, columnType: 'FLOAT' },
    numCalories: { type: 'number' },
  },
};
```

For a complete walkthrough of available options when setting up a model definition, see [Model Settings](https://sailsjs.com/documentation/concepts/models-and-orm/model-settings), [Attributes](https://sailsjs.com/documentation/concepts/models-and-orm/attributes), and [Associations](https://sailsjs.com/documentation/concepts/models-and-orm/associations).

<!--
commented-out content at: https://gist.github.com/rachaelshaw/1d7a989f6685f11134de3a5c47b2ebb8#1


commented-out content at: https://gist.github.com/rachaelshaw/1d7a989f6685f11134de3a5c47b2ebb8#2
-->



### Using models

Once a Sails app is running, its models may be accessed from within controller actions, helpers, tests, and just about anywhere else you normally write backend code.  This allows your code's call model methods to communicate with your database (or even with multiple databases).

There are many built-in methods available on models, the most important of which are the model methods like [.find()](https://sailsjs.com/documentation/reference/waterline/models/find) and [.create()](https://sailsjs.com/documentation/reference/waterline/models/create).  You can find detailed usage documentation for methods like these in [Reference > Waterline (ORM) > Models](https://sailsjs.com/documentation/reference/waterline-orm/models).


### Query methods

Every model in Sails has a set of methods exposed on it to allow you to interact with the database in a normalized fashion. This is the primary way of interacting with your app's data.

Since they usually have to send a query to the database and wait for a response, most model methods are **asynchronous**.  That is, they don't come back with an answer right away.  Like other asynchronous logic in JavaScript (`setTimeout()` for example), that means we need some other way of determining when they've finished executing, whether they were successful, and, if not, what kind of error (or other exceptional circumstance) occurred.

In Node.js, Sails, and JavaScript in general, the recommended way to handle this is by using [`async/await`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await).

For more information about working with queries, see [Reference > Waterline (ORM) > Queries](https://sailsjs.com/documentation/reference/waterline-orm/queries).

### Resourceful pubsub methods

Sails also provides a few other "resourceful pubsub" (or RPS) methods specifically designed for performing simple realtime operations using dynamic rooms.  For more information about those methods, see [Reference > WebSockets > Resourceful PubSub](https://sailsjs.com/documentation/reference/web-sockets/resourceful-pub-sub).


### Custom model methods

In addition to the built-in functionality provided by Sails, you can also define your own custom model methods.  Custom model methods are most useful for extrapolating controller code that relates to a particular model. They allow code to be pulled out of controllers and inserted into reusuable functions that can be called from anywhere (independent of `req` or `res`).

> This feature takes advantage of the fact that models ignore unrecognized settings, so you do need to be careful about inadvertently overriding built-in methods (don't define methods named "create", for example).
>
> If you're at all unsure, write a [helper](https://sailsjs.com/documentation/concepts/helpers) instead.

Custom model methods can be synchronous or asynchronous functions, but more often than not, they're _asynchronous_.  By convention, asynchronous model methods should be `async` functions, which accept a dictionary of `options` as their argument.

For example:

```js
// in api/models/Monkey.js...

// Find monkeys with the same name as the specified person
findWithSameNameAsPerson: async function (opts) {
	var person = await Person.findOne({ id: opts.id });
	
	if (!person) {
		throw require('flaverr')({
      message: `Cannot find monkeys with the same name as the person w/ id=${opts.id} because that person does not exist.`,
      code: 'E_UNKNOWN_PERSON'
    });
	}
	
	return await Monkey.find({ name: person.name });
}
```
> Notice we didn't `try/catch` any of the code within that function. That's because we intend to leave that responsibility to whoever calls our function.

Then you can do:

```js
var monkeys = await Monkey.findWithSameNameAsPerson({id:37});
```

> For more tips, read about the incident involving [Timothy the Monkey]().

##### What about instance methods?

As of Sails v1.0, instance methods have been removed from Sails and Waterline.  While instance methods like `.save()` and `.destroy()` were sometimes convenient in app code, in Node.js at least, many users found that they led to unintended consequences and design pitfalls.

For example, consider an app that manages wedding records.  It might seem like a good idea to write an instance method on the Person model to update the `spouse` attribute on both individuals in the database.  This would allow you to write controller code like:

```js
personA.marry(personB, function (err) {
  if (err) { return res.serverError(err); }
  return res.ok();
})
```

Which looks great...until it comes time to implement a slightly different action with roughly the same logic, but where the only available data is the id of "personA" (not the entire record).  In that case, you're stuck rewriting your instance method as a static method anyway!

A better strategy is to write a custom (static) model method from the get-go.  This makes your function more reusable/versatile, since it will be accessible whether or not you have an actual record instance on hand.  You might refactor the code from the previous example to look like:

```js
Person.marry(personA.id, personB.id, function (err) {
  if (err) { return res.serverError(err); }
  return res.ok();
})
```

### Case sensitivity

Queries in Sails v1.0 are no longer forced to be case *insensitive* regardless of how the database processes the query. This leads to much-improved query performance and better index utilization. Most databases are case *sensitive* by default, but in the rare cases where they aren't and you would like to change that behavior you must modify the database to do so.

For example, MySQL will use a database collation that is case *insensitive* by default. This is different from sails-disk, so you may experience different results from development to production. In order to fix this, you can set the tables in your MySQL database to a case *sensitive* collation such as `utf8_bin`.


<!--
commented-out content at: https://gist.github.com/rachaelshaw/1d7a989f6685f11134de3a5c47b2ebb8#3


commented-out content at: https://gist.github.com/rachaelshaw/1d7a989f6685f11134de3a5c47b2ebb8#4

commented-out content at: https://gist.github.com/rachaelshaw/1d7a989f6685f11134de3a5c47b2ebb8#5

commented-out content at: https://gist.github.com/rachaelshaw/1d7a989f6685f11134de3a5c47b2ebb8#6
-->

<docmeta name="displayName" value="Models">
<docmeta name="nextUpLink" value="/documentation/concepts/configuration">
<docmeta name="nextUpName" value="Configuration">
