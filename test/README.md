# Sails tests


## Run the tests

From the root directory of Sails core, run:

```bash
npm test
```

## Goals

1. Identify latent inconsistencies or issues that we don't know about yet.
2. Provide low-level coverage of functionality that is difficult or time-consuming to QA / notice.
3. Protect the core from any future breaking changes.
4. Prevent regression.
5. Make merging pull requests easier by removing me (@mikermcneil) as the bottleneck for merging pull requests. (we can just run the tests to see if a change broke anything)
6. Make it easier for folks to contribute more tests, and help unify the style and structure of our existing tests.


## What To Test
In an ideal world, any possible action you could perpform with Sails as a user, whether programatically or via the command-line tool, would have a test. However the combinatoric scale of configuration variations in Sails, along with the fact that userland code can override just about any key piece of core, means we'll never _quite_ get to this point.  And that's ok.

Instead, the Sails project's goal is for any _feature of Sails_ you would use as a user, either programatically or via the command-line tool, to have a test.  In many cases, where these features are implemented within a dependency, the only tests for that feature exist within that dependency (e.g. [Waterline](https://github.com/balderdashy/waterline/tree/master/test), [Skipper](https://github.com/balderdashy/skipper/tree/master/test), and [Captains Log](https://github.com/balderdashy/captains-log/tree/master/test)).  But even in these cases, tests in Sails inevitably end up retesting certain features that are already verified by Sails' dependencies-- and there is nothing wrong with that.

## What _Not_ To Test
We should strive to avoid tests which verify exclusivity-- it cripples our ability to develop quickly.  In other words, tests should not fail with the introduction of additive features.

For instance, if you're writing a test to check that the appropriate files have been created with `sails new`, it would make sense to check for those files, but it would _not_ make sense to ensure that ONLY those files were created. (i.e. adding a new file should not break the tests)

Another example is a test which verifies the correctness of blueprint configuration, e.g. `sails.config.blueprints.rest`.  The test should check that blueprints behave properly with the `rest` config enabled and disabled.  We could change the configuration, add more controller-specific options, etc., and we'd only need to write new tests.

If, on the other hand, our strategy for testing the behavior of the blueprints involved evaluating the behavior AND THEN making a judgement on what the config "_should_" look like, we'd have to modify the tests when we add new options.  This may not sound like a big deal, but it can grow out of proportion quickly!




## Structural Conventions

Sails' tests are broken up into three distinct types- `unit`, `integration`, and `benchmark` tests.  See the README.md file in each directory for more information about the distinction and purpose of each type of test, as well as a shortlist of ways you can get involved.

The following conventions are true for all three types of tests:

+ Instead of partitioning tests for various components into subdirectories, the test files are located in the top level of the directory for their test type (i.e. `/test/TEST_TYPE/*.test.js`).
+ All test filenames have the `*.test.js` suffix.
+ Each test file for a particular component is namespaced with a prefix describing the relevant component (e.g. `router.specifiedRoutes.test.js`, `router.APIScaffold.test.js`, etc.).
+ Tests for core hooks are namespaced according to the hook that they test, e.g. `hook.policies.test.js`.
+ If tests for a core hook need to span multiple files, maintain the namespacing, e.g. `hook.policies.load.test.js` and `hook.policies.teardown.test.js`.

> **Reasoning**
>
> Filenames like these make it easy to differentiate tests from core files when performing a flat search on the repository (i.e. CMD/CTRL+T in Sublime).  Likewise, this makes the process easier to automate-- you can quickly grab all the test files with a simple recursive find on the command-line, for instance.

#### `fixtures` directory
Contains sample data/files/templates used for testing (e.g. a dummy Sails app or simple middleware functions)

#### `helpers` directory
Logic to help setup or teardown Sails, read fixtures, and otherwise simplify the logic in our tests.

