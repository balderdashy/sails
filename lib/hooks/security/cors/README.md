# cors (Core Hook)


## Status

> ##### Stability: [2](https://github.com/balderdashy/sails-docs/blob/master/contributing/stability-index.md) - Stable



## Dependencies

In order for this hook to load, the following other hooks must have already finished loading:

- moduleloader
- userconfig


## Dependents

If this hook is disabled, in order for Sails to load, the following other core hooks must also be disabled:

_N/A_


## Purpose

This hook's responsibilities are:


##### Bind shadow routes to set appropriate CORS headers

When Sails loads, this hook binds a `router:before` listener so that it can bind routes before the router binds explicit routes.  Then it binds shadow routes for the appropriate endpoints based on `sails.config.cors` (also mixing in its implicit defaults).



## Implicit Defaults

This hook sets the following implicit default configuration on `sails.config`:


| Property                                      | Type          | Default         |
|-----------------------------------------------|:-------------:|-----------------|
| `sails.config.cors.origin`                    | ((string))    | `'*'`
| `sails.config.cors.allRoutes`                 | ((boolean))   | `false`
| `sails.config.cors.credentials`               | ((boolean))   | `true`
| `sails.config.cors.methods`                   | ((string))    | `'GET, POST, PUT, DELETE, OPTIONS, HEAD'`
| `sails.config.cors.headers`                   | ((string))    | `'content-type'`
| `sails.config.cors.exposeHeaders`             | ((string))    | `''` _(empty string)_
| `sails.config.cors.securityLevel`             | ((number))    | `0`




## Events

##### `hook:cors:loaded`

Emitted when this hook has been automatically loaded by Sails core, and triggered the callback in its `initialize` function.




## FAQ

> If you have a question that isn't covered here, please feel free to send a PR adding it to this section (even if you don't have the answer!)
