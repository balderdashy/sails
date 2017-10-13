# Sails tests


## Run the tests

From the root directory of Sails core, run:

```bash
npm test
```

> Or if you're using Windows:
>
> ```cmd
> npm run custom-tests
> ```

## Goals

1. Identify latent inconsistencies or issues that we don't know about yet.
2. Provide low-level coverage of functionality that is difficult or time-consuming to QA / notice.
3. Protect the core from any future breaking changes.
4. Prevent regression.
5. Make merging pull requests easier by removing me (@mikermcneil) as the bottleneck for merging pull requests. (we can just run the tests to see if a change broke anything)
6. Make it easier for folks to contribute more tests, and help unify the style and structure of our existing tests.


## Writing tests
> For more information about writing tests (structural conventions, what to test, what _not_ to test) see the [Contribution guide](https://github.com/balderdashy/sails-docs/blob/master/contributing/code-submission-guidelines/writing-tests.md).
