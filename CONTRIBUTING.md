# How To Contribute
The community is what makes Sails great, without you we wouldn't have come so far. But to help us keep our sanity and reach code-nirvana together, please follow these quick rules whenever contributing.


## Opening issues
1. If you have a question about setting up/using Sails, please check out the [Sails docs](http://sailsjs.org/#!documentation) or try searching  [StackOverflow](http://stackoverflow.com/questions/tagged/sails.js).
2. Search for issues similar to yours in [GitHub search](https://github.com/balderdashy/sails/search?type=Issues) and [Google](https://www.google.nl/search?q=sails+js). 
3. Feature requests are very welcome, but we would prefer to keep them separate from actual issues with the framework. If you want to submit a feature request, please post it on our [Trello Board](https://trello.com/b/cGzNVE0b/sails-js-feature-requests). You can do so by emailing the issue to sailsfeaturerequests+wlhnmobeqngolth6lh6z@boards.trello.com. You can put the name of the request in the subject line, and the description in the body. It can sometimes take a few minutes for it to appear on the board, so please be patient if you don't see it right away.
4. If there's an open issue, please contribute to that issue.
5. If there's a closed issue, open a new issue and link the url of the already closed issue(s).
6. If there is no issue, open a new issue and specify the following:
  - A short description of your issue in the title
  - The sails version (find this with ````sails -v````).
  - Detailed explanation of how to recreate the issue
7. If you are experiencing more than one problem, create a separate issue for each one. If you think they might be related, please reference the other issues you've created.


## Writing Code

> This section is based on the [Node.js contribution guide](https://github.com/joyent/node/blob/master/CONTRIBUTING.md#contributing).


#### Contributing to an adapter

If the adapter is part of core (code base is located in the Sails repo), please follow the general best practices for contributing to Sails core.  If it is located in a different repo, please send feature requests, patches, and issues there.

#### Authoring a new adapter

The custom adapter API is not stable yet, but it is settling.  Feel free to start work on a new custom adapter, just make sure and do a thorough search on npm, Google and Github to make sure someone else hasn't already started working on the same thing.  A custom adapter is a great way to get your feet wet with contributing to the Waterline code base.

#### Contributing to a generator

If the generator is part of core (code base is located in the Sails repo), please follow the general best practices for contributing to Sails core.  If it is located in a different repo, please send feature requests, patches, and issues there.

> For consistency, all code in Sails core, including core hooks and core generators, must be written in JavaScript, not CoffeeScript or TypeScript.  We can't merge a pull request in CofeeScript.


#### Contributing to core

Sub-modules within the Sails core are at varying levels of API stability. Bug fixes are always welcome but API or behavioral changes to modules at stability level 3 and up cannot be merged without serious planning.

Sails has several dependencies referenced in the `package.json` file that are not part of the project proper. Any proposed changes to those dependencies or _their_ dependencies should be sent to their respective projects (i.e. Waterline, Anchor, etc.) Please do not send your patch or feature request to this repository, we cannot accept or fulfill it.

In case of doubt, open an issue in the [issue tracker](), post your question to the [mailing list]() or contact one of the project maintainers on IRC (#sailsjs on freenode).  Especially if you plan to work on something big. Nothing is more frustrating than seeing your hard work go to waste because your vision does not align with a project's roadmap.  At the end of the day, we just want to be able to merge your code.

> For consistency, all code in Sails core, including core hooks and core generators, must be written in JavaScript, not CoffeeScript or TypeScript.  We can't merge a pull request in CofeeScript.

#### Contributing to a hook

If the hook is part of core (code base is located in the Sails repo), please follow the general best practices for contributing to Sails core.  If the hook is located in a different repo, please send feature requests, patches, and issues there.

> For consistency, all code in Sails core, including core hooks and core generators, must be written in JavaScript, not CoffeeScript or TypeScript.  We can't merge a pull request in CofeeScript.

#### Authoring a new hook

The custom hook API, while functional, is still unstable.  Feel free to start work on a custom hook, but please consult with one of the project maintainers first so we can help protect your work from future changes.

#### Authoring a new generator

The custom generator API is very new, and still experimental.  If you are serious about building a new generator, please consult with one of the project maintainers before you start so we can help set you off on the right foot.



## Submitting Pull Requests
0. If you don't know how to fork and PR, [follow our instructions on contributing](https://github.com/balderdashy/sails-docs/blob/0.9/Contributing-to-Sails.md).
1. Fork the repo.
2. Add a test for your change. Only refactoring and documentation changes require no new tests. If you are adding functionality or fixing a bug, we need a test!
4. Make the tests pass and make sure you follow [our syntax guidelines](https://github.com/balderdashy/sails/blob/master/.jshintrc).
5. Push to your fork and submit a pull request to our [the v0.10 branch](https://github.com/balderdashy/sails/tree/v0.10).


## Requesting Features
We use [Trello](https://trello.com/b/cGzNVE0b/sails-js-feature-requests) for tracking feature requests.

##### Submitting a New Feature Request

1. Check to see if a feature request already exists for what you're interested in.  You can upvote and comment on existing requests.
2. [Send the board an email](sailsfeaturerequests+wlhnmobeqngolth6lh6z@boards.trello.com) with a short label (< 10 words or so) for the feature request as the subject line and a more detailed description in the body of the message with your github username.  If you'd be able to help contribute to the development of the feature, please mention that in the description!

It can sometimes take a few minutes for a new request to appear on the board, due to latency processing our little email message hack, so please be patient if you don't see it right away.




## Additional Resources
[Get Started](http://sailsjs.org/#!getStarted) | [Documentation](http://sailsjs.org/#!documentation) | [Changelog](https://github.com/balderdashy/sails/wiki/Changelog) | [#sailsjs on IRC](http://webchat.freenode.net/) | [Google Group](https://groups.google.com/forum/?fromgroups#!forum/sailsjs) | [Twitter](http://twitter.com/sailsjs)
