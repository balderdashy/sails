# App


## Status

> ##### Stability: [2](http://nodejs.org/api/documentation.html#documentation_stability_index) - Unstable
>
> The API is in the process of settling, but has not yet had sufficient real-world testing to be considered stable.  
>
> Backwards-compatibility will be maintained if reasonable.


## Purpose

The `app` directory conatins logic concerned with the lifecycle of the Sails core itself.  This includes:

+ Loading and initializing hooks
+ Loading the router
+ Populating middleware library
+ Teardown and cleanup of the currently-running instance of sails


## FAQ


+ What is the difference between `sails.lift()` and `sails.load()`? 
  + `lift()` === `load()` + `initialize()`.  It does everything `load()` does, plus it exposes global variables, starts any attached servers, (e.g. HTTP) and logs a picture of a boat.

> If you have a question that isn't covered here, please feel free to send a PR adding it to this section (even if you don't have the answer!)


