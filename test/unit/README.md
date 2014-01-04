# Unit tests

Unit tests shouldn't lift the server (i.e. bind an HTTP server or WebSocket server to a port). Instead, they should bootstrap the minimal set of necessary components to test a particular method (or sometimes a group of methods, if it makes more sense.)  The goal is to identify future breaking changes and isolate _exactly what broke_.  This makes would-be issues easier to spot in advance, and real bugs easier to track down after the fact.


## What _Not_ To Test
Since unit tests are more implementation-specific, we shouldn't unit test parts of Sails which are currently in flux or likely to change.

## How Can I Help?


#### Unit tests for the hook loader

1. If we run the hook loader with options for conditionally loading hooks, the server should start with the correct hooks applied.
2. The hook loader should fail if a hook has other hooks as dependencies, but those dependencies are omitted.
3. If a graph of circular dependencies is passed into the hook loader, it should fail.

> No one is currently working on this



#### Unit tests for each core hook

1. initialize()
2. loadModules()
3. configure()
3. Other important methods (hook-specific)

> No one is currently working on this
