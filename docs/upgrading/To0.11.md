# Upgrading to Sails v0.11


**tldr;**

v0.11 comes with many minor improvements, as well as some internal cleanup in core.  The biggest change is that Sails core is now using Socket.io v1.

Almost none of this should affect the existing code in project, but there are a few important differences and new features to be aware of.  We've listed them below.


## Differences

#### Upgrade the Socket.io / Sails.io browser client

Old v0.9 socket.io client will no longer work, so consequently you'll need to upgrade your sails.io.js client from v0.9 or v0.10 to v0.11.

To do this, just remove your sails.io.js client and install the new one.  We've bundled a new generator that will do this for you, assuming your sails.io.js client is in the conventional location at `assets/js/dependencies/sails.io.js` (i.e. if you haven't moved or renamed it):

```sh
sails generate sails.io.js --force
```


####  `onConnect` lifecycle callback

> **tldr;**
>
> Remove your `onConnect` function from `config/sockets.js`.

The `onConnect` lifecycle callback has been deprecated.  Instead, if you need to do something when a new socket is connected, send a request from the newly-connected client to do so.  The purpose of `onConnect` was always for optimizing performance (eliminating the need to do this initial extra round-trip with the server), yet its use can lead to confusion and race conditions. If you desperately need to eliminate the server roundtrip, you can bind a handler directly on `sails.io.on('connect', function (newlyConnectedSocket){})` in your bootstrap function (`config/bootstrap.js`). However, note that this is discouraged.  Unless you're facing _true_ production performance issues, you should use the strategy mentioned above for your "on connection" logic (i.e. send an initial request from the client after the socket connects).  Socket requests are lightweight, so this doesn't add any tangible overhead to your application, and it will help make your code more predictable.



####  `onDisconnect` lifecycle callback

The `onDisconnect` lifecycle callback has been deprecated in favor of `afterDisconnect`.

If you were using `onDisconnect` previously, you might have had to change the `session`, then call `session.save()` manually.  In v0.11, this works in almost exactly the same way, except that `afterDisconnect` receives an additional 3rd argument: a callback function.  This way, you can just call the provided callback when your `afterDisconnect` logic has finished, so that Sails can persist any changes you've made to the session automatically.  Finally, as you might expect, you won't need to call `session.save()` manually anymore- it is now taken care of for you (just like `req.session` in a normal route, action, or policy.)


> **tldr;**
> Rename your `onDisconnect` function in `config/sockets.js` with the following:
>
```
afterDisconnect: function (session, socket, cb) {
 // Be sure to call the callback
 return cb();
}
```




####  Other configuration in `config/sockets.js`

Many of the configuration options in Socket.io v1 have changed, so you'll want to update your `config/sockets.js` file accordingly.

+ if you haven&rsquo;t customized any of the options in `config/sockets.js` for your app, you can safely remove or comment out the entire file and let the Sails defaults do their magic.  Otherwise, refer to the new [Sails sockets  documentation](https://sailsjs.com/documentation/reference/configuration/sails-config-sockets) to ensure that your configuration is still valid and avoid unwanted hair loss.
+ if you are scaling to multiple servers in an environment that does *not support sticky sessions* (this includes Heroku), you'll need to set your `transports` to `['websocket']` in both `config/socket.js` and your client--see [our Scaling doc](https://sailsjs.com/documentation/concepts/deployment/scaling#?preparing-your-app-for-a-clustered-deployment) for more info.
+ if you were using a custom `authorization` function to restrict socket connections, you'll now want to use `beforeConnect`.  `authorization` was deprecated by Socket.io v1, but `beforeConnect` (which maps to the `allowRequest` option from Engine.io) works just the same way.
+ if you were using other low-level socket configuration that was passed directly to socket.io v1, be sure and check out the [reference page on sailsjs.com](https://sailsjs.com/documentation/reference/configuration/sails-config-sockets) where all of the new configuration options are covered in detail.


#### The "firehose"

The "firehose" feature for testing with sockets has been deprecated.  If you don't know what that means, you have nothing to worry about. The basic usage will continue to work for a while, but it will soon be removed from core and should not be relied upon in your app.  This also applies to the following methods:
  + sails.sockets.subscribeToFirehose()
  + sails.sockets.unsubscribeFromFirehose()
  + sails.sockets.drink()
  + sails.sockets.spit()
  + sails.sockets.squirt()

> If you want the "firehose" back, let [Mike know on twitter](http://twitter.com/mikermcneil) (it can be brought back as a separate hook).

#### Config files in subfolders

It has always been the intention that files in the Sails `config` folder have no precedence over each other, and that the filenames and subfolders (with the exception of `local.js` and the `env` and `locale` subfolders) be used merely for organization.  However, in previous Sails versions, saving config files in subfolders would have the effect that the filename would be added as a key in `sails.config`, so that if you saved some config in `config/foo/bar.js`, then that config would be namespaced under `sails.config.bar`.  This was unintentional and potentially confusing as 1) the directory name is ignored, and 2) moving the file would change the config key.  This has been fixed in v0.11.x: config files in subfolders will be treated the same as those in the root `config` folder.  If you are for some reason relying on the old behavior, you may set `dontFlattenConfig` to `true` in your `.sailsrc` file, but we would strongly recommend that you instead just namespace the config yourself by setting the desired key on `module.exports`; for example `module.exports.foo = {...}`.  See [issue #2544](https://github.com/balderdashy/sails/issues/2544) for more details.

#### Waterline now uses Bluebird

As of v0.11, Waterline now supports Bluebird (instead of q) for promises.  If you are using `.exec()` you won't be affected-- only if you are using `.then()`.  See https://github.com/balderdashy/sails/issues/1186 for more information.


## New features

Sails v0.11 also comes with some new stuff that we thought you'd like to know about:


#### User-level hooks

Hooks can now be installed directly from NPM.

This means you can now install hooks with a single command in your terminal.  For instance, consider the [`autoreload` hook](https://github.com/sgress454/sails-hook-autoreload) by [@sgress454](https://twitter.com/sgress454), which watches for changes to your backend code so you don't need to kill and re-lift the server every time you change your controllers, routes, models, etc.

To install the `autoreload` hook, run:

```sh
npm install sails-hook-autoreload
```

This is just one example of what's possible.  As you might already know, hooks are the lowest-level pluggable abstraction in Sails.  They allow authors to tap into the lift process, listen for events, inject custom "shadow" routes, and, in general, take advantage of raw access to the `sails` runtime.
Most of the features you're familiar with in Sails have actually already been implemented as "core" hooks for over a year, including:

+ `blueprints` _(which provides the blueprint API)_
+ `sockets`    _(which provides socket.io integration)_
+ `grunt`      _(which provides Grunt integration)_
+ `orm`        _(which provides integration with the Waterline ORM, and imports your projects adapters, models, etc.)_
+ `http`       _(which provides an HTTP server)_
+ and 16 others.

You can read more about how to write your own hooks in the [new and improved "Extending Sails" documentation](https://sailsjs.com/documentation/concepts/extending-sails) on https://sailsjs.com.


#### Socket.io v1.x

The upgrade to Socket.io v1.0 shouldn't actually affect your app-level code, provided you are using the layer of abstraction provided by Sails itself; everything from the `sails.sockets.*` wrapper methods and "up" (resourceful pubsub, blueprints)
If you are using underlying socket.io methods in your apps, or are just curious about what changed in Socket.io v1.0, be sure and check out the [complete Socket.io 1.0 migration guide](http://socket.io/docs/migrating-from-0-9/) from Guillermo and the socket.io team.

#### Ever-increasing modularity

As part of the upgrade to Socket.io v1.0, we pulled out the core `sockets` hook into a separate repository.  This allowed us to write some modular, hook-specific tests for the socket.io interpreter, which will make things easier to maintain, customize, and override.
This also allows the hook to grow at its own pace, and puts related issues in one place.

Consider this a test of the pros and cons of pulling other hooks out of the sails core repo over the next few months.  This will make Sails core lighter, faster, and more extensible, with fewer core dependencies, shorter "lift" time for most apps, and faster `npm install`s.


#### Testing, the "virtual" request interpreter, and the `sails.request()` method

In the process of pulling the `sockets` hook _out_ of core, the logic which interprets requests has been normalized and is now located _in_ Sails core.  As a result, the `sails.request()` method is much more powerful.

This method allows you to communicate directly with the request interpreter in Sails without lifting your server onto a port.  It's the same mechanism that Sails uses to map incoming messages from Socket.io to "virtual requests" that have the familiar `req` and `res` streams.

The primary use case for `sails.request()` is in writing faster-running unit and integration tests, but it's also handy for proxying to mounted apps (or "sub-apps").

For instance, here is an example (using mocha) of how you might test one of your app's routes:

```js
var assert = require('assert');
var Sails = require('sails').Sails;

before(function beforeRunningAnyTests (done){

  // Load the app (no need to "lift" to a port)
  sails.load({
    log: {
      level: 'warn'
    },
    hooks: {
      grunt: false
    }
  }, function whenAppIsReady(err){
    if (err) return done(err);

    // At this point, the `sails` global is exposed, although we
    // could have disabled it above with our config overrides to
    // `sails.load()`. In fact, you can actually use this technique
    // to set any configuration setting you like.
    return done();
  });
});

after(function afterTestsFinish (done) {
  sails.lower(done);
});

describe('GET /hotpockets', function (){

  it('should respond with a 200 status code', function (done){

    sails.request({
      method: 'get',
      url: '/hotpockets',
      params: {
        limit: 10,
        sort: 'price ASC'
      }
    }, function (err, clientRes, body) {
      if (err) return done(err);

      assert.equal(clientRes.statusCode, 200);
      return done();
    });

  });
});
```


#### `config/env/` subfolders

In v0.10.x, we added the `config/env` folder (thanks to [@clarkorz](https://github.com/clarkorz)), where you can add config files that will be loaded only in the appropriate environment (e.g. `config/env/production.js` for production environment, `config/env/development` for development, etc.).  In v0.11.x we've added the ability to specify whole subfolders per-environment.  For example, *all* config files saved to the `config/env/production` will be loaded and merged on top of other configuration when the environment is set to `production`.  Note that if both a `config/env/production` folder and a `config/env/production.js` file are present, the `config/env/production.js` settings will take precedence.  And, as always, `local.js` is merged on top of all other files, and `.sailsrc` rules them all.


## Questions?

As always, if you run into issues upgrading, or if any of the notes above don't make sense, let us know and we'll do what we can to clarify.

Finally, to those of you that have contributed to the project since the v0.10 release in August: we can't stress enough how much we value your continued support and encouragement.  There is a pretty massive stream of issues, pull requests, documentation tweaks, and questions, but it always helps to know that we're in this together :)

Thanks.

-[@mikermcneil](https://github.com/mikermcneil/), [@sgress454](https://github.com/sgress454/) and [@particlebanana](https://github.com/particlebanana/)


<docmeta name="displayName" value="To v0.11">
<docmeta name="version" value="0.11.0">
