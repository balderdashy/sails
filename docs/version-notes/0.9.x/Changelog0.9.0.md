# Changelog 0.9.0
_July 10, 2013_
### Sails.js
+ Main: Express 3.x has been integrated.
+ Main: CSRF Attack Protection was added as part of the core. Uses express-csrf, plus a token-based approach for SPAs and embedded apps (Chrome extensions, JavaScript plugins).
+ Main: Most of the core has been refactored for performance, code clarity, and simplicity to make contributions easier.
+ Main: Most of the core has been pulled into hooks. In a subsequent patch release for 0.9.x, this process will make Socket.io optional.
+ Controllers: Automatic routing is now disable-able.
+ Assets: Grunt integration replaces Asset Rack.
+ Assets: Public folder removed from new projects.
+ Assets: Temporary 'public' folder is automatically built on lift, using the contents of the assets folder.
+ Assets: Static assets can be compiled with "sails build" for external hosting of front-end assets
+ Assets: Grunt ecosystem allows for a [wide variety](https://github.com/gruntjs/grunt-contrib) of front-end template/css/js preprocessor support (sass, hbs, stylus, dust, typescript, etc.)
+ Routing: Automatic 404 and 500 routing is replaced.
+ Assets: Asset bundling is now disabled by default, use `sails new foo --linker` to enable it
+ Config: Most configuration is now also explicit in new projects. Defaults are still provided underneath.
+ Sockets: Socket.IO can now be configured with the options detailed in config/sockets.js.
+ Sockets: Built-in support for Redis MQ-- allows you to scale realtime apps to a multi-instance deployment without necessitating sticky sessions at your load balancer.
+ Views: Express 3 killed support for layouts/view partials. Sails has been extended to maintain support for them with ejs and jade, but otherwise you are limited to what is supported by the engine itself.
+ Views: Automatic routing to views is now disable-able.
+ Sessions: Built-in support for Redis and Mongo sessions for scaling your app to multi-instance deployments.

### Waterline
+ ORM: Waterline has been pulled out of Sails.js... Again. (See [Waterline](https://github.com/balderdashy/waterline))
+ ORM: Model attributes now support validations. (See [Anchor](https://github.com/balderdashy/anchor))
+ ORM: Custom instance methods can now be defined on models as virtual attributes.
+ ORM: Lifecycle Callbacks have been added. (See [Lifecycle Callbacks](https://github.com/balderdashy/sails-docs/tree/0.9))
+ ORM: findAll() has been replaced with find().
+ ORM: find() has been replaced with findOne().
+ ORM: .done() promise now works on all ORM methods
+ ORM: Complete support for the Promise specificiation has been added.

### Anchor
+ Validations: Too many added to list, see [Validations](https://github.com/balderdashy/sails-docs/tree/0.9)

<docmeta name="displayName" value="0.9.0 Changelog">
<docmeta name="version" value="0.9.0">
