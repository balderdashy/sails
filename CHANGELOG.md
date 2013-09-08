# Changelog

## 0.9.4  (latest stable)
*September 5, 2013*
+ Main: CORS support added as a configurable hook.
+ Config: Sails core is no longer automatically copied as a dependency during `sails new`.  This speeds up the process significantly and avoids occassional recursive copy death spirals.
+ Config: Added explicit `--port` option to `sails lift`.
+ Assets: CoffeeScript can now be used in linked assets, and will automatically be compiled by Grunt.
+ i18n: Upgraded to 0.4.1.
+ Sockets: Added query string parsing to requests.
+ Sockets: Headers can now be specified in requests.
+ Routing: Fixed issues with default 404 and 500 responses.

## 0.9.3

## 0.9.2

## 0.9.1


## 0.9.0
*July 10, 2013*

### Sails.JS
+ Main: Express 3.x has been integrated.
+ Main: CSRF Attack Protection was added as part of the core.  Uses express-csrf, plus a token-based approach for SPAs and embedded apps (Chrome extensions, javascript plugins).
+ Main: Most of the core has been refactored for performance, code clarity, and simplicity to make contributions easier.
+ Main: Most of the core has been pulled into hooks.  In a subsequent patch release for 0.9.x, this process will make Socket.io optional.
+ Controllers: Automatic routing is now disable-able.
+ Assets: Grunt integration replaces Asset Rack.
+ Assets: Public folder removed from new projects.
+ Assets: Temporary 'public' folder is automatically built on lift, using the contents of the assets folder.
+ Assets: Static assets can be compiled with "sails build" for external hosting of front-end assets
+ Assets: Grunt ecosystem allows for a <a href="https://github.com/gruntjs/grunt-contrib">wide variety</a> of front-end template/css/js preprocessor support (sass, hbs, stylus, dust, typescript, etc.)
+ Routing: Automatic 404 and 500 routing is replaced.
+ Assets: Asset bundling is now disabled by default, use `sails new foo --linker` to enable it
+ Config: Most configuration is now also explicit in new projects.  Defaults are still provided underneath.
+ Sockets: Socket.IO can now be configured with the options detailed in config/io.js.
+ Sockets: Built-in support for Redis MQ-- allows you to scale realtime apps to a multi-instance deployment without necessitating sticky sessions at your load balancer.
+ Views: Express 3 killed support for layouts/view partials.  Sails has been extended to maintain support for them with ejs and jade, but otherwise you are limited to what is supported by the engine itself.
+ Views: Automatic routing to views is now disable-able.
+ Sessions: Built-in support for Redis and Mongo sessions for scaling your app to multi-instance deployments.

### Waterline
+ ORM: Waterline has been pulled out of Sails.js... Again. (See [Waterline](http://www.github.com/balderdashy/waterline))
+ ORM: Model attributes now support validations. (See [Anchor](http://www.github.com/balderdashy/anchor))
+ ORM: Custom instance methods can now be defined on models as virtual attributes.
+ ORM: Lifecycle Callbacks have been added. (See [Lifecycle Callbacks]())
+ ORM: findAll() has been replaced with find().
+ ORM: find() has been replaced with findOne().
+ ORM: .done() promise now works on all ORM methods
+ ORM: Complete support for the Promise specificiation has been added.

### Anchor
+ Validations:  Too many added to list, see [Validations]()

## 0.8.9
*April 9, 2013*

+ Controllers must now also be generated to use the default API (they can be empty)
+ Haml template support on back-end for new projects (thanks @dcbartlett)
+ default values in models (defaultsTo)
+ Chained policies fixed
+ Removed all reference to blueprints as "scaffolds".  Blueprints are more than temporary placeholders-- they are the preferred method of serving an API from your app.
+ Refactored most of the code base
+ Removed CRUD synonyms
+ Main: Compatibility with Node v0.10.0 (patches node-dirty)
+ Main: Fixed crash that happened when absolute path was given as appPath
+ Assets: Added more logging features for less.
+ Assets: Reset.css now in mixins
+ Assets: Less assets are deligated to _Rack.LessAsset_
+ Assets: Less assets served from asset-rack will have their extensions changed to css
+ Policies: Implemented the controller syntax for defining a policy.
+ Naming: _scaffolds_ is now known as _blueprints_
+ Naming: _blueprints_ is now known as _boilerplates_
+ Routing: Added _controller.action_ syntax
+ Routing: Removed CRUD Synonyms-- now you must explicitly use find, findAll, create, destroy, update  (cant use `get`,`detail`, `delete`, `edit`, etc. to indicate the same thing.  Turns out this was actually annoying, not helpful)
+ Routing: Fix in API blueprint for regression around PUT/DELETE automatic RESTful routes
+ Routing: Fix for resourceful routing.  /model/[id] didn't work with verbs.  Does now.
+ Config: _ and async no longer have to be global (but they are by default) They are configurable with `sails.config.globals._` and `sails.config.globals.async` (thanks @particlebanana!)
+ New sails project can now be created in the current dir with `sails new .` (thanks @collinwren!)
+ More tests (thanks @collinwren and @benrudolph)
+ Travis CI integration (thanks @collinwren!)

## 0.8.895
+ Policies: Fixed the "*" route for controllers.
+ Policies: The "*" policy can now be set to _false_
+ Collections: Type restrictions are cleaner
+ Adapters: Default was changed to memory due to an issue with node-dirty
+ Log: _sails.config.log.level_ is passed to socket.io
+ Assets: Bug fixed: not calling next when compiling less with syntax (thanks vicapow)
+ Assets: Typescript supported on front end (thanks Diullei)
+ Assets: Meaningful less errors were added (thanks vicapow)

## 0.8.892
+ Front-end CoffeeScript support in AssetRack (thanks @techpines!)
+ Chained policy support
+ New styles for default home page (thanks @egdelwonk!)
+ Windows compat. fix (thanks @feroc1ty!)
+ Support for string IDs (thanks @tedkulp!)
+ Attribute scaffolding for model generation (thanks @Tidwell)
+ Support for big int string conversion in id normalization (thanks @d4mn!)

## 0.8.88
+ Adds coffeescript support on the front-end in dev and production environments via [asset-rack](https://github.com/techpines/asset-rack) (thanks @techpines!)

## 0.8.87
_Monday, March 4, 2013_
+ Patch fixes updates sails-dirty version which fixes sorting by date

## 0.8.86
_Monday, March 4, 2013_
+ Patch to allow for easier SSL configuration.

## 0.8.85
_Sunday, March 3, 2013_
+ Check for and warn if port is currently being used on lift, with support for explicit hosts (https://github.com/balderdashy/sails/issues/197)
+ Model.stream() support over socket.io (https://github.com/balderdashy/sails/issues/196)

## 0.8.84
_Saturday, March 2, 2013_
+ Bug fixes: (explicit hosts, and included an additional file in new app generation)

## 0.8.83
_Saturday, March 2, 2013_
+ Support for streaming large datasets from models (e.g. `User.stream().pipe(res);`)
+ Bug fix for chains of multiple policies (thanks @themouette)
+ Jade template support (thanks @valinorsgatekeeper)
+ AssetRack integration for more robust css/js/template/LESS management, replaces Rigging (thanks @techpines)
+ Fixed some docs /refactored (thanks @slantzjr)
+ Bundled excruciatingly simple "authenticated" policy in new projects
+ Made "redirect" work in API scaffolds
+ Renamed waterline-* adapter modules as sails-*.  Added backwards compat.
+ Added .gitkeep in all directories when generating new projects to make sure they get committed
+ Bootstrap and log config now available in project template
+ View config now available in new projects as 'config/views.js'
+ Better error checking in the `sails` CLI
+ Docs
+ Added app.js file back in, but this time hidden as '.app.js'.  It can be run however you like, or you can use `npm debug` to debug it.  To run daemonized, you can use `forever start .app.js`
+ Added notion of `sails.explicitHost` to track whether a host was explicitly specified.  If it was not, Express takes the approach of accepting `all connections via INADDR_ANY` (see http://expressjs.com/2x/guide.html#app.listen())  Now, if you specify `sails.config.host`, `sails.explicitHost` gets set, and Express will start the server deliberately using the host you specify.  In certain PaaS deployments, this is required.  For instance, this was causing problems in an Openshift deployment environment (big thanks to @hypereive for figuring that out).

## 0.8.82
_Sunday, February 24, 2013_
+ Bootstrap function fires warning if callback not triggered after a few seconds (thanks @virpool)
+ Bug fixes w/ pubsub/model convenience methods.

## 0.8.80
+ Refactored app layout to make it a bit more straightforward.  To check out the the new folder structure, make a new project with `sails new foo`
+ Added robot.txt in new app generation
+ Bound all methods in adapter to have the right context.

## 0.8.79
+ Adapter definitions are no longer functions-- instead the direct definition object is accepted.  This makes it easier, cleaner, and more declarative to create adapters.
+ Merged waterline into main Sails repo.
+ Brought in sails-util and sails-moduleloader, moved watelrine tests into top level.
+ Attribute values in models in result sets from Waterline are now cast to numbers, if they are number-looking strings.
+ Substantial refactoring of waterline model-augmentation logic.
+ Added TODO for asynchronous module loading for future.
+ Upgraded waterline-dirty dep.


## 0.8.77
+ Patch updates the waterline-dirty dependency to deal with an issue with that adapter returning objects which map directly to the in-memory database (was causing changes made to found models to be persisted without calling .save())


## < 0.8.77
+ I wasn't keeping good notes, sorry :(
+ Check out https://github.com/balderdashy/sails/commits/master if you want to dive in.

[![githalytics.com alpha](https://cruel-carlota.pagodabox.com/8acf2fc2ca0aca8a3018e355ad776ed7 "githalytics.com")](http://githalytics.com/balderdashy/sails/changelog)