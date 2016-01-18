# orm (Core Hook)

## Status

> ##### Stability: [2](https://github.com/balderdashy/sails-docs/blob/master/contributing/stability-index.md) - Stable



## Dependencies

In order for this hook to load, the following other hooks must have already finished loading:

- moduleloader
- userconfig


## Dependents

If this hook is disabled, in order for Sails to load, the following other core hooks must also be disabled:

- blueprints
- pubsub


## Purpose

This hook's responsibilities are:


##### Load adapters

When Sails loads, this hook calls out to `sails.modules.loadAdapters()` (exposed by the `moduleloader`), loading any custom adapters defined within the app.  It also loads adapters which are installed as dependencies of the app itself (i.e. in its `node_modules/` folder).  These adapters are used when instantiating Waterline.


##### Load and hydrate models, then expose them as `sails.models.*`
When Sails loads, this hook calls out to `sails.modules.loadModels()` (exposed by the `moduleloader`), loading model files from the app's models folder.

##### Prompt about auto-migration
Since instantiating Waterline currently has the effect of auto-migrating existing data (dependending on the `migrate` configuration), the orm hook shows a prompt before instantiating Waterline if no `migrate` setting is explicitly configured.


##### Instantiate Waterline
As mentioned above, since all configuration, models, and adapters are loaded, this hook can safely instantiate Waterline.


##### Expose hydrated models as `sails.models`
It then passes them to Waterline to turn them into Model instances with all the expected methods like `.create()`, and then exposes them as `sails.models`.  Conventionally this models folder is `api/models/`, but it can be configured in `sails.config.paths`.

- Note that the set of hydrated models in the `sails.models` also includes Waterline models which were implicitly created as junctors (i.e. for any `collection` associations whose `via` does not point at a `model` association).
- Also note that models are exposed on `sails.models` are keyed by their identities.  That is, if you have a model file `Wolf.js`, it will be available as `sails.models.wolf`.


##### Expose global variable for each model
If enabled (`sails.config.globals.models` set to true), use the inferred `globalId` of each model to expose it as a global variable.



## Implicit Defaults
This hook sets the following implicit default configuration on `sails.config`:


| Property                                       | Type          | Default         |
|------------------------------------------------|:-------------:|-----------------|
| `sails.config.globals.models`                  | ((boolean))   | `true`          |
| `sails.config.models.connection`               | ((string))    | `localDiskDb`   |
| `sails.config.connections.localDiskDb.adapter` | ((string))    | `sails-disk`    |


i.e.

```javascript
{
  globals: {
    adapters: true,
    models: true
  },

  // Default model properties
  models: {

    // This default connection (i.e. datasource) for the app
    // will be used for each model unless otherwise specified.
    connection: 'localDiskDb'
  },


  // Connections to data sources, web services, and external APIs.
  // Can be attached to models and/or accessed directly.
  connections: {

    // Built-in disk persistence
    // (by default, creates the file: `.tmp/localDiskDb.db`)
    localDiskDb: {
      adapter: 'sails-disk'
    }
  }
}
```


## Events

##### `hook:orm:loaded`

Emitted when this hook has been automatically loaded by Sails core, and triggered the callback in its `initialize` function.


##### `hook:orm:reload`

This event is no longer emitted by this hook.  This event will likely be replaced by making `.reload()` a public function.

> This event is experimental and is likely to change in a future release.


##### `hook:orm:reloaded`

Emitted when a reload is complete.  This event will likely be replaced by expecting a callback in `.reload()`.

> This event is experimental and is likely to change in a future release.




## Methods

#### sails.hooks.orm.reload()

Reload the ORM hook, reloading models and adapters from disk, and reinstantiating Waterline.

- Note that **this does not automatically reload dependent hooks** (such as blueprints).
- Also note that there is currently no callback.

```javascript
sails.hooks.orm.reload();
```


> ##### API: Private
> - Please do not use this method in userland (i.e. in your app or even in a custom hook or other type of Sails plugin).
> - Because it is a private API of a core hook, if you use this method in your code it may stop working or change without warning, at any time.
> - If you would like to see a version of this method made public and its API stabilized, please open a [proposal](https://github.com/balderdashy/sails/blob/master/CONTRIBUTING.md#v-proposing-features-and-enhancements).




#### sails.hooks.orm.teardown()

Call the `teardown()` method for adapters which have one, and which were previously loaded by the ORM hook.

```javascript
sails.hooks.orm.teardown(cb);
```


###### Usage


|     |          Argument           | Type                | Details
| --- | --------------------------- | ------------------- | ----------------------------------------------------------------------------------
| 1   |        **cb**               | ((function))        | Optional. Fires when the teardown process for the hook is complete.


> ##### API: Private
> - Please do not use this method in userland (i.e. in your app or even in a custom hook or other type of Sails plugin).
> - Because it is a private API of a core hook, if you use this method in your code it may stop working or change without warning, at any time.
> - If you would like to see a version of this method made public and its API stabilized, please open a [proposal](https://github.com/balderdashy/sails/blob/master/CONTRIBUTING.md#v-proposing-features-and-enhancements).



## FAQ

> If you have a question about this hook that isn't covered here, please feel free to send a PR adding it to this section (even if you don't have the answer, a core maintainer will merge your PR and add an answer as soon as possible)

#### What is this?

This repo contains a hook, one of the building blocks Sails is made out of.

#### What version of Sails is this for?

This hook is a dependency of Sails core as of v0.12.


#### Can I disable this hook?

Yes.  To disable this hook, merge the following JSON into your project's `.sailsrc` file:

```json
{
  "hooks": {
    "orm": false
  }
}
```

#### Can I override this hook to use a different ORM like Mongoose or Bookshelf instead of Waterline?

Yes.  To override this hook, define your replacement hook with `identity: orm` in your `.sailsrc` file or your app's `api/hooks/` directory.




## License

MIT
