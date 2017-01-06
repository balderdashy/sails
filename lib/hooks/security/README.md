# security (Core Hook)


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

##### Sets up CRSF action

It generates `security/grant-csrf-token` action 

## Implicit Defaults

This hook sets the following implicit default configuration on `sails.config.security`:


| Property                                      | Type          | Default         |
|-----------------------------------------------|:-------------:|-----------------|
| `sails.config.security.cors.allowOrigins`                    | ((string))    | `'*'`
| `sails.config.security.cors.allRoutes`                 | ((boolean))   | `false`
| `sails.config.security.cors.allowCredentials`               | ((boolean))   | `false`
| `sails.config.security.cors.allowRequestMethods`                   | ((string))    | `'GET, HEAD, PUT, PATCH, POST, DELETE'`
| `sails.config.security.cors.allowRequestHeaders`                   | ((string))    | `'content-type'`
| `sails.config.security.cors.allowResponseHeaders`             | ((string))    | `''` _(empty string)_
| `sails.config.security.cors.allowAnyOriginWithCredentialsUnsafe`             | ((boolean))    | `false`
| `sails.config.security.csrf`             | ((boolean))    | `false`




## Events

##### `hook:security:loaded`

Emitted when this hook has been automatically loaded by Sails core, and triggered the callback in its `initialize` function.




## FAQ

> If you have a question that isn't covered here, please feel free to send a PR adding it to this section (even if you don't have the answer!)
