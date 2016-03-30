# logger (Core Hook)


## Status

> ##### Stability: [0](https://github.com/balderdashy/sails-docs/blob/master/contributing/stability-index.md) - Deprecated
>
> This hook will almost certainly be merged into core (see FAQ below).



## Dependencies

In order for this hook to load, the following other hooks must have already finished loading:

- moduleloader
- userconfig


## Dependents

If this hook is disabled, in order for Sails to load, the following other core hooks must also be disabled:

_N/A_


## Purpose
This hook's responsibilities are:


##### Set up CaptainsLog
Instantiate a [CaptainsLog](https://github.com/balderdashy/captains-log) logger instance.


##### Expose `sails.log` function
Publicly expose `sails.log()` function (see http://sailsjs.org/documentation/concepts/logging)


##### Add `sails.log.ship()` method
Add an extra method to the logger which teaches it how to draw a ship in ASCII.





## Implicit Defaults
This hook sets the following implicit default configuration on `sails.config`:


| Property                                       | Type          | Default         |
|------------------------------------------------|:-------------:|-----------------|
| `sails.config.log.level`                       | ((string))    | `'info'`        |





## Events

##### `hook:logger:loaded`

Emitted when this hook has been automatically loaded by Sails core, and triggered the callback in its `initialize` function.




## FAQ

+ Why is this a hook and not part of core?
  + Originally, it was as a way of separating concerns.  But realistically, this particular hook _could_ be merged into core (under `app`) in a future release.  But realistically since the core configuration process does everything this hook does anyways, this hook _might as well_ be merged into core (under `app`).  Look for this to happen in a future release.

> If you have a question that isn't covered here, please feel free to send a PR adding it to this section (even if you don't have the answer!)
