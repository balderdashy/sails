# Writing tests

### What to test
In an ideal world, any possible action you could perform as a Sails user&mdash;whether programatically or via the command-line tool&mdash;would have a test. However, the number of configuration variations in Sails, along with the fact that userland code can override just about any key piece of core, means we'll never _quite_ get to this point.  And that's okay.

Instead, the Sails project's goal is for any _feature of Sails_ you might use&mdash;programatically or via the command-line tool&mdash;to have a test.  In cases where these features are implemented within a dependency, the only tests for that feature exist within that dependency (e.g. [Waterline](https://github.com/balderdashy/waterline/tree/master/test), [Skipper](https://github.com/balderdashy/skipper/tree/master/test), and [Captains Log](https://github.com/balderdashy/captains-log/tree/master/test)).  Even in these cases, though, tests in Sails inevitably end up retesting certain features that are already verified by Sails' dependencies, and there's nothing wrong with that.

### What _not_ to test
We should strive to avoid tests which verify exclusivity: it cripples our ability to develop quickly.  In other words, tests should not fail with the introduction of additive features.

For instance, if you're writing a test to check that the appropriate files have been created with `sails new`, it would make sense to check for those files, but it would _not_ make sense to ensure that ONLY those files were created (i.e. adding a new file should not break the tests).

Another example is a test which verifies the correctness of blueprint configuration, e.g. `sails.config.blueprints.rest`.  The test should check that blueprints behave properly with the `rest` config enabled and disabled.  We could change the configuration, add more controller-specific options, etc., and we'd only need to write new tests.

If, on the other hand, our strategy for testing the behavior of the blueprints involved evaluating the behavior and *then* making a judgement on what the config "_should_" look like, we'd have to modify the tests when we added new options.  This may not sound like a big deal, but it can grow out of proportion quickly!



<!--
### Structural Conventions

Sails's tests are broken up into three distinct types- `unit`, `integration`, and `benchmark` tests.  See the README.md file in each directory for more information about the distinction and purpose of each type of test, as well as a shortlist of ways you can get involved.

The following conventions are true for all three types of tests:

+ Instead of partitioning tests for various components into subdirectories, the test files are located in the top level of the directory for their test type (i.e. `/test/TEST_TYPE/*.test.js`).
+ All test filenames have the `*.test.js` suffix.
+ Each test file for a particular component is namespaced with a prefix describing the relevant component (e.g. `router.specifiedRoutes.test.js`, `router.APIScaffold.test.js`, etc.).
+ Tests for core hooks are namespaced according to the hook that they test, e.g. `hook.policies.test.js`.
+ If tests for a core hook need to span multiple files, maintain the namespacing, e.g. `hook.policies.load.test.js` and `hook.policies.teardown.test.js`.

> **Reasoning**
>
> Filenames like these make it easy to differentiate tests from core files when performing a flat search on the repository (i.e. CMD/CTRL+P in Sublime).  Likewise, this makes the process easier to automate-- you can quickly grab all the test files with a simple recursive find on the command-line, for instance.

#### `fixtures` directory
Contains sample data/files/templates used for testing (e.g. a dummy Sails app or simple middleware functions)

#### `helpers` directory
Logic to help setup or teardown Sails, read fixtures, and otherwise simplify the logic in our tests.
-->

<docmeta name="displayName" value="Writing tests">
