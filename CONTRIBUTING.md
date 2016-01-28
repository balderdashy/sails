# Contributing to Sails

| **Contents**                                                      |
| ----------------------------------------------------------------- |
| Preface
| I. [Code of Conduct](#i-code-of-conduct)
| II. [Issue Contributions](#ii-issue-contributions)
| III. [Contributing to the Documentation](#iii-contributing-to-the-documentation)
| IV. [Writing Tests](#iv-writing-tests)
| V. [Proposing Features and Enhancements](#v-proposing-features-and-enhancements)
| VI. [Code Submission Guidelines](#vi-code-submission-guidelines)
| VII. [Best Practices](#vii-best-practices)
| VIII. [Core Maintainers](#viii-core-maintainers)
| IX. [Contributor's Pledge](#ix-contributors-pledge)
| X. [Credits](#x-credits)


## Preface

This guide is designed to help you get off the ground quickly contributing to Sails.  Reading it thoroughly will help you write useful issues, make eloquent proposals, and submit top-notch code that can be merged quickly.  Respecting the guidelines laid out below helps make the core maintainers of Sails more productive, and makes the experience of working with Sails positive and enjoyable for the community at large.

If you are working on a pull request, **please carefully read this file from top to bottom**. In case of doubt, open an issue in the issue tracker or contact someone from our [core team](https://github.com/balderdashy/sails#team) on Twitter. Especially do so if you plan to work on something big. Nothing is more frustrating than seeing your hard work go to waste because your vision does not align with planned or ongoing development efforts of the project's maintainers.




## I. Code of Conduct

The Code of Conduct explains the *bare minimum* behavior expectations the Sails project requires of its contributors. [Please read it before participating.](./CODE-OF-CONDUCT.md)

  
## II. Issue Contributions

When opening new issues or commenting on existing issues in any of the repositories in this GitHub organization, please make sure discussions are related to concrete technical issues of the Sails.js software.  Feature requests and ideas are always welcome; but they should not be submitted as GitHub issues.  See [Requesting Features](https://github.com/balderdashy/sails/blob/master/CONTRIBUTING.md#requesting-features) below for submission guidelines.

For general help using Sails, please refer to the [official Sails documentation](http://sailsjs.org/documentation).  For additional help, ask a question on [StackOverflow](http://stackoverflow.com/questions/ask) or refer to any of the [other recommended avenues of support](https://github.com/balderdashy/sails#support).

If you have found a security vulnerability in Sails or any of its dependencies, _do not report it in a public issue_.  Instead, you should promptly follow the instructions for alerting the core maintainers in the [Sails Security Policy](https://github.com/balderdashy/sails-docs/blob/master/security/SAILS-SECURITY-POLICY.md).  Please observe this request _even for  external dependencies the core Sails.js team does not directly maintain_ (such as Socket.io, Express, Node.js, or openssl)_.  Whether or not you believe the core team can do anything to fix an issue, please follow the instructions in our security policy to privately disclose the vulnerability as quickly as possible.

Finally, discussion of a non-technical nature, including subjects like team membership, trademark, code of conduct and high-level questions or concerns about the project should be sent directly to the core maintainers by emailing [inquiries@treeline.io](inquiries@treeline.io).

#### Opening an issue

> Sails is composed of a number of different sub-projects, many of which have their [own dedicated repository](https://github.com/balderdashy/sails/blob/master/MODULES.md).  Please open suspected issues with Waterline, various adapters, various generators, etc. in the relevant repository.  When in doubt, or if your issue spans multiple repositories, please use this repository (Sails core) as a catchall. This helps us stay on top of issues and keep organized.

Before submitting an issue, please follow these simple instructions:

0. Search for issues similar to yours in [GitHub search](https://github.com/balderdashy/sails/search?type=Issues) within the appropriate repository,
  - If your original bug report is covered by an existing open issue, then add a comment to that issue instead of opening a new one.
  - If all clearly related issues are closed, then open a new issue and paste links to the URLs of the already closed issue(s) at the bottom.
  - Otherwise, if you cannot find any related issues, double-check that you are searching the most relevant repository, and try using different search keywords if appropriate (in case this affects how you search, at the time of this writing, GitHub uses ElasticSearch, which is based on Lucene, to index content).  If you still cannot find any relevant existing issues, then create a new one.
  - Please consider the importance of backlinks.  A contributor responding to your issue will almost always need to search for similar existing issues herself, so having the URLs all in one place is a huge time-saver.  Also keep in mind that backlinking from new issues causes GitHub to insert a link to the URL of the new issue in referenced original issues automatically.  This is very helpful, since many visitors to our GitHub issues arrive from search engines.
1. Make sure your new issue does not report multiple unrelated problems.
  - If you are experiencing more than one problem, and the problems are clearly distinct, create a separate issue for each one; but start with the most urgent.
  - If you are experiencing two or more related problems (problems that you have only been able to reproduce in tandem), then please create only a single issue, but be sure to describe both problems thoroughly, as well as the steps necessary to cause them both to appear.
2. Check that your issue has a concise, on-topic title that uses polite, neutral language to explain the problem as best you can in the available space. The ideal title for your issue is one that communicates the problem at a glance.
  - For example, _"jst.js being removed from layout.ejs on lift"_ is a **very helpful** title for an issue.
  - Here are some **non-examples**-- that is, examples of issue titles which are **not helpful**:
    - _"templates dont work"_  (too vague-- even if more information cannot be determined, wording like _"unexpected behavior with templates"_ would be more appropriate and quickly answered)
    - _"app broken cannot access templates on filesystem because it is broken in the asset pipeline please help"_  (repetitive, and contains unnecessary words like _"please help"_)
    - _"jst.js is being REMOVED!!!!!!!!!"_  (unnecessary capitalization and punctuation such as exclamation points often come across as impolite, which is distracting and may cause additional delay in your issue getting a response)
    - _"How does this dumb, useless framework remove jst.js from my app?"_  (issues with titles that contain unnecessary negativity are likely to inspire a cold reaction from participants)
    - _"Thousands of files being corrupted in our currently deployed production app every time the server crashes."_  (no matter how important or urgent an issue is to you, language like this causes many contributors to assume hyperbole-- think the boy who cried wolf-- and it definitely does not result in a faster response from the core team. In fact, it may confuse the issue; i.e. "Is this only happening when NODE_ENV===production?")
3. Before putting together steps to reproduce, normalize as many of the variables on your personal development environment as possible:
  - Make sure you have the right app lifted.
  - Make sure you've killed the Sails server with CTRL+C and started it again.
  - Make sure you do not have any open browser tabs pointed at localhost.
  - Make sure you do not have any other Sails apps running in other terminal windows.
  - Make sure the app you are using to reproduce the issue has a clean `node_modules/` directory, meaning:
    - no dependencies are linked (e.g. you haven't run `npm link foo`)
    - that you haven't made any inline changes to files in the `node_modules/` folder
    - that you don't have any weird global dependency loops
    The easiest way to double-check any of the above, if you aren't sure, is to run: `rm -rf node_modules && npm cache clear && npm install`.
4. Provide the version of Sails that your app is using (`sails -v`).
  - Remember that this could be different than the version of Sails you have globally installed.
5. Provide your currently-installed version of Node.js (`node -v`), your version of NPM (`npm -v`), and the operating system that you are running (OS X, Windows, Ubuntu, etc.)
  - If you are using `nvm` or another Node version manager like `n`, please be sure to mention that in the issue.
6. Provide detailed steps to reproduce the problem from a clean Sails app (i.e. an app created with `sails new` on a computer with no special environment variables or `.sailsrc` files)
7. Stop for a second and think about what you are about to post, and how it will be interpreted by the rest of the Sails userbase.  Make sure it is aligned with our Code of Conduct, and make sure you are not endangering other Sails users by posting a [security vulnerability](https://github.com/balderdashy/sails-docs/blob/master/security/SAILS-SECURITY-POLICY.md) publicly.

Issues which do not meet these guidelines will usually be closed without being read, with a response asking that the submitter review this contribution guide.  If this happens to you, _realize it is nothing personal_ and that it may even happen again.  Please consider that Sails is a large project that receives hundreds of new issue submissions every month, and that we truly appreciate the time you donate to post detailed issues.  The more familiar you become with the conventions and ground rules laid out in this contribution guide, the more helpful your future contributions will be for the community.  You will also earn the respect of core team members and set a good example for future contributors.

> You might think of these rules as guardrails on a beautiful mountain road-- they may not always be pretty, and if you run into them you may get banged up a little bit; but collectively, they keep us all from sliding off a turn and into the abyss.




## III. Contributing to the Documentation

The official documentation on the Sails website is compiled from markdown files in a separate repo. Read the [guide on contributing to the documentation](https://github.com/balderdashy/sails/tree/master/test) for more information about how you can help.


#### Translating the Documentation

A great way to help the Sails project, especially if you speak a language other than English natively, is to volunteer to translate the Sails documentation. The documentation for Sails has been translated to a number of different languages including Japanese, Brazilian Portugese, Taiwanese Mandarin, Korean, and Spanish.  For an up-to-date list, or to learn more about contributing to an existing translation project or starting one for your language, refer to the [documentation contribution guide](https://github.com/balderdashy/sails/tree/master/test).


#### Contributing to the Sails Website

If you believe you have found a bug on the Sails website itself, or a glitch in the generated HTML, please open an issue in the [Sails website repo](https://github.com/balderdashy/www.sailsjs.org).





## IV. Writing Tests

See our [guide on writing tests](https://github.com/balderdashy/sails/tree/master/test) for Sails core.



## V. Proposing Features and Enhancements

Sails contributors have learned over the years that keeping track of feature requests in the same bucket as potentially-critical issues leads to a dizzying number of open issues on GitHub, and makes it harder for the community as a whole to respond to bug reports.  It also introduces a categorization burden: Imagine a GitHub issue that is 2 parts feature request, 3 parts question, but also has a _teensie pinch_ of immediately-relevant-and-critical-issue-with-the-latest-stable-version-of-Sails-that-needs-immediate-attention.

If suggestions, requests, or pleas for features or enhancements are submitted as GitHub issues, they will be closed by [sailsbot](http://asksailsbot.tumblr.com/) or one of her lackeys in the Sails core team.  This doesn't mean the core team does not appreciate your willingness to share your experience and ideas with us; we just ask that you use our new process.  Instead of creating a GitHub issue, please submit your proposal for a new feature or an extension to an existing feature using the process outlined below under [Submitting a Proposal](#submitting-a-proposal).

Please **do not propose _changes to the established conventions or default settings_ of Sails**. These types of discussions tend to start "religious wars" about topics like EJS vs. Jade, Grunt vs. Gulp, Express vs. Hapi, etc., and managing those arguments creates rifts and consumes an inordinate amount of contributors' time.  Instead, if you have concerns about the opinions, conventions or default configuration in Sails, please [contact the core maintainers directly](mailto:inquiries@treeline.io).


#### Submitting a Proposal

Before submitting a new proposal, please consider the following:

Many individuals and companies (large and small) are happily using Sails in production projects (both greenfield and mature) with the currently-released feature set today, as-is.  A lot of the reason for this is that Sails was built while the core team was running a development shop, where it was used to take many different kinds of applications from concept to production, and then to serve as the backend for those applications as they were maintained over the next few years.

Much like the canonical case of Ruby on Rails, this means that Sails was designed from the beginning to be both developer-friendly and enterprise-friendly using a convention over configuration methodology.  **Conventions** make it quick and easy to build new Sails apps and switch between different existing Sails apps, while **configurability** allows Sails developers to be flexible and customize those apps as they mature using the full power of the underlying tool chain (configuration, plugins/overrides, Express, Socket.io, Node.js, and JavaScript).

Over the first year of Sails' life, the **configurability** requirement became even more important.  As the user base grew and Sails started to be used on all sorts of different projects, and by developers with all sorts of different preferences, the number of feature requests skyrocketed.  Sails solved this in 2013 by rewriting its core and becoming innately interoperable:

+ Since Sails apps are just Node apps, you can take advantage of any of the [millions](bit.ly/npm-numbers) of NPM packages on http://npmjs.org.  (And more recently, you can also take advantage of any of the hundreds of automatically-documented machine functions curated from NPM at http://node-machine.org)
+ Since Sails uses the same req/res/next pattern as Express and Connect, you can take advantage of any middleware written for those middleware frameworks in your app, such as Lusca (security middleware from Paypal) or morgan (HTTP logging util).
+ Since Sails uses [Consolidate](https://github.com/tj/consolidate.js/), you can use any of the view engines compatible with Express such as Jade, Dust or Handlebars.
+ Since Sails uses a familiar MVC project structure, you and/or other developers on your team can quickly get up to speed with how the app works, the database schema, and even have a general notion of where common configuration options live.
+ Since Sails uses Grunt, you can install and use any of the thousands of available Grunt plugins on http://gruntjs.com/plugins in your app.
+ Sails' hook system allows you to disable, replace, or customize large swaths of functionality in your app, including pieces of Sails core, such as replacing Grunt with Gulp.
+ Waterline's adapter interface allows you to plug your models into any database such as Oracle, MSSQL, or Orient DB.
+ Skipper's adapter interface allows you to plug your incoming streaming file uploads into any blob storage container such as S3, GridFS, or Azure.
+ Sails' generator system allow you to completely control all files and folders that the Sails command-line tool generates when you run `sails new` or `sails generate *`.

It is important to realize that today, most (but certainly not all) new features in Sails can be implemented using one or more of the existing plugin interfaces, rather than making a change to core.  If the feature you are requesting is an exception to that rule, then please proceed-- but realize that perhaps the most important part of your proposal is a clear explanation of why what you're suggesting is not possible today.

The core maintainers of Sails review all feature proposals, and we do our best to participate in the discussion in these PRs.  However, many of these proposals can sometimes involve back and forth discussion that could require them to be open for months at a time.  So it is important to understand going in that if you are proposing a feature, the onus is on you to fully specify how that feature would work; i.e. how it would be used, how it would be configured, and in particular its implementation-- that is, which modules would need to change to make it a reality, how it would be tested, whether it would be a major or minor-version breaking change, and the additions and/or modifications that would be necessary to the official Sails documentation.  

With that in mind, to submit a proposal for a new feature, or an extension to an existing feature, please take the following steps:

0. First, look at the `backlog` table in [ROADMAP.MD](https://github.com/balderdashy/sails/blob/master/ROADMAP.md) and also search open pull requests in that file to make sure your change hasn't already been proposed.
  - If the PR (pull request) has been merged, it means that a core maintainer has (A) looked over the proposal and discussion in the pull request, (B) personally agreed to him or herself that the feature would be a good fit for Sails core, and (C) confirmed the decision with [@mikermcneil](https://github.com/mikermcneil).  It also means that the proposal is now in the backlog in ROADMAP.md, which means that the core team would be willing to merge a pull request with code changes adding the feature to Sails core (assuming that pull request follows our coding style conventions and the guidelines in this document).
  - If the PR has been closed without being merged, it means that the core team has decided that the feature request should not be a part of Sails core.  Just because the proposal is closed does not mean the feature will never be achievable in Sails, it just means that (A) it would need to be specced differently to be merged or (B) it would need to be implemented as a plugin (i.e. a hook, adapter, generator, view engine, grunt/gulp task, etc.)
  - If the PR is _open_, it means that either (A) it was recently posted, (B) there is still an active discussion in progress, (C) that a core maintainer has not had time to look into it yet, or most commonly (D) that one or more core maintainers have looked at and potentially even responded to the proposal, but the team decided there wasn't enough information to make a firm "yes" or "no" judgement call.  This fourth scenario is quite common, since it sometimes takes a great deal of time to develop a specification that is thorough enough to merge into the backlog.  The core maintainers review and contribute to proposals as much as time allows, but ultimately it is the responsibility of the developers requesting a feature to do the work of fully speccing it out.
  - While some of Sails' core maintainers carefully filter email from GitHub (because they also like to get other email sometimes), many contributors receive GitHub notifications every time a new comment is posted.  Out of respect for them, please do not `*bump*` or `:+1:` feature proposals.   Instead, write a concise (3-5 sentences) explanation of your real-world use case for the feature.
1. If it doesn't already exist, create a pull request editing [ROADMAP.MD](https://github.com/balderdashy/sails/blob/master/ROADMAP.md) (the easiest way to do this is opening ROADMAP.md while logged in to GitHub and clicking the "Edit" button).
2. Add a new row to the **Backlog** table with a very short description of the feature, then submit the change as a pull request (the easiest way to do this is to use the GitHub UI as discussed above, make your changes, then follow the on-screen instructions).
3. In the description for your pull request:
  - First, write out a high-level summary of the feature you are proposing as a concise description (3-5 sentences) focused around a convincing real-world use case where the Sails app you are building or maintaining for your job, your clients, your company, your non-profit work, or your independent hobby project would be made easier by this feature or change.
  - Next, describe in clear prose with relevant links to code files exactly why it would be difficult or impossible to implement the feature without changing Sails core (i.e. using one or more of the existing plugin mechanisms).  If this is not the case, and this feature could be implemented as a plugin, then please reconsider writing your proposal (it is unlikely the core team will be able to accept it).  If you are the author of one or more plugins, and feel that you or other users would benefit from having your work in Sails core, please contact the core team directly (see the instructions for submitting "high-level questions or concerns about the project" above).
  - Finally, if you have time, take a first pass at proposing a spec for this feature (its configuration, usage, and how it would be implemented).  If you do not have time to write out a first draft of a thorough specification, please make that point in your feature request, and clarify that it would be up to other contributors with the same or a similar use case to finish this proposal.


Proposals which do not meet these guidelines will be closed with a response asking that the submitter review this contribution guide.  If this happens to you, _realize it is nothing personal_ and that it may even happen again.  Please consider that a tremendous amount of effort has been put into the existing plugin systems in Sails, and so any proposed change to core must be carefully considered in relation to how it would affect existing plugins, existing apps, and future development of the framework.  Many Sails contributors have become intimately familiar with how the various systems in Sails interact and will be willing to help you out; but in order for that process to be efficient, it is important that all new features and enhancements follow a common set of ground rules.

> ###### If your feature proposal is merged...
> Having your proposal merged does not necessarily mean that you are responsible for _implementing_ the feature; and you certainly won't be responsible for _maintaining_ future changes which might affect that feature for all eternity.  _That_ privilege is reserved for Mike and the rest of the core team; which is why it is so important to spec out the vision for the usage, configuration, and implementation of your proposed feature from day 1.  Working out this sort of a detailed proposal is not an easy task, and often involves more effort than the actual implementation.  But if a proposal is accepted, it becomes part of the project's mission: which means once it is implemented and merged, the core team is committed to maintaining it as a part of Sails.



## VI. Code Submission Guidelines

There are two types of code contributions we can accept in Sails core:  patches and new features.

**Patches** are small fixes; everything from typos to timing issues.  For example, removing an unused `require()` from the top of a file or fixing a typo that is crashing the master branch tests on Travis are two great examples of patches.  Major refactoring projects changing whitespace and variable names across multiple files are _**not** patches_.  Also keep in mind that even a seemingly trivial change is not a patch if it affects the usage of a documented feature of Sails, or adds an undocumented public function.

**New features** are TODOs summarized in the ROADMAP.md file, with more information in an accompanying pull request.  Anything that is not specifically in the ROADMAP.md file should not be submitted as a new feature.

As stated at the top of this file, in case of doubt about whether a change you would like to make would be considered a "patch", please open an issue in the issue tracker or contact someone from our [core team](https://github.com/balderdashy/sails#team) on Twitter _before_ you begin work on the pull request. Especially do so if you plan to work on something big. Nothing is more frustrating than seeing your hard work go to waste because your vision does not align with planned or ongoing development efforts of the project's maintainers.



#### General rules

- **No CoffeeScript**.  For consistency, all imperative code in Sails core, including core hooks and core generators, must be written in JavaScript, not CoffeeScript, TypeScript, or any other pre-compiled language.  We cannot merge a pull request written in CoffeeScript.
- Do not auto-format code, or attempt to fix perceived style problems in existing files in core.
- Do not change more than 3 files in a single pull request-- it makes it very hard to tell what's going on.
- Do not submit pull requests which implement new features or enhance existing features unless you are working from a very clearly-defined proposal and spec from a merged feature request.  As stated above, nothing is more frustrating than seeing your hard work go to waste because your vision does not align with a project's roadmap. 
- Before beginning work on a feature, you should be sure to leave a comment telling other contributors that you are working on the feature.  Note that if you do not actively keep other contributors informed about your progress, your silence may be taken as inactivity, and you may end up working on the same feature as someone else in parallel.  


#### Contributing to core

Sub-modules within the Sails core are at varying levels of API stability. Bug fixes (patches) are always welcome, but API or behavioral changes cannot be merged without serious planning, as documented in the process for feature proposals above.

Sails has several dependencies referenced in the `package.json` file that are not part of the project proper. Any proposed changes to those dependencies or _their_ dependencies should be sent to their respective projects (i.e. Waterline, Anchor, Express, etc.) Please do not send your patch or feature request to this repository; we cannot accept or fulfill it.


#### Contributing to an adapter

If the adapter is part of core (code base is located in the Sails repo), please follow the general best practices for contributing to Sails core.  If it is located in a different repo, please send feature requests, patches, and issues there.

#### Authoring a new adapter

Sails adapters translate Waterline query syntax into the lower-level language of the integrated database, and they take the results from the database and map them to the response expected by Waterline, the Sails framework's ORM.  While creating a new adapter should not be taken lightly, in many cases, writing an adapter is not as hard as it sounds (i.e. you usually end up wrapping around an existing NPM package), and it's a great way to get your feet wet with contributing to the ORM hook in Sails, and to the Waterline code base.

Before starting work on a new adapter, just make sure and do a thorough search on npm, Google and Github to check that someone else hasn't already started working on the same thing.  Read more about adapters in the [relevant part of the Sails.js docs](http://sailsjs.org/documentation/concepts/extending-sails/adapters).


#### Contributing to a hook

If the hook is part of core (code base is located in the Sails repo), please follow the general best practices for contributing to Sails core.  If the hook is located in a different repo, please send feature requests, patches, and issues there.  Many core hooks have README.md files with extensive documentation of their purpose, the methods they attach, the events they emit, and any other relevant information about their implementation.

#### Authoring a new hook

Creating a hook is a great way to accomplish _almost anything_ in Sails core.  Before starting work on a new custom hook, just make sure and do a thorough search on npm, Google and Github to make sure someone else hasn't already started working on the same thing.  Read more about custom hooks in the [**Extending Sails** section of the documentation](http://sailsjs.org/documentation/concepts/extending-sails/hooks).


#### Contributing to a generator

If the generator is part of core (code base is located in the Sails repo), please follow the general best practices for contributing to Sails core.  If it is located in a different repo, please send feature requests, patches, and issues there.


#### Authoring a new generator

The custom generator API is not 100% stable yet, but it is settling.  Feel free to start work on a new custom generator, just make sure and do a thorough search on npm, Google and Github to make sure someone else hasn't already started working on the same thing.  A custom generator is a great way to get your feet wet with contributing to the Sails code base.


## VII. Best Practices

There are many undocumented best practices and workflow improvements for developing on Sails that contributors have developed over years.  This section is an attempt to document some of the basics, but be sure and pop in to Gitter if you ever have a question about how to set things up, or want to share your own tool chain.

The best way to work with Sails core is to fork the repository, `git clone` it to your filesystem, and then run `npm link`.  In addition to writing tests, you'll often want to use a sample project as a harness-- to do that, `cd` into the sample app and run `npm link sails`.  This will create a symbolic link in the `node_modules` directory of your sample app that points to your local cloned version of sails.  This keeps you from having to copy the framework over every time you make a change.  You can force your sample app to use the local sails dependency by running `node app` instead of `sails lift` (although `sails lift` **should** use the local dependency, if one exists).  If you need to test the command line tool this way, you can access it from your sample app as `node node_modules/sails/bin/sails`.  For example, if you were working on `sails new`, and you wanted to test it manually, you could run `node node_modules/sails/bin/sails new testProj`.


#### Installing different versions of Sails

| Release               | Install Command          | Build Status      |
|-----------------------|--------------------------|-------------------|
| [stable](https://github.com/balderdashy/sails/tree/stable)                | `npm install sails`      | [![Build Status](https://travis-ci.org/balderdashy/sails.png?branch=stable)](https://travis-ci.org/balderdashy/sails) |
| [beta](https://github.com/balderdashy/sails/tree/beta)                  | `npm install sails@beta` | [![Build Status](https://travis-ci.org/balderdashy/sails.png?branch=beta)](https://travis-ci.org/balderdashy/sails) |
| [edge](https://github.com/balderdashy/sails/tree/master)                  | `npm install sails@git://github.com/balderdashy/sails.git` | [![Build Status](https://travis-ci.org/balderdashy/sails.png?branch=master)](https://travis-ci.org/balderdashy/sails) |



#### Installing an unreleased branch for testing

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


#### Submitting Pull Requests

0. If this is your first time forking and submitting a PR, [follow our instructions here](https://github.com/balderdashy/sails-docs/blob/master/contributing/Sending-Pull-Requests.md).
1. Fork the repo.
2. Add a test for your change. Only refactoring and documentation changes require no new tests. If you are adding functionality or fixing a bug, we need a test!
4. Make the tests pass and make sure you follow [our syntax guidelines](https://github.com/balderdashy/sails/blob/master/.jshintrc).
5. Add a line of what you did to CHANGELOG.md (right under `master`).
6. Push to your fork and submit a pull request to the appropriate branch:
  + [master](https://github.com/balderdashy/sails/tree/master)
    + corresponds with the "edge" version-- the latest, not-yet-released version of Sails. Most pull requests should be sent here
  + [stable](https://github.com/balderdashy/sails/tree/stable)
    + corresponds with the latest stable release on npm (i.e. if you have a high-priority hotfix, send the PR here)





## VIII. Core Maintainers

The Sails.js core maintainers are a small team of individuals located in Austin, TX who are passionate about making it easier for everyone to develop scalable, secure, custom web applications.  We fell in love with Node.js at first sight and are firm believers in the continued, unprecedented dominance of JavaScript as a unifying force for good.  We see Node.js as the logical continuation of the web standards movement into the world of server-side development.

The Sails core team maintains the framework and its related sub-projects, including the Waterline ORM, the Node-Machine project, the Skipper body parser, and all officially-supported generators, adapters, and hooks.  We rely heavily on the help of a network of contributors and users all over the world, but make all final decisions about our releases and roadmap.


#### History

Sails.js was originally developed by [Mike McNeil](http://twitter.com/mikermcneil) with the help of his company [Balderdash](http://balderdash.co), a small development and design studio in Austin, TX.  The first stable version of Sails was released in 2012.  Today, it is still actively maintained by the same core team ([@mikermcneil](https://github.com/mikermcneil), [@particlebanana](https://github.com/particlebanana), [@sgress454](https://github.com/sgress454), [@irlnathan](https://github.com/irlnathan), and [@rachaelshaw](https://github.com/rachaelshaw)), along with the support of many amazing [contributors](https://github.com/balderdashy/sails/network/members).


#### Financial Support

Today, Sails.js is financially supported by [Treeline](http://techcrunch.com/2015/03/11/treeline-wants-to-take-the-coding-out-of-building-a-backend/) (YC W15), a code automation platform built on Sails founded by the Sails.js core team in 2015.  Please feel free to [contact us directly](mailto:mission@treeline.io) with questions about the company, our [team](https://github.com/balderdashy/sails#team), or our mission.



## IX. Contributor's Pledge

By making a contribution to this project, I certify that:

* (a) The contribution was created in whole or in part by me and I
  have the right to submit it under the MIT license; or
* (b) The contribution is based upon previous work that, to the best
  of my knowledge, is covered under an appropriate open source license
  and I have the right under that license to submit that work with
  modifications, whether created in whole or in part by me, under the
  same open source license (unless I am permitted to submit under a
  different license), as indicated in the file; or
* (c) The contribution was provided directly to me by some other
  person who certified (a), (b) or (c) and I have not modified it.

> The certificate of origin above is based on the "[Developer's Certificate of Origin 1.0](https://github.com/nodejs/node/blob/master/CONTRIBUTING.md#developers-certificate-of-origin-10)" used by Node.js core.





## X. Credits

Note that unless otherwise specified, the content in this document is either straight from the hearts of the Sails.js core team, or based on the [Node.js contribution guide](https://github.com/joyent/node/blob/master/CONTRIBUTING.md#contributing).
