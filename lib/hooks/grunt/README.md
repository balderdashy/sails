# grunt (Core Hook)

## Status

> ##### Stability: [2](http://nodejs.org/api/documentation.html#documentation_stability_index) - Unstable


## Purpose

This hook's responsibilities are:


##### Run a Grunt tasklist when Sails is loaded

When Sails is loaded, this hook spins up a Grunt child process and runs the conventional tasklist.  The tasklist to run depends on the environment (`NODE_ENV`).

This hook will first look for a file in `tasks/register/` that corresponds with the environment name (e.g. `jessa-staging.js`).  If no such tasklist file is found (the default case), but environment is `production`, then the `prod` tasklist is used.  Otherwise, the `default` Grunt tasklist is used.


##### Parse and log output

This hook's `runTask` method binds events to the child process output streams, through which it receives stdout and stderr output from the Grunt child processes and uses several different heuristics to parse it and display at the appropriate log level.

##### Track Grunt child process for cleanup when Sails shuts itself down

To prevent proc leaks, Sails keeps track of the Grunt child process on `sails.childProcesses`.


## Events


##### `hook:grunt:loaded`

Emitted when the Grunt hook has been automatically loaded by Sails core, and triggered the callback in its `initialize` function.

##### `hook:grunt:done`

Emitted when the Grunt child process exits with a normal status code. (in development, this will not fire until the app is lowered, since grunt-contrib-watch keeps the child process active)


##### `hook:grunt:error`

Emitted when the Grunt child process exits with a non-zero status code.



## Methods

#### sails.hooks.grunt.runTask()

Fork a Grunt child process that runs the specified task.

```javascript
sails.hooks.grunt.runTask(taskName);
```

_Or:_
+ `sails.sockets.blast(taskName, cb);`


###### Usage

|   |          Argument           | Type                | Details
| - | --------------------------- | ------------------- | -----------
| 1 |        taskName             | ((string))          | The name of the Grunt task(list) to run.
| 2 |        cb                   | ((function))        | Optional. Fires when the Grunt task has been started (non-production) or finished (production).


> API: private
> _(however, note that this is called directly by `sails www` in the CLI)_


## FAQ

> If you have a question that isn't covered here, please feel free to send a PR adding it to this section (even if you don't have the answer!)
