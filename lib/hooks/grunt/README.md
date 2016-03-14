# grunt (Core Hook)

## Status

> ##### Stability: [2](https://github.com/balderdashy/sails-docs/blob/master/contributing/stability-index.md) - Stable


## Dependencies

In order for this hook to load, the following other hooks must have already finished loading:

_N/A_

## Dependents

If this hook is disabled, in order for Sails to load, the following other core hooks must also be disabled:

_N/A_


## Purpose

This hook's responsibilities are:


##### Run a Grunt tasklist when Sails is loaded

When Sails is loaded, this hook spins up a Grunt child process and runs the conventional tasklist.  The tasklist to run depends on the environment (`sails.config.environment`).

This hook will first look for a file in `tasks/register/` that corresponds with the environment name (e.g. if your environment is set to `'staging'`, then Sails will look for a tasklist file named `staging.js`).  If no such tasklist file is found, but environment is `production`, then the `prod` tasklist is used (a special case for compatibility).  Otherwise, the `default` Grunt tasklist is used.


##### Parse and log output

This hook's `runTask` method binds events to the child process output streams, through which it receives stdout and stderr output from the Grunt child processes and uses several different heuristics to parse it and display at the appropriate log level.

##### Track Grunt child process for cleanup when Sails shuts itself down

To prevent proc leaks, Sails keeps track of the Grunt child process on `sails.childProcesses`.




## Implicit Defaults

This hook sets the following implicit default configuration on `sails.config`:

_N/A_





## Events

##### `hook:grunt:loaded`

Emitted when the Grunt hook has been automatically loaded by Sails core, and triggered the callback in its `initialize` function.

##### `hook:grunt:done`

Emitted when the Grunt child process exits with a normal status code. (in development, this will not fire until the app is lowered, since grunt-contrib-watch keeps the child process active)

> This event is experimental.  It is very possible that it will change in a future release.


##### `hook:grunt:error`

Emitted when the Grunt child process exits with a non-zero status code.

> This event is experimental.  It is very possible that it will change in a future release.





## Methods

#### sails.hooks.grunt.runTask()

Fork a Grunt child process that runs the specified task.

```javascript
sails.hooks.grunt.runTask(taskName);
```

_Or:_
+ `sails.hooks.grunt.runTask(taskName, cb);`


###### Usage


|     |          Argument           | Type                | Details
| --- | --------------------------- | ------------------- | ------------------------------------------------------------------------
| 1   |        **taskName**         | ((string))          | The name of the Grunt task(list) to run.
| 2   |        **cb**               | ((function))        | Optional. Fires when the Grunt task has been started (non-production) or finished (production).


> ##### API: Private
> - Please do not use this method in userland (i.e. in your app or even in a custom hook or other type of Sails plugin).
> - Because it is a private API of a core hook, if you use this method in your code it may stop working or change without warning, at any time.
> - If you would like to see a version of this method made public and its API stabilized, please open a [proposal](https://github.com/balderdashy/sails/blob/master/CONTRIBUTING.md#v-proposing-features-and-enhancements).
>
> _(internally in core, note that this is called directly by `sails www` in the CLI--see `bin/sails-www.js`)_


## FAQ

> If you have a question about this hook that isn't covered here, please feel free to send a PR adding it to this section (even if you don't have the answer, a core maintainer will merge your PR and add an answer as soon as possible)
