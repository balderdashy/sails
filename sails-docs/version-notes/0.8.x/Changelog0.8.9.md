# Changelog 0.8.9
_April 9, 2013_
+ Controllers must now also be generated to use the default API (they can be empty)
+ Haml template support on back-end for new projects (thanks [@dcbartlett](https://github.com/dcbartlett))
+ default values in models (defaultsTo)
+ Chained policies fixed
+ Removed all reference to blueprints as "scaffolds". Blueprints are more than temporary placeholders-- they are the preferred method of serving an API from your app.
+ Refactored most of the code base
+ Removed CRUD synonyms
+ Main: Compatibility with Node v0.10.0 (patches node-dirty)
+ Main: Fixed crash that happened when absolute path was given as appPath
+ Assets: Added more logging features for LESS.
+ Assets: Reset.css now in mixins
+ Assets: LESS assets are deligated to Rack.LessAsset
+ Assets: LESS assets served from asset-rack will have their extensions changed to css
+ Policies: Implemented the controller syntax for defining a policy.
+ Naming: scaffolds is now known as blueprints
+ Naming: blueprints is now known as boilerplates
+ Routing: Added controller.action syntax
+ Routing: Removed CRUD Synonyms-- now you must explicitly use find, findAll, create, destroy, update (can't use `get`, `detail`, `delete`, `edit`, etc. to indicate the same thing. Turns out this was actually annoying, not helpful)
+ Routing: Fix in API blueprint for regression around PUT/DELETE automatic RESTful routes
+ Routing: Fix for resourceful routing. /model/[id] didn't work with verbs. It now does.
+ Config: _ and async no longer have to be global (but they are by default) They are configurable with `sails.config.globals._` and `sails.config.globals.async` (thanks [@particlebanana](https://github.com/particlebanana)!)
+ New sails project can now be created in the current dir with `sails new .` (thanks [@collinwren](https://github.com/collinwren)!)
+ More tests (thanks [@collinwren](https://github.com/collinwren) and [@benrudolph](https://github.com/benrudolph))
+ Travis CI integration (thanks [@collinwren](https://github.com/collinwren)!)


<docmeta name="displayName" value="0.8.9 Changelog">
<docmeta name="version" value="0.8.9">
