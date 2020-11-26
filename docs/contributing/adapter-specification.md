# Adapter interface reference

> The adapter interface specification is currently under active development and may change.


## Semantic (interface)
> e.g. `RestAPI` or `MySQL`

> ##### Stability: [3](http://nodejs.org/api/documentation.html#documentation_stability_index) - Stable

Implementing the basic semantic interface (CRUD) is really a step towards a complete implementation of the Queryable interface, but with some services/datasources, about as far as you'll be able to get using native methods.

By supporting the Semantic interface, you also get the following:
+ if you write a `find()` function, developers can also use all of its synonyms, including dynamic finders and `findOne()`.  When they're called, they'll automatically be converted into the appropriate criteria object for the basic `find()` definition in your adapter.
+ as long as you implement basic `where` functionality (see `Queryable` below), Waterline can derive a simplistic version of associations support for you.  To optimize the default assumptions with native methods, override the appropriate methods in your adapter.

<!--

Deprecated-- should be moved to the pubsub hook docs:

+ When a socket subscribes to one or more "instance room(s)" (e.g. `Foo.subscribe(req, [3,2]`), it will receive `Foo.publishUpdate()` and `Foo.publishDestroy()` notifications for the relevant instances.
+ If a socket is subscribed to an "instance room", it will also be subscribed for "updates" and "destroys" to all instances of other models with a 1:* association with `Foo`.  The socket will also be notified of and subscribed to new matching instances of the associated model.

+ automatic socket.io pubsub support is provided by Sails-- it manages "rooms" for every class (collection) and each instance (model)
  + As soon as a socket subscribes to the "class room" using `Foo.subscribe()`, it starts receiving `Foo.publishCreate()` notifications any time they're fired for `Foo`.
-->


> All officially supported Sails.js database adapters implement the `Semantic` interface.

###### Class methods
+ `Model.create()`
+ `Model.find()`
+ `Model.update()`
+ `Model.destroy()`
+ Optimizations:
  + `findOrCreate()`
  + `createEach()`
  + Not yet available:
    + `destroyEach()`
    + `updateEach()`
    + `findOrCreateEach()`
    + `findAndUpdateOrCreate()`
    + `findAndUpdateOrCreateEach()`

<!--
+ `henry.destroy()`
-->


## Queryable (interface)

> ##### Stability: [3](http://nodejs.org/api/documentation.html#documentation_stability_index) - Stable

Query building features are common in traditional ORMs, but not at all a guarantee when working with Waterline.  Since Waterline adapters can support services as varied as Twitter, SMTP, and Skype, traditional assumptions around structured data don't always apply.

If query modifiers are enabled, the adapter must support `Model.find()`, as well as the **complete** query interface, or, where it is impossible to do so, at least provide good error messages.  If coverage of the interface is unfinished, it's still not a bad idea to make the adapter available, but it's important to clearly state the unifinished parts, and consequent limitations, up front.  This helps prevent the creation of off-topic issues in Sails/Waterline core, protects developers from unexpected consequences, and perhaps most importantly, helps focus contributors on high-value tasks.

> All officially supported Sails.js database adapters implement this interface.

###### Query modifiers
Query modifiers include normalized syntax:
+ `where`
+ `limit`
+ `skip`
+ `sort`
+ `select`

And WHERE supports:

Boolean logic:
+ `and`
+ `or`
+ `not`


`IN` queries:
Adapters which implement `where` should recognize a list of values (e.g. `name: ['Gandalf', 'Merlin']`) as an `IN` query.  In other words, if `name` is either of those values, a match occured.

Sub-attribute modifiers:
You are also responsible for sub-attribute modifiers, (e.g. `{ age: { '>=' : 65 } }`) with the notable exception of `contains`, `startsWith`, and `endsWith`, since support for those modifiers can be derived programatically by leveraging your definition of  `like`.
+ `like`    (SQL-style, with % wildcards)
+ `'>' `    (you can also opt to use the more verbose `.greaterThan()`, etc.)
+ `'<' `
+ `'>='`
+ `'<='`


## Migratable (interface)

> ##### Stability: [1](http://nodejs.org/api/documentation.html#documentation_stability_index) - Experimental

Adapters which implement the Migratable interface are usually interacting with SQL databases.  This interface enables the `migrate` configuration option on a per-model or adapter-global basis, as well as access to the prototypal/class-level CRUD operations for working with tables.

###### Adapter methods

> This is not how it actually works, but how it could work soon:

+ `Adapter.define()`
+ `Adapter.describe()`
+ `Adapter.drop()`
+ `Adapter.alter()` (change table name, other table metadata)
+ `Adapter.addAttribute()` (add column)
+ `Adapter.removeAttribute()` (remove column)
+ `Adapter.alterAttribute()` (rename column, add or remove uniquness constraint to column)
+ `Adapter.addIndex()`
+ `Adapter.removeIndex()`


###### Auto-migration strategies
+ `"safe"` (default in production env)
  + do nothing
+ `"drop"` (default in development env)
  + drop all tables and recreate them each time the server starts-- useful for development
+ `"alter"`
  + experimental automigrations
+ `"create"`
  + create all missing tables/columns without modifying existing data



## SQL (interface)

> ##### Stability: [1](http://nodejs.org/api/documentation.html#documentation_stability_index) - Experimental

Adapters which implement the SQL interface interact with databases supporting the SQL language. This interface exposes the method `.query()` allowing the user to run *raw* SQL queries against the database.

###### Adapter methods

+ `Adapter.query(query,[ data,] cb)`


<!--
## Iterable (interface)

> ##### Stability: [1](http://nodejs.org/api/documentation.html#documentation_stability_index) - Experimental

#### Background

> Communicating with another server via messages/packets is the gold standard of performance--
> network latency is the slowest I/O operation computers deal with, yet ironically, the standard methodology
> used by most developers/frameworks/libraries outside of Node.js is detrimental to performance.
>
> In the Node community, you might say we're in the midst of a bit of an I/O renaissance.
>
> The standard approach to communicating with another server (or a disk) involves loading a message into memory
> from the source, and then sending the entire object to the destination at once.
>
> This is like trying to transport a heavy bag of gold over a river by wading across with it on your back.
> Even if you're very strong, with enough gold, you will drown.  This is analogous to your server
> running out of RAM as it buffers data in memory, and the resulting scalability problem.
>
> Using Node streams is a different ball game.  It's like splitting up the big bag into smaller containers, then
> floating them across one by one.  This way, no matter how much gold you end up with, you never drown.

A huge advantage of using Node.js is the ease with which you can parse and manipulate streams of data.  Instead of pulling an entire dataset into RAM, you can inspect it a little at a time.  This unlocks a level of performance that is unachievable using conventional approaches.

The most common use case is taking advantage of the available HTTP response stream to pipe the output byte stream from the database directly back to the user.  i.e. to generate a dynamic sitemap, you might need to respond with a huge set of data (far too large to fit in memory on a commodity server) and simultaneously transform it into XML.

#### Implementation

Implementing the Streaming CRUD interface is actually pretty simple-- you just need to get comfortable with Node.js streams.  You can mutate streams as they come in-- you just need to find or design a mapping function designed for streams, where you don't have all the data at once.



## Blob / Readable / Writable (interface)

> ##### Stability: [1](http://nodejs.org/api/documentation.html#documentation_stability_index) - Experimental

e.g. `sails-local-fs`, `sails-s3`

Implementing the Blob interface allows you to upload and download binary data (aka files) to the service/database.  These "blobs" might be MP3 music files (~5MB) but they could also be data-center backups (~50TB).  Because of this, it's crucial that adapters which implement this interface use streams for uploads (incoming, into data source from Sails) and downloads (outgoing, from data source to Sails).

###### Class methods
+ `write( id, options )` or `upload()`
+ `read( id, options )` or `download()`



## Mesageable (interface)

> ##### Stability: [1](http://nodejs.org/api/documentation.html#documentation_stability_index) - Experimental

Adapters which implement one-way messages.  This lets user know two important facts about your adapter:

1. that it's not safe to assume that its operations are reversible or atomic.
2. that it has a `send` or one or more `send*()` methods with a custom suffix.

An example of one such adapter is SMTP, for sending email, or APNS for sending Apple push notifications.

If `send` is passed an array of target ids, it will broadcast its data to each of them.

###### Class methods
+ `send( targetId, data, onComplete )`
+ Optimizations:
  + `broadcast( targetIds, data, onComplete )`



## Subscribable (interface)

> ##### Stability: [1](http://nodejs.org/api/documentation.html#documentation_stability_index) - Experimental

Adapters implementing the pubsub interface report changes from the service/database back up to the app.

When a subscriber needs to be informed of an incoming notifiation, the subscribable adapters currently do one of the following:

1. emit a declaratively configurable event on the `sails` object.
2. send an HTTP request to a declaratively configurable endpoint.
3. call a function which is part of their declarative config, leveraging the generic `req/res` interpreter in Sails

(#3 is where I'd like this head in the future, since it provides the most normalized, extensible interface)

-->

<!--
deprecated:

They should call Sails' `Model.publishUpdate()`, `Model.publishCreate()`, and `Model.publishDestroy()` to publish changes and take advantage of automatic room management functionality.
`Model.subscribe()` should still be called at the app layer, not in our adapter.
We don't want to force users to handle realtime events-- we don't know the specific goals and requiements of their app, and since the broadcasts are volatile, pubsub notifications is a feature that should be opt-in anyway.
-->
<!--
Examples:
+ Twitter streaming API (see new tweets as they come in)
+ IRC (see new chats as they come in)
+ Stock prices (visualize the latest market data as soon as it is available)
+ Hardware scanners (see new data as it comes in)

-->

<docmeta name="notShownOnWebsite" value="true">

