# http (Core Hook)

## Status

> ##### Stability: [2](https://github.com/balderdashy/sails-docs/blob/master/contributing/stability-index.md) - Stable


## Dependencies

In order for this hook to load, the following other hooks must have already finished loading:

- moduleloader


## Peers

If the following other core hooks are enabled, the behavior of this hook will change:

- session
- views


## Dependents

If this hook is disabled, in order for Sails to load, the following other core hooks must also be disabled:

- views



## Purpose

This hook's responsibilities are:

##### Start an HTTP server and handle requests

This hook starts an http or https server and listens for incoming requests when Sails core
emits an event letting us know it's time to "lift" (rather than just "load").

##### Bind the configured middleware, along with built-in defaults

This hook binds built-in HTTP middleware, in addition to custom middleware functions (`sails.config.http.middleware`).
The order in which middleware can be bound is configurable in `sails.config.http.middleware.order`.

> Note that it is possible for the configured HTTP middleware stack to be shared with the
> core router built into Sails-- this would make the same stack take effect for all virtual requests
> including sockets.  Currently, an abbreviated version of this stack is built-in to `lib/router/`
> in an imperative way (rather than the declarative approach used here: a sorted array of named middleware).
>
> In Sails core, this has been explored in a number of different ways in the past.
> In the future, it would be possible to add a separate middleware stack configuration for virtual
> requests (including socket requests).  However, while this would certainly be more consistent, in practice,
> this would have an unwanted impact on performance.




## Implicit Defaults

This hook sets the following implicit default configuration on `sails.config`:

> **TODO: document**
>
> _(if you'd like to help, please send a pull request expanding this section.  See `hooks/logger/README.md` for an example)_



## Events

##### `hook:http:loaded`

Emitted when this hook has been automatically loaded by Sails core, and triggered the callback in its `initialize` function.



## Methods

> **TODO: document**
>
> _(if you'd like to help, please send a pull request expanding this section.  See `hooks/responses/README.md` for an example)_



## FAQ

> If you have a question about this hook that isn't covered here, please feel free to send a PR adding it to this section (even if you don't have the answer, a core maintainer will merge your PR and add an answer as soon as possible)

