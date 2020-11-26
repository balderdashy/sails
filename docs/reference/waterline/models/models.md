# Working with models

This section of the documentation focuses on the model methods provided by Waterline out of the box.  In addition to these, additional methods can come from hooks (like the [resourceful PubSub methods](https://sailsjs.com/documentation/reference/web-sockets/resourceful-pub-sub)) or be manually written in your app to wrap reusable custom code.

> + For an in-depth introduction to models in Sails/Waterline, see [Concepts > Models and ORM > Models](https://sailsjs.com/documentation/concepts/models-and-orm/models).
> + You can find an example of how to define a model [here](https://gist.github.com/rachaelshaw/f5bf442b2171154aa6021846d1a250f8).




### Built-in model methods

In general, model methods are _asynchronous_, meaning you cannot just call them and use the return value.  Instead, you must use callbacks, promises or async/await. 
Most built-in model methods accept a callback as an optional final argument. If the callback is not supplied, a chainable Query object is returned, which has methods like `.fetch()`, `.decrypt()`, and `.where()`. See [Working with Queries](https://sailsjs.com/documentation/reference/waterline-orm/queries) for more on that.

Here are some of the most common model methods you will encounter building Node.js apps in Sails:

 Method                | Summary
 --------------------- | ------------------------------------------------------------------------
 `.find()`             | Get an array of records which match the specified criteria.
 `.findOne()`          | Get the record which matches the specified criteria, or `undefined` if there isn't one.
 `.updateOne()`        | Update the record that matches the specified criteria, if there is one, using the specified `attrName:value` pairs.
 `.archiveOne()`       | Archive ("soft-delete") the record that matches the specified criteria, if there is one.
 `.destroyOne()`       | Permanently and irreversibly destroy the record that matches the specified criteria, if there is one.
 `.create()`           | Create a new record consisting of the specified values.
 `.createEach()`       | Create multiple new records at the same time.
 `.count()`            | Count the total number of records that match certain criteria.
 `.sum()`              | Compute the sum for a given attribute, totalled across all records that match certain criteria.
 `.avg()`              | Compute the arithmetic mean for an attribute, averaged over all records that match certain criteria.
 `.addToCollection()`      | Add existing records from an associated model to one of your collections.
 `.removeFromCollection()` | Remove record(s) from one of your collections.


These methods are just the beginning.  To read more about available model methods in Sails, check out the complete reference in the sidebar.



<!--
Not actually all that common:
 `.replaceCollection()`    | Replace all the members in one of your collections with a new set of records from its associated model.
 `.update()`           | Update records matching the specified criteria, setting the specified `attrName:value` pairs.
 `.archive()`          | Archive ("soft-delete") all records that match the specified criteria.
 `.stream()`           | Get records that meet the specified criteria one at a time (or batch at a time).
 `.native()`/`query()` | Make a direct call to the underlying database using a native query.
 `.findOrCreate()`     | Lookup a single record which matches the specified criteria, or create it if it doesn't.
 `.destroy()`          | Destroy records matching the specified criteria.

-->

<!-- ![screenshot of the api/models/ folder in a text editor](http://i.imgur.com/xdTZpKT.png) -->





### `sails.models`

If you need to disable global variables in Sails, you can still use `sails.models.<model_identity>` to access your models.
> Not sure of your model's `identity`? Check out [Concepts > Models and ORM > Model settings](https://sailsjs.com/documentation/concepts/models-and-orm/model-settings#?identity).

<docmeta name="displayName" value="Models">
