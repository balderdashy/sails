# controllers (Core Hook)


## Status

> ##### Stability: [2](https://github.com/balderdashy/sails-docs/blob/master/contributing/stability-index.md) - Stable



## Dependencies

In order for this hook to load, the following other hooks must have already finished loading:

- moduleloader
- userconfig


## Dependents

If this hook is disabled, in order for Sails to load, the following other core hooks must also be disabled:

- blueprints


## Purpose

This hook's responsibilities are:


##### Load adapters

When Sails loads, this hook calls out to `sails.modules.loadControllers()` (exposed by the `moduleloader`), loading all of this app's controllers into `sails.hooks.controllers.middleware`.



##### Handle controller/action route target syntax

This hook listens for `route:typeUnknown` events which are emitted on the `sails` app instance when explicit routes are bound (when `Router` is loaded after all the hooks).  This hook attempts to interpret the target syntax as pointing specifically at one of the app's controller and action pairs.  Then, if it can, it binds the route for the controller/action controller.


## Implicit Defaults
_N/A_


## Events

##### `hook:controllers:loaded`

Emitted when this hook has been automatically loaded by Sails core, and triggered the callback in its `initialize` function.




## FAQ

+ Why is this a hook and not part of core?
  + Makes it easier to change independently (e.g. you don't like the `*Controller.js` suffix in your controller filenames, or you want to do something else custom)

> If you have a question that isn't covered here, please feel free to send a PR adding it to this section (even if you don't have the answer!)
