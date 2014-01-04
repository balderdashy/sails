# Integration tests

The goal of these tests is to run Sails just like you or I would, and verify that no anomolies have been introduced in general.

Currently, most of these tests are out of date for 0.10 and need some work.  This is a great place to jump in if you're interested in contributing!


## What _Not_ To Test
We should strive to avoid integration tests which test exclusivity-- it cripples our ability to develop quickly.  In other words, integration tests should not fail with the introduction of additive features.

For instance, if you're writing a test to check that the appropriate files have been created with `sails new`, it would make sense to check for those files, but it would _not_ make sense to ensure that ONLY those files were created. (i.e. adding a new file should not break the tests)

Another example is a test which verifies the correctness of blueprint configuration, e.g. `sails.config.blueprints.rest`.  The test should check that blueprints behave properly with the `rest` config enabled and disabled.  We could change the configuration, add more controller-specific options, etc., and we'd only need to write new tests.

If, on the other hand, our strategy for testing the behavior of the blueprints involved evaluating the behavior AND THEN making a judgement on what the config "_should_" look like, we'd have to modify the tests when we add new options.  This may not sound like a lot, but it can grow out of proportion quickly!


## How Can I Help?

#### Update the existing integration tests
The integration tests need some updates so they'll pass with Sails v0.10.  Currently, they're disabled.

> No one is currently working on this.


#### Integration test for file uploads
Because file uploads are going to be changing in the near future, it would be great to test a basic file upload using the standard Connect multipart bodyParser (e.g. http://howtonode.org/really-simple-file-uploads).  That way, any changes that are made are much easier to evaluate.

> No one is currently working on this.



#### Integration tests for each core hook

1. Did the hook's default config make it into `sails.config`?
2. Did `sails.load` still work with the hook enabled?
3. Did `sails.lift` still work with the hook enabled?
4. Post-`sails.load`, is the state of the server correct? (i.e. did the hook do what it was supposed to do?)
5. Did the hook do what it was supposed to do after tearing down the server?

> No one is currently working on this.


#### Integration tests for the hook loader

1. If we `sails.load` with options for conditionally loading hooks, the server should start with the correct hooks applied.
2. The `sails.load` should fail if a test tries to load a hook with other hooks as dependencies, but those dependencies are omitted.
3. If a hook has optional dependencies, those optional dependencies should be loaded first.
4. If a graph of circular dependencies is passed into `sails.load`, the `sails.load` should fail.

> No one is currently working on this

