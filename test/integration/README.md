# Integration tests

The goal of these tests is to run Sails just like you or I would, and verify that no anomolies have been introduced in general.

This is a great place to jump in if you're interested in contributing code to Sails core!


## What _Not_ To Test
We should strive to avoid integration tests which test exclusivity-- it cripples our ability to develop quickly.  In other words, integration tests should not fail with the introduction of additive features.

For instance, if you're writing a test to check that the appropriate files have been created with `sails new`, it would make sense to check for those files, but it would _not_ make sense to ensure that ONLY those files were created. (i.e. adding a new file should not break the tests)

Another example is a test which verifies the correctness of blueprint configuration, e.g. `sails.config.blueprints.rest`.  The test should check that blueprints behave properly with the `rest` config enabled and disabled.  We could change the configuration, add more controller-specific options, etc., and we'd only need to write new tests.

If, on the other hand, our strategy for testing the behavior of the blueprints involved evaluating the behavior AND THEN making a judgement on what the config "_should_" look like, we'd have to modify the tests when we add new options.  This may not sound like a lot, but it can grow out of proportion quickly!


## How Can I Help?

We could use your help writing more integration tests that test Sails under specific conditions.

#### Integration tests for each core hook

When writing an integration tests that verifies the behavior of a particular hook, the following assertions should be made:

1. Did the hook's default config make it into `sails.config`?
2. Did `sails.load` work as expected with the hook enabled and all the hooks it depends on enabled?
3. Did `sails.lift` work as expected with the hook enabled and all the hooks it depends on enabled?
4. Post-`sails.load`, is the process/application state correct? (i.e. did the hook do what it was supposed to do?)
5. Did the hook do what it was supposed to do after tearing down the server using `sails.lower()`?


#### Integration tests for the hook loader

We could really use more tests for the following cases:

1. If we `sails.load` using `loadHooks` to allow only specific hooks, or `hooks` to disable particular hooks, only the specified hooks should actually be loaded.
2. `sails.load()` should fail if a test tries to load a hook that depends on other hooks, but those other hooks are disabled.  Note that `sails.load` should _fail with a relevant error message_ and _should not_ hang in this case.


