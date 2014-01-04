# Unit tests

Unit tests shouldn't lift the server (i.e. bind an HTTP server or WebSocket server to a port). Instead, they should bootstrap the minimal set of necessary components to test a particular method or group of methods.  The goal is to identify breaking changes and isolate _exactly what broke_.  This makes would-be issues easier to spot, and real bugs easier to track down.



## How Can I Help?


#### Unit tests for each core hook

1. Did the hook's default config make it into `sails.config`?
2. Did `sails.load` work?
3. Post-`sails.load`, is the state of the server correct? (i.e. did the hook do what it was supposed to do?)
4. Did the hook do what it was supposed to do after tearing down the server?

> No one is currently working on this.


#### Unit tests for the hook loader

1. If we `sails.load` with options for conditionally loading hooks, the server should start with the correct hooks applied.
2. The `sails.load` should fail if a test tries to load a hook with other hooks as dependencies, but those dependencies are omitted.
3. If a hook has optional dependencies, those optional dependencies should be loaded first.
4. If a graph of circular dependencies is passed into `sails.load`, the `sails.load` should fail.

> @mikermcneil is working on this.

