# Sails tests


## Run the tests

From the root directory of this module:

```
npm test
```

## Goals

1. Identify latent inconsistencies or issues that we don't know about yet.
2. Provide low-level coverage of functionality that is difficult or time-consuming to QA / notice.
3. Protect the core from any future breaking changes.
4. Prevent regression.
5. Make merging pull requests easier by removing me (@mikermcneil) as the bottleneck for merging pull requests. (we can just run the tests to see if a change broke anything)
6. Make it easier for folks to contribute more tests, and help unify the style and structure of our existing tests.



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
> Filenames like these make it easy to differentiate tests from core files when performing a flat search on the repository (i.e. CMD/CTRL+P in Sublime).  Likewise, this makes the process easier to automate-- you can quickly grab all the test files with a simple recursive find on the command-line, for instance.

#### `fixtures` directory
Contains sample data/files/templates used for testing (e.g. a dummy Sails app or simple middleware functions)

#### `helpers` directory
Logic to help setup or teardown Sails, read fixtures, and otherwise simplify the logic in our tests.

