# responses (Core Hook)

## Status

> ##### Stability: [2](https://github.com/balderdashy/sails-docs/blob/master/contributing/stability-index.md) - Stable


## Dependencies

In order for this hook to load, the following other hooks must have already finished loading:

- moduleloader



## Dependents

If this hook is disabled, in order for Sails to load, the following other core hooks must also be disabled:

- blueprints



## Purpose

This hook's responsibilities are:


##### Support `response` route target syntax

This hook listens for the `route:typeUnknown` event, and if the unknown route target syntax contains a `response` key, it binds the route address to a middleware function that does nothing except send that response.

For example:

```
'post /foo': {
  response: 'ok'
}
```

...would run `res.ok()` whenever a POST request to `/foo` is received.


##### Load custom responses

When Sails loads, this hook loads custom response files from the app's responses folder and merges them with built-in defaults, storing them in-memory as "outlet functions".  Conventionally this is `api/responses/*.js`, but it can be configured in `sails.config.paths`.


##### Bind shadow route that exposes response functions as `res.*`

This hook binds a shadow route that intercepts all incoming requests and attaches a method to `res` for each of the outlet functions (representing custom responses) that were prepared when the hook was initialized.



## Implicit Defaults

This hook sets the following implicit default configuration on `sails.config`:

_N/A_



## Events

##### `hook:responses:loaded`

Emitted when this hook has been automatically loaded by Sails core, and triggered the callback in its `initialize` function.



## Methods


#### sails.hooks.responses.loadModules()

Load custom responses modules from the responses directory in the current app (conventionally this is `api/responses/`).

```javascript
sails.hooks.responses.loadModules(cb);
```


###### Usage


|     |          Argument           | Type                | Details
| --- | --------------------------- | ------------------- | ----------------------------------------------------------------------------------
| 1   |        **cb**               | ((function))        | Fires when the custom response modules have been loaded or if an error occurs.


> ##### API: Private
> - Please do not use this method in userland (i.e. in your app or even in a custom hook or other type of Sails plugin).
> - Because it is a private API of a core hook, if you use this method in your code it may stop working or change without warning, at any time.
> - If you would like to see a version of this method made public and its API stabilized, please open a [proposal](https://github.com/balderdashy/sails/blob/master/CONTRIBUTING.md#v-proposing-features-and-enhancements).
>
> _(internally in core, note that this is called by the `moduleloader` hook)_



## FAQ

> If you have a question about this hook that isn't covered here, please feel free to send a PR adding it to this section (even if you don't have the answer, a core maintainer will merge your PR and add an answer as soon as possible)
