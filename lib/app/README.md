# App Lifecycle


## API Status

> ##### Stability: [3](http://nodejs.org/api/documentation.html#documentation_stability_index) - Stable


## Purpose

The `app` directory contains logic concerned with the lifecycle of the Sails core itself.  This includes:

+ Loading and initializing hooks
+ Loading the router
+ Populating middleware library
+ Teardown and cleanup of the currently-running instance of sails


## Loading Steps

The Sails core has been iterated upon several times to make it easier to maintain and extend.
As a result, it has a very particular loading order, which its hooks depend on heavily.
This process is summarized below.

#### Prepare Configuration Object

Populate `sails.config` with core (hook-agnostic) implicit defaults. Then apply the initial known set of configuration overrides, including command-line options, environment variables, and programmatic configuration (i.e. options passed to `sails.load` or `sails.lift`.)
The most important core implicit default configuration is the set of built-in hooks.

#### Load Hooks

Load hooks in the proper order.

#### Populate Middleware Registry

Grab `this.middleware` from each hook and make it available on the `sails` object as `sails.middleware.[HOOK_ID]`.

#### Assemble Router

Prepares the core Router, then emit multiple events on the `sails` object informing hooks that they can safely bind routes.

#### Expose global variables
After all hooks have initialized, Sails exposes global variables
(by default: `sails` object, models, services, `_`, and `async`)

#### Initialize App Runtime

> This step does not run when `sails.load()` is used programmatically.
> To also run the initialization step, use `sails.lift()` instead.

+ Start attached servers (by default: Express and Socket.io)
+ Run the bootstrap function (`sails.config.bootstrap`)



## FAQ


+ What is the difference between `sails.lift()` and `sails.load()`?
  + `lift()` === `load()` + `initialize()`.  It does everything `load()` does, plus it starts any attached servers (e.g. HTTP) and logs a picture of a boat.

> If you have a question that isn't covered here, please feel free to send a PR adding it to this section (even if you don't have the answer!)


