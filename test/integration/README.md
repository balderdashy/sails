# Integration tests

The goal of these tests is to run Sails just like you or I would, and verify that no anomolies have been introduced in general.

Currently, most of these tests are out of date for 0.10 and need some work.  This is a great place to jump in if you're interested in contributing!


## Structure

##### test files
The test files are all in the top level of the `/test/integration` directory.  If broken up into multiple files, each one should be namespaced (e.g. `router.specifiedRoutes.test.js`, `router.APIScaffold.test.js`, etc.)

##### fixtures
Contains sample files or templates from a dummy Sails app used for testing.

##### helpers
Logic to help setup or teardown Sails, read fixtures, and otherwise simplify the logic in our tests.

##### benchmark
Special tests related to benchmarking the performance of different parts of Sails.