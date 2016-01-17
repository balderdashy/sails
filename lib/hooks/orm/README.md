# orm (Core Hook)

## Status

> ##### Stability: [2](https://github.com/balderdashy/sails-docs/blob/master/contributing/stability-index.md) - Stable



## Dependencies

In order for this hook to load, the following other hooks must have already finished loading:

> TODO


## Purpose

This hook's responsibilities are:

##### Load and hydrate models, then expose them as `sails.models.*`
When Sails loads, this hook loads model files from the app's models folder, passes them to Waterline to turn them into Model instances with all the expected methods like `.create()`, and then exposes them as `sails.models`.  Conventionally this models folder is `api/models/`, but it can be configured in `sails.config.paths`.

- Note that the set of hydrated models in the `sails.models` also includes Waterline models which were implicitly created as junctors (i.e. for any `collection` associations whose `via` does not point at a `model` association).
- Also note that models are exposed on `sails.models` are keyed by their identities.  That is, if you have a model file `Wolf.js`, it will be available as `sails.models.wolf`.


##### Load and hydrate adapters, then expose them as `sails.adapters.*`

> TODO




## Implicit Defaults
This hook sets the following implicit defaults configuration on `sails.config`:

> TODO




## Events

##### `hook:orm:loaded`

Emitted when this hook has been automatically loaded by Sails core, and triggered the callback in its `initialize` function.


##### `hook:orm:reload`

This event is no longer emitted by this hook.  This event will likely be replaced by making `.reload()` a public function.

> This event is experimental and is likely to change in a future release.


##### `hook:orm:reloaded`

Emitted when a reload is complete.  This event will likely be replaced by expecting a callback in `.reload()`.

> This event is experimental and is likely to change in a future release.




## Protected Methods

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
