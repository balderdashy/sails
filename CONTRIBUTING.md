# How To Contribute

This guide is designed to help you get off the ground quickly contributing to Sails.  Reading it thoroughly will help you write useful issues, propose eloquent feature requests, and submit top-notch code that can be merged quickly.  Respecting the guidelines laid out below helps make the core maintainers of Sails more productive, and makes the experience of working with Sails more enjoyable for the community at large.


## Installing different versions of Sails

| Release               | Install Command          | Build Status      |
|-----------------------|--------------------------|-------------------|
| [stable](https://github.com/balderdashy/sails/tree/stable)                | `npm install sails`      | [![Build Status](https://travis-ci.org/balderdashy/sails.png?branch=stable)](https://travis-ci.org/balderdashy/sails) |
| [beta](https://github.com/balderdashy/sails/tree/beta)                  | `npm install sails@beta` | [![Build Status](https://travis-ci.org/balderdashy/sails.png?branch=beta)](https://travis-ci.org/balderdashy/sails) |
| [edge](https://github.com/balderdashy/sails/tree/master)                  | `npm install sails@git://github.com/balderdashy/sails.git` | [![Build Status](https://travis-ci.org/balderdashy/sails.png?branch=master)](https://travis-ci.org/balderdashy/sails) |


## Opening issues

> Sails is composed of a number of different sub-projects, many of which have their [own dedicated repository](https://github.com/balderdashy/sails/blob/master/MODULES.md).  Please open issues with Waterline, various adapters, various generators, etc. in the relevant repo.  This helps us stay on top of issues and keep organized.

When submitting an issue, please follow these simple instructions:

1. If you have a question about setting up/using Sails, please check out the [Sails docs](http://sailsjs.org/#!documentation) or try searching  [StackOverflow](http://stackoverflow.com/questions/tagged/sails.js).
2. Search for issues similar to yours in [GitHub search](https://github.com/balderdashy/sails/search?type=Issues) and [Google](https://www.google.nl/search?q=sails+js). 
3. Feature requests are welcome; see [Requesting Features](https://github.com/balderdashy/sails/blob/master/CONTRIBUTING.md#requesting-features) below for submission guidelines.
4. If there's an open issue, please contribute to that issue.
5. If there's a closed issue, open a new issue and link the url of the already closed issue(s).
6. If there is no issue, open a new issue and specify the following:
  - A short description of your issue in the title
  - The sails version (find this with ````sails -v````).
  - Detailed explanation of how to recreate the issue
7. If you are experiencing more than one problem, create a separate issue for each one. If you think they might be related, please reference the other issues you've created.



## Requesting Features


> Note: The process for tracking feature requests has recently changed. We are no longer using Trello.  Everything is being moved back to Github to allow more people to participate in the discussion.

> New feature requests should be made as pull requests to the `backlog` section of [ROADMAP.MD](https://github.com/balderdashy/sails/blob/master/ROADMAP.md).  We will monitor community discussion on these PRs and if they are wanted by the community/sails devs, they will be merged.  Further discussion is welcome even after a PR has been merged. 

##### Submitting a new feature request
1. First, look at the `backlog` table in [ROADMAP.MD](https://github.com/balderdashy/sails/blob/master/ROADMAP.md) and also search open pull requests in that file to make sure your change hasn't already been proposed.  If it has, join the discussion.
2. If it doesn't already exist, create a pull request editing the `backlog` table of [ROADMAP.MD](https://github.com/balderdashy/sails/blob/master/ROADMAP.md).
3. Start a discussion about why your feature should be built (or better yet, build it).  Get feedback in the #sailjs on IRC.  The more feedback we get from you guys, the better we are able to build the framework of your dreams :boat: 

## Writing Tests

See our [guides on writing tests](https://github.com/balderdashy/sails/tree/master/test) for Sails core.

Test Coverage:

| Edge (master branch) |
|----------------------|
| [![Coverage Status](https://coveralls.io/repos/balderdashy/sails/badge.png)](https://coveralls.io/r/balderdashy/sails) |



## Code Submission Guidelines

The community is what makes Sails great, without you we wouldn't have come so far. But to help us keep our sanity and reach code-nirvana together, please follow these quick rules whenever contributing.

> Note: This section is based on the [Node.js contribution guide](https://github.com/joyent/node/blob/master/CONTRIBUTING.md#contributing).

###### No CoffeeScript.

For consistency, all code in Sails core, including core hooks and core generators, must be written in JavaScript, not CoffeeScript or TypeScript.  We can't merge a pull request in CoffeeScript.

###### Contributing to an adapter

If the adapter is part of core (code base is located in the Sails repo), please follow the general best practices for contributing to Sails core.  If it is located in a different repo, please send feature requests, patches, and issues there.

###### Authoring a new adapter

The custom adapter API is not stable yet, but it is settling.  Feel free to start work on a new custom adapter, just make sure and do a thorough search on npm, Google and Github to make sure someone else hasn't already started working on the same thing.  A custom adapter is a great way to get your feet wet with contributing to the Waterline code base.

###### Contributing to a generator

If the generator is part of core (code base is located in the Sails repo), please follow the general best practices for contributing to Sails core.  If it is located in a different repo, please send feature requests, patches, and issues there.


###### Contributing to core

Sub-modules within the Sails core are at varying levels of API stability. Bug fixes are always welcome but API or behavioral changes to modules at stability level 3 and up cannot be merged without serious planning.

Sails has several dependencies referenced in the `package.json` file that are not part of the project proper. Any proposed changes to those dependencies or _their_ dependencies should be sent to their respective projects (i.e. Waterline, Anchor, etc.) Please do not send your patch or feature request to this repository, we cannot accept or fulfill it.

In case of doubt, open an issue in the [issue tracker](), post your question to the [mailing list]() or contact one of the project maintainers on IRC (#sailsjs on freenode).  Especially if you plan to work on something big. Nothing is more frustrating than seeing your hard work go to waste because your vision does not align with a project's roadmap.  At the end of the day, we just want to be able to merge your code.

###### Contributing to a hook

If the hook is part of core (code base is located in the Sails repo), please follow the general best practices for contributing to Sails core.  If the hook is located in a different repo, please send feature requests, patches, and issues there.

###### Authoring a new hook

The custom hook API, while functional, is still unstable.  Feel free to start work on a custom hook, but please consult with one of the project maintainers first so we can help protect your work from future changes.

###### Authoring a new generator

The custom generator API is very new, and still experimental.  If you are serious about building a new generator, please consult with one of the project maintainers before you start so we can help set you off on the right foot.


###### Submitting Pull Requests

0. If you don't know how to fork and PR, [follow our instructions on contributing](https://github.com/balderdashy/sails-docs/blob/master/contributing/Sending-Pull-Requests.md).
1. Fork the repo.
2. Add a test for your change. Only refactoring and documentation changes require no new tests. If you are adding functionality or fixing a bug, we need a test!
4. Make the tests pass and make sure you follow [our syntax guidelines](https://github.com/balderdashy/sails/blob/master/.jshintrc).
5. Add a line of what you did to CHANGELOG.md (right under `master`).
6. Push to your fork and submit a pull request to the appropriate branch:
  + [master](https://github.com/balderdashy/sails/tree/master)
    + corresponds with the "edge" version-- the latest, not-yet-released version of Sails. Most pull requests should be sent here
  + [stable](https://github.com/balderdashy/sails/tree/stable)
    + corresponds with the latest stable release on npm (i.e. if you have a high-priority hotfix, send the PR here)



## Best-practices / workflow for developing on Sails

The best way to work with Sails core is to fork the repository, `git clone` it to your filesystem, and then run `npm link`.  In addition to writing tests, you'll often want to use a sample project as a harness-- to do that, `cd` into the sample app and run `npm link sails`.  This will create a symbolic link in the `node_modules` directory of your sample app that points to your local cloned version of sails.  This keeps you from having to copy the framework over every time you make a change.  You can force your sample app to use the local sails dependency by running `node app` instead of `sails lift` (although `sails lift` **should** use the local dependency, if one exists).  If you need to test the command line tool this way, you can access it from your sample app as `node node_modules/sails/bin/sails`.  For example, if you were working on `sails new`, and you wanted to test it manually, you could run `node node_modules/sails/bin/sails new testProj`.

Of course, that's just my opinion, so if you have a more productive way to collaborate/contribute, that is entirely your perogative.  And as always, if you have suggestions, please let us know.


## Installing an unreleased branch for testing

In general, you can `npm install` sails directly from Github as follows:

```sh
# Install an unreleased branch of Sails in the current directory's `node_modules`
$ npm install sails@git://github.com/balderdashy/sails.git#nameOfDesiredBranch
```

This is useful for testing/installing hot-fixes, and just a good thing to know how to do in general.  Here's how you'd install a few different branches:

| Release               | Install Command          |
|-----------------------|--------------------------|
| [stable](https://github.com/balderdashy/sails/tree/stable)                | `npm install sails@git://github.com/balderdashy/sails.git#stable`      |
| [beta](https://github.com/balderdashy/sails/tree/beta)                  | `npm install sails@git://github.com/balderdashy/sails.git#beta` |
| [edge](https://github.com/balderdashy/sails/tree/master)                  | `npm install sails@git://github.com/balderdashy/sails.git` |


## Financial Support

+ Sails is sponsored by [Balderdash](http://balderdash.co), a small development and design studio in Austin, TX.  If you have a mutually beneficial opportunity to work together, or want to fund us to accelerate the development of a feature in Sails for a real-world use case, please [contact us](http://balderdash.co).
+ [Donate](https://www.gittip.com/mikermcneil/) to help me (@mikermcneil) stop paying myself, and instead use that money to expand the core team, improve docs, etc.


## Additional Resources
#### [Get Started](http://sailsjs.org/#!getStarted) | [Documentation](http://sailsjs.org/#!documentation) | [Changelog](https://github.com/balderdashy/sails/wiki/Changelog) | [#sailsjs on IRC](http://webchat.freenode.net/) | [Google Group](https://groups.google.com/forum/?fromgroups#!forum/sailsjs) | [Twitter](http://twitter.com/sailsjs)
