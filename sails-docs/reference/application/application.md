# Application (`sails`)

The Sails application object contains all relevant runtime state for a Sails application.
By default, it is exposed globally as `sails` and accessible almost anywhere in your code.

> Most users of the framework will only need to know about the `sails` application object in order to access a few basic methods and their custom configuration. Less commonly used methods can be found in the [advanced usage](https://sailsjs.com/documentation/reference/application/advanced-usage) section.


### Properties

The application object has a number of useful methods and properties.
The officially supported methods on the `sails` object are covered by the other
pages in this section.  Here are a few of its most useful properties:

##### sails.models

A dictionary of all loaded [Sails models](https://sailsjs.com/documentation/concepts/models-and-orm/models), indexed by their _identity_.

By default, a model's identity is the lowercased version of its filename, without the **.js** extension.  For example, the default identity for a model loaded from `api/models/PowerPuff.js` would be `powerpuff`, and the model would be accessible via `sails.models.powerpuff`.  A model's identity can be customized by setting an `identity` property in its module file.


##### sails.helpers

A dictionary of all accessible [helpers](https://sailsjs.com/documentation/concepts/helpers), including organics.


##### sails.config

The full set of configuration options for the Sails instance, loaded from a combination of environment variables, `.sailsrc` files, user-configuration files, and defaults.  See the [configuration concepts section](https://sailsjs.com/documentation/concepts/configuration) for a full overview of configuring Sails, and the [configuration reference](https://sailsjs.com/documentation/reference/configuration) for details on individual options.

##### sails.sockets

A set of convenience methods for low-level interaction with connected websockets.  See the [`sails.sockets.*` reference section](https://sailsjs.com/documentation/reference/web-sockets/sails-sockets) for details.


### Advanced usage

For more options and implementation details (including instructions for programmatic usage) see [Advanced usage](https://sailsjs.com/documentation/reference/application/advanced-usage).

<docmeta name="displayName" value="Application">
