# Upgrading to v0.10

For the most part, running sails lift in an existing v0.9 project should just work. The core contributors have taken a number of steps to make the upgrade as easy as possible, and if you follow the deprecation messages in the console, you should do just fine.

Sails v0.10 comes with some big changes. The sections below provide a high level overview of what's changed, major bug fixes, enhancements and new features, as well as a basic tutorial on how to upgrade your v0.9.x Sails app to v0.10.

## File uploads

The Connect multipart middleware [will soon be officially deprecated](http://www.senchalabs.org/connect/multipart.html). But since this module was used as the built-in HTTP body parser in Sails v0.9 and Express v3, this is a breaking change for v0.9 Sails projects relying on `req.files`.

By default in v0.10, Sails includes [skipper](https://github.com/balderdashy/skipper), a body parser which allows for streaming file uploads without buffering tmp files to disk. For run-of-the-mill file upload use cases, Skipper comes with bundled support for uploads to local disk (via skipper-disk), but streaming uploads can be plugged in to any of its supported adapters.

For examples/documentation, please see the Skipper repository as well as the Sails documentation on `req.file()`.

### Why?

A body parser's job is to parse the "body" of incoming multipart HTTP requests. Sometimes, that "body" includes text parameters, but sometimes, it includes file uploads.

Connect multipart is great code, and it supports both file uploads AND text parameters in multipart requests. But like most modules of its kind, it accomplishes this by buffering file uploads to disk. This can quickly overwhelm a server's available disk space, and in many cases exposes a serious DoS attack vulnerability.

Skipper is unique in that it supports **streaming** file uploads, but also maintains support for metadata in the request body (i.e. JSON/XML/urlencoded request body parameters). It uses a handful of heuristics to make sure only the files you're expecting get plugged in and received by the blob adapter, and other (potentially malicous) file fields are ignored.

> #### ** Important!**
> For Skipper to work, you _must include all text parameters BEFORE file parameters_ in file upload requests to the server. Once Skipper sees the first file field, it stops waiting for text parameters (this is to avoid unnecessary/unsafe buffering of file data).

### Configuring a different body parser

As with most things in Sails, you can use any Connect/Express/Sails-compatible bodyparser you like. To switch back to **connect-multipart**, or any other body parser (like **formidable** or **busboy**), change your app's http configuration.

## Blueprints

A new blueprint action (`findOne`) has been added. For instance, if you have a `FooController` and `Foo` model, then send a request to `/foo/5`, the `findOne` action in your `FooController` will run. If you don't have a `findOne` action, the `findOne` blueprint action will be used in its stead. Requests sent to `/foo` will still run the find controller/blueprint action.

## Policies

Policies work exactly as they did in v0.9- however there is a new consideration you should take into account: Due to the introduction of the more specific `findOne()` blueprint action mentioned above, you will want to make sure you're handling it explicitly in your policy mapping configuration.

For example, let's say you have a v0.9 app whose `policies.js` configuration prevents access to the `find` action in your `DoveController`:

```javascript
module.exports.policies = {
  '*': true,
  DoveController: {
    find: false
  }
};
```

Assuming rest blueprint routes are enabled, this would prevent access to requests like both `/dove` and `/dove/14`. But now in v0.10, since `/dove/14` will actually run the `findOne` action, we must handle it explicitly:

```javascript
module.exports.policies = {
  '*': true,
  DoveController: {
    find: false,
    findOne: false
  }
};
```

## Pubsub

### Summary
+ `message` socket (i.e. "comment") event on client is now `modelIdentity` (where "modelIdentity" is different depending on the model that the `publish*()` method was called from.
+ Clients are no longer subscribed to model-creation events by the blueprint routes. To listen for creation events, use `Model.watch()`.
+ The events that were formerly `create`, `update`, and `destroy` are now `created`, `updated`, and `destroyed`.

### Details
The biggest change to pubsub is that Socket.io events are emitted under the name of the model emitting them. Previously, your client listened for the `message` event and then had to determine which model it came from based on the included data:

```javascript
socket.on('message', function(cometEvent) {
   if (cometEvent.model == 'user') {
     // Handle inbound messages related to a user record
   }
   else if (cometEvent.model === 'product') {
     // Handle inbound messages related to a product record
   }
   // ...
}
```
Now, you subscribe to the identity of the model:
```javascript
socket.on('user', function(cometEvent) {
  // Handle inbound messages related to a user record
});

socket.on('product', function (cometEvent) {
  // Handle inbound messages related to a product record
});
```
This helps to structure your front end code.

The way you subscribe clients to models has also changed. Previously, you specified whether you were subscribing to the model class (class room) or one or more model instances based on the parameters that you passed to `Model.subscribe`. It was effectively one method to do two very different things.

Now, you use `Model.subscribe()` to subscribe only to model instances (records). You can also specify event "contexts", or types, that you'd like to hear about. For example, if you only wanted to get messages about updates to an instance, you would call `User.subscribe(req, myUser, 'update')`. If no context is given in a call to `.subscribe()`, then all contexts specified by the model class's autosubscribe property will be used.

To subscribe to model creation events, you can now use `Model.watch()`. Upon subscription, your clients will receive messages every time a new record is created on that model using the blueprint routes, and will automatically be subscribed to the new instance as well.

Remember, when working with blueprints, clients are no longer auto subscribed to the class room. This must be done manually.

Finally, if you want to see all pubsub messages from all models, you can access the `firehose`, a development-only tool that broadcasts messages about _everything_ that happens to your models. You can subscribe to the firehose using `sails.sockets.subscribeToFirehose(socket)`, or on the front end by making a socket request to `/firehose`. The firehose will broadcast a `firehose` event whenever a model is created, updated, destroyed, added to, removed from or messaged. This effectively replaces the `message` event used in previous Sails versions.

To see examples of the new pubsub methods in action, see [SailsChat](https://github.com/balderdashy/sailschat).

## Arguments to lifecycle callbacks are now typecasted

Previously, with `schema: true`, if you sent an attribute value to a `.create()` or `.update()` that did not match the expected type declared in the model's attributes, the value you passed in would still be accessible in your model's lifecycle callbacks.

In Sails/Waterline v0.10, this is no longer the case. Values passed to `.create()` and `.update()` are type-casted before your lifecycle callbacks run. Affected lifecycle callbacks include `beforeUpdate()`, `beforeCreate()`, and `beforeValidate()`.

## beforeValidation() is now beforeValidate()

If you were using the `beforeValidation` or `afterValidation` model lifecycle callbacks in any of your models, you should change them to `beforeValidate` or `afterValidate`. This change was made in Waterline to match the style of the other lifecycle callbacks (e.g. `beforeCreate`, `afterUpdate`, etc.).

## .done() vs. .exec()

** The old (/confusing?) meaning of `.done()` has been deprecated.**

In Sails <= v0.8, the syntax for executing an ORM query was `Model. [ … ] .done( cb )`. In v0.9, when promise support was added, the `Model. [ … ] .exec( cb )` became the recommended replacement, since `.done()` has a special meaning in the promise spec. However, the original usage of `.done()` was left untouched to make upgrading from v0.8 to v0.9 easier.

But as of Sails/Waterline v0.10, the original meaning of `.done()` has been officially deprecated to allow for a more robust promise implementation going forward, and pluggable promise library support (e.g. choose `Q` or `Bluebird` etc.).

## Associations

Sails v0.10 introduces associations between data models. Since the work we've done on associations is largely additive, your existing models should still just work. That said, this is a powerful new feature that allows you to write less code and makes your app more maintainable, so we suggest taking advantage of it! To learn about how to use associations in Sails, check out the docs.

Associations (or "relations") are really just special attributes. Instead of string or integer values, you can specify an instance of a model or a collection of model instances. You can think about this kind of like an object (`{...}`) or an array (`[{...}, {...}]`) you might store as JSON in a NoSQL database. The difference is, in Sails, this works with any of the supported databases, and even allows you to populate (i.e. join) across different databases and types of databases.

## Generators

Sails has had support for generating code for a while now (e.g. `sails generate controller foo`) but in v0.10, we wanted to make this feature more extensible, open, and accessible to everybody in the Sails community. With that in mind, v0.10 comes with a complete rewrite of the command-line tool, and pluggable generators. Want to be able to run `sails generate blog foo` to make a new blog built on Sails? Create a `blog` generator (run sails `generate generator blog`), add your templates, and configure the generator to copy the new templates over. Then you can release it to the community by publishing an npm module called `sails-generate-blog`. Compatibility with Yeoman generators is also in our roadmap.

## Command-line tool

The big change here is how you create a new api. In the past you called `sails generate new_api`. This would generate a new controller and model called `new_api` in the appropriate places. This is now done using `sails generate api new_api`.

You can still generate models and controllers seperately using the same CLI Commands.

Also, `--linker` switch is no longer available. In previous version, if `--linker` switch was provided, it created a `myApp/assets/linker folder`, with `js`, `styles` and `templates` folders inside. In this new version, the `myApp/assets/linker` folder is not created. Compiling CoffeeScript and Less is the default behavior now, right from the `myApp/assets/js` and `myApp/assets/scripts` folders.

## Custom server responses

In v0.10, you can now generate your own custom server responses.

Like before, there are a few that we automatically create for you. Instead of generating `myApp/config/500.js` and other `.js` responses in the config directory, they are now generated in `myApp/api/responses/`.

To migrate, you will need to create a new v0.10 project and copy the `myApp/api/responses` directory into your existing app. You will then modify the appropriate .js file to reflect any customization you made in your response logic files (500.js,etc).

## Legacy data stored in the temporary sails-disk database

`sails-disk`, used by default in new Sails projects, now stores data a bit differently. If you have some temporary data stored in a 0.9.x project, you'll want to wipe it out and start fresh. To do this:

From your project's root directory:

```
$ rm .tmp/disk.db
```

## Adapter/Database Configuration

`config.adapters` (in `myApp/config/adapters.js`) is now config.connections (in new projects, this is generated in `myApp/config/connections.js`). Also, `config.model` is now `config.models`.

Your app's default `connection` (i.e. database) should now be configured as a string `config.models.connection` used by default for model. New projects are generated with a `/config/models.js` file that includes the default connection.

To configure a model to use specific adapters, you must now specify them in the `connection` key instead of `adapters`.

For example:
```javascript
module.exports = {

    connection: ['someMongoDatabase'],

    attributes: {
        name:{
            type     : 'string',
            required : true
        }
    }
};
```

## Blueprints/Controller configuration

The object literal describing controller configuration overrides for controller blueprints should change from:
```
...
_config: {
  blueprints: {
    rest: true,
    ...
  }
}
```
to:
```
...
_config: {
    rest: true,
    ...
}
```

## Layout paths:
In Sails v0.9, you could use the following syntax to specify `auth/someLayout.ejs` as a custom layout when rendering a view:
```javascript
return res.view('auth/login',{
  layout: 'someLayout'
});
```
However in Sails v0.10, all layout paths are relative to your app's views path. In other words, the relative path of the layout is no longer resolved from the view's own path-- it is now always resolved from the views path. This makes it easier to understand which file is being used, particularly when layout files have similar names:
```javascript
return res.view('auth/login', {
  layout: 'auth/someLayout'
});
```


<docmeta name="displayName" value="0.10.0 Migration Guide">
<docmeta name="version" value="0.10.0">
