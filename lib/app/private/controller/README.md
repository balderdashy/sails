# Actions in Sails

In Sails, an _action_ is a named request handler that is intended to be bound directly to a route in an app's `config/routes.js` file.  Actions may be loaded from disk (typically from the `api/controllers` project folder and subfolders), from runtime configuration (in `sails.config.controllers.moduleDefinitions`) or added by hooks (using `sails.registerAction`).

##### Benefits of actions

By using actions to represent the majority of the code that is executed at runtime in user apps, we get the following benefits:

* An easy way to reference all of the available request handlers -- calling `sails.getActions()` returns a list of all actions registered by the user _and_ by hooks like the blueprints hook.
* Simplified user routing -- instead of hooks adding routes whose address must be configured separately (e.g. the `/csrfToken` route) or referenced using a separate syntax (e.g. the `{response: 'notFound'}` route target syntax), hooks simply provide an action for the app developer to route to in `config/routes.js` using a single, streamlined syntax.
* Ability to easily add middleware that applies only to app-level code, and not to all routes.  Instead of binding to `/*` in a hook and then excluding assets (or forgetting to), `registerActionMiddleware` can be used to add handlers _only_ to actions.

##### Should my hook register an action, bind a route, or both?

If you are creating a hook that adds request handlers to a Sails app, and you want the app developer to be able to bind their own routes to those request handlers, then you should register the handler as an action (the core "blueprints", "responses" and "views" hooks are good examples of this).  This doesn't mean you can't also bind routes directly within the hook (this is how blueprint RESTful routes are created, for example), especially if the user may override your hook's action with their own (as may happen with blueprint or response actions).

On the other hand, if your hook creates a request handler that is not intended to be bound directly by the app developer, and/or it is not intended to be overridden, you may not want to register that handler as an action.  Handlers that _modify_ requests and then call `next()` (for example the `addLocalizationMethod` handler in the core `i18n` hook) generally fall into this category.

Somewhere in the middle lie hooks that create a request handler that you may want the app developer to be able to bind directly, but which should _not_ be overridable.  A good example of this is the core `CSRF` hook; besides adding CSRF protection to an app's routes, it also provides an action which returns the current CSRF token.  It is desirable to allow this action to be bound to a route in the `config/routes.js` file (so that the app developer can choose the address to bind it to), but it is _not_ desirable for the user to override the action with their own code.  In this case, a hook can register the action as "not overridable" by beginning namespacing it under `_.` (e.g. `sails.registerAction(myAction, '_.csrf.return-token')`).

> Alternate idea: have hooks register actions under UPPERCASED version of their name, e.g. `CSRF.return-token`

##### Action middleware

Action middleware are functions that are intended to _modify_ actions (or more accurately, the requests that the actions handle).  You may register middleware that affects a single action, a subset of actions, or all actions.  Note that action middleware _only_ affects actions; if you need to modify _all_ requests (particularly, if you need to modify requests that return assets), you should still bind a route directly to `/*` in your hook.



## Action-related methods in Sails

### Public methods

##### `sails.registerAction(action, identity)`

Registers an action in Sails.  It is very similar in function to the private `registerAction` method, with the notable exception that there is no `force` argument: if a call to `registerAction` results in an attempt to overwrite an existing key in the actions dictionary, the call will trigger an error with code `E_CONFLICT`.

##### `sails.getActions()`

Returns a shallow clone of the internal Sails actions dictionary.  This is a flat (i.e. one-level) dictionary where the keys are the kebab-cased, dash-delimited action identities, and the values are the action functions (all actions in the dictionary will have been converted to `req, res` functions at this point).

##### `sails.registerActionMiddleware(middleware, includeActions, excludeActions)`

Registers middleware that will run before the specified actions.  Middleware should be `req, res, next` functions.  The `includeActions` and `excludeActions` arguments are strings or arrays of strings describing the actions that the middleware should (or should not) be attached to, using `*` as a wildcard to cover multiple actions at once.

Examples:

**Register middleware that affects all actions**:
```
sails.registerActionMiddleware(mustBeLoggedIn, '*')
````

**Register middleware that affects all `user` actions**:
```
sails.registerActionMiddleware(mustBeLoggedIn, 'user.*')
````

**Register middleware that affects all `user` and `pet` actions**:
```
sails.registerActionMiddleware(mustBeLoggedIn, ['user.*', 'pet.*'])
````

**Register middleware that affects all `user` and `pet` actions _except_ user.hello**:
```
sails.registerActionMiddleware(mustBeLoggedIn, ['user.*', 'pet.*'], 'user.hello')
````

**Register middleware that affects all `user` and `pet` actions _except_ ones namespaced under "public"**:
```
sails.registerActionMiddleware(mustBeLoggedIn, ['user.*', 'pet.*'], ['user.public.*', 'pet.public.*'])
````



### Private utilities

> _Please do not use these in a hook (even a core hook) or in any userland code!  They may change at any time, without warning!_

##### `loadActionModules()`

When Sails loads, this method loads all of the files underneath the controllers directory (`api/controllers` by default) and attempts to parse them into actions that can be bound to routes.  File in the controllers directory can either be pascal-cased and ending in "Controller" (e.g. MyController.js), in which case they are expected to be _dictionaries_ of actions, or else kebab-cased and lowercased (e.g. my-action.js) in which case they are expected to contain a single action.  An action may be a function which accepts `req` and `res` as arguments, or a [node-machine](http://node-machine.org) definition which will be parsed by [machine-as-action](https://github.com/treelinehq/machine-as-action).

After actions are loaded from disk, any actions specified under the `sails.config.controllers.moduleDefinitions` config key are merged on top of those actions.  This allows Sails apps to be constructed dynamically at runtime.

Note that this method is called internally by Sails _after_ hooks have loaded (or in the case of a `Sails.reloadModules` call, after they have _reloaded_).  This ensures that user actions always take precedence over those added by hooks.

##### `helpRegisterAction(action, identity, [force])`

This method takes an _action_ (in the form of a function or a machine definition, which is transformed into a function via `machine-as-action`) and adds it to the internal `Sails._actions` dictionary under the key specified by `identity`.  Keys in the internal dictionary can be overridden by setting the `force` argument to `true`; otherwise any conflict will result in an error being thrown.


