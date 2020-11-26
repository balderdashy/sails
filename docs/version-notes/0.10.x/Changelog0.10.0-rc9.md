# 0.10.0-rc9 Changelog

+ Associations
  + Adapter-level support for optimized joins (SQL databases and Mongo)
  + Built-in support for in-memory joins.  Allows for cross-database and even cross-adapter joins! (e.g. a User in Mongo has many Messages in a MySQL database called `legacy_messages`, and also a Role in a MySQL database called `myapp`.  These can be automatically joined together using the same ORM syntax as normal.)

+ Better Error Handling in Waterline

+ Revamped Sails CLI
  + Generators w/ support for coffeescript
  + Support for dry runs (`--dry`) for `sails generate` and `sails new`
  + Experimental support for custom generators

+ API Blueprints
  + Blueprints are injected into project, allowing the built-in API to be customized.
  + Dramatic simplification of how blueprints are injected-- by implicitly including them in the routes file.
  + Backwards compatibility for blueprints on <=v0.9 apps can be achieved by plugging in a simple config to re-enable the traditional support and configurations.
  + Blueprint routes automatically take associations into account, e.g.:
    + `GET /user/2/dogs` -- get dogs belonging to user #2
    + `GET /user/2/dad` -- get dad belonging to user #2
    + `PUT /user/2/dogs` -- add a dog to user #2
    + `DELETE /user/2/dogs/2` -- remove dog #5 from user #2

+ PubSub
  + Simplified dramatically- removed concept of class rooms (most of the time, this isn't exactly what you want anyways)
  + Blueprints still work the same way by introspecting your app's schema and taking advantage of information about assocations to create logical publish/subscribe dependencies, relying on the global channel in cases where a shared instance doesn't exist.
  + Reduced to a handful of simple methods:
    + `SomeModel.publish()` -- publish to model instance
    + `SomeModel.subscribe()` -- subscribe socket to model instance
    + `SomeModel.unsubscribe()` -- unsubscribe socket from model instance
    + `sails.publish()` -- publish to global channel
    + `sails.subscribe()` -- subscribe socket to global channel
    + `sails.unsubscribe()` -- unsubscribe socket to global channel

+ Error Negotiation Shortcuts
  + Automatically content-negotiate a response-- configurable in `500.js`, `404.js`, `400.js`, `403.js`
  + `res.serverError( msgOrObj )`
  + `res.notFound()`
  + `res.forbidden( msgOrObj )`
  + `res.badRequest( msgOrObj )`



# Deprecated
### Overview
The following features are considered deprecated and should at some point be removed from the codebase

# Dynamic Finder Methods

- .findOneBy`<attribute>`In()
- .findOneBy`<attribute>`Like()
- .findBy`<attribute>`In()
- .findBy`<attribute>`Like() 
- .countBy`<attribute>`In()
- .countBy`<attribute>`Like()
- .`<attribute>`Contains()
 
# CRUD Class Methods
- .findAll()
- .findOneLike()
- .findLike()
- .contains()
- .join()
- .select()
- .findOrCreateEach()
- .join()
- .startsWith()
- .endsWith()


<docmeta name="displayName" value="0.10.0-rc9 Changelog">
<docmeta name="version" value="0.10.0">
