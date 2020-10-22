# Globals
### Overview

For convenience, Sails exposes a handful of global variables.  By default, your app's [models](https://sailsjs.com/documentation/concepts/models-and-orm), [services](https://sailsjs.com/documentation/concepts/services), and the global `sails` object are all available on the global scope, meaning you can refer to them by name anywhere in your backend code (as long as Sails [has been loaded](https://github.com/balderdashy/sails/tree/master/lib/app)).

Nothing in Sails core relies on these global variables&mdash;each and every global exposed in Sails may be disabled in `sails.config.globals` (conventionally configured in `config/globals.js`.)


### The App Object (`sails`)
In most cases, you will want to keep the `sails` object globally accessible, as it makes your app code much cleaner.  However, if you _do_ need to disable _all_ globals, including `sails`, you can get access to `sails` on the request object (`req`).

### Models and Services
Your app's [models](https://sailsjs.com/documentation/concepts/models-and-orm) and [services](https://sailsjs.com/documentation/concepts/services) are exposed as global variables using their `globalId`.  For instance, the model defined in the file `api/models/Foo.js` will be globally accessible as `Foo`, and the service defined in `api/services/Baz.js` will be available as `Baz`.

### Async (`async`) and Lodash (`_`)
Sails also exposes an instance of [lodash](http://lodash.com) as `_`, and an instance of [async](https://github.com/caolan/async) as `async`.  These commonly-used utilities are provided by default so that you don't have to `npm install` them in every new project.  Like any of the other globals in sails, they can be disabled.



<docmeta name="displayName" value="Globals">
