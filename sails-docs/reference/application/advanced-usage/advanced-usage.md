# Advanced usage

Most users of the Sails framework will never need to access more than a few basic methods of the `sails` application object. However, if you have an advanced use case or are considering [contributing to Sails](https://sailsjs.com/documentation/contributing), you may need to delve into some of these lesser-used methods or reference the [loading order of Sails core](https://sailsjs.com/documentation/reference/application/advanced-usage/lifecycle).

### Disabling the `sails` global

We recommended using the `sails` global with Sails.

However, the auto-globalization of `sails` [can be disabled](https://sailsjs.com/documentation/reference/configuration/sails-config-globals). Disabling the `sails` global might be a good idea for use cases where multiple Sails app instances need to exist at once, or where globals are not an option.

If the `sails` global is disabled, then you'll need another way to reference the application instance.  Luckily, this is possible from almost anywhere in your app:

+ in the `fn` of an [action](https://sailsjs.com/documentation/concepts/actions-and-controllers) (`this.sails`)
+ in the `fn` of a [helper](https://sailsjs.com/documentation/concepts/helpers) (`this.sails`).
+ on an incoming request (`req._sails`)


### Properties (advanced)

##### sails.hooks

A dictionary of all loaded [Sails hooks](https://sailsjs.com/documentation/concepts/extending-sails/hooks), indexed by their _identity_.  Use `sails.hooks` to access properties and methods of hooks you've installed to extend Sails&mdash;for example, by calling `sails.hooks.email.send()`.  You can also use this dictionary to access the Sails [core hooks](https://sailsjs.com/documentation/concepts/extending-sails/hooks#?types-of-hooks), for advanced usage.

By default, a hook's identity is the lowercased version of its folder name, with any `sails-hook-` prefix removed.  For example, the default identity for a hook loaded from `node_modules/sails-hook-email` would be `email`, and the hook would be accessible via `sails.hooks.email`.  An installed hook's identity can be changed via the [`installedHooks` config property](https://sailsjs.com/documentation/concepts/extending-sails/hooks/using-hooks#?changing-the-way-sails-loads-an-installable-hook).

See the [hooks concept documentation](https://sailsjs.com/documentation/concepts/extending-sails/hooks) for more information about hooks.

##### `sails.io`

The API exposed by the [`sails.sockets.*` methods](https://sailsjs.com/documentation/reference/web-sockets/sails-sockets) is flexible enough out of the box to cover the requirements of most applications, and using them will future-proof your app against possible changes in the underlying implementation.  However, if you are working on bringing some legacy code from a vanilla Socket.io app into your Sails app, it can be useful to talk to Socket.io directly.  To accomplish this, Sails provides raw access to the underlying [socket.io](http://socket.io/) server instance (`io`) as `sails.io`. See the [Socket.io docs](http://socket.io/docs/) for more information.  If you decide to use Socket.io directly, please proceed with care.

> Sails bundles `socket.io` as a dependency of [sails-hook-sockets](github.com/balderdashy/sails-hook-sockets), a core hook.


### Where does the application object come from?

An application instance automatically created _the first time_ you `require('sails')`.

This is what is happening in the generated `app.js` file:

```javascript
var sails = require('sails');
```

Note that any subsequent calls to `require('sails')` return the same app instance.  (This is why you might sometimes hear the Sails app instance referred to as a "singleton".)



### Creating a new application object (advanced)

If you are implementing something unconventional (e.g. writing tests for Sails core)
where you need to create more than one Sails application instance in a process, you _should not_ use
the instance returned by `require('sails')`, as this can cause unexpected behavior.  Instead, you should
obtain application instances by using the Sails constructor:

```javascript
var Sails = require('sails').constructor;
var sails0 = new Sails();
var sails1 = new Sails();
var sails2 = new Sails();
```

Each app instance (`sails0`, `sails1`, `sails2`) can be loaded/lifted separately,
using different configuration.

For more on using Sails programatically, see the conceptual overview on [programmatic usage in Sails](https://sailsjs.com/documentation/concepts/programmatic-usage).


<docmeta name="displayName" value="Advanced usage">
