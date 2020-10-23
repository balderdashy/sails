# Issue contributions

When opening new issues or commenting on existing issues in any of the repositories in this GitHub organization, please make sure discussions are related to concrete technical issues of the Sails.js software.  Feature requests and ideas are always welcome, but they should not be submitted as GitHub issues.  See [Requesting Features](https://sailsjs.com/documentation/contributing/proposing-features-enhancements) below for submission guidelines.

For general help using Sails, please refer to the [official Sails documentation](https://sailsjs.com/documentation).  For additional help, ask a question on [StackOverflow](http://stackoverflow.com/questions/ask) or refer to any of the [other recommended avenues of support](https://sailsjs.com/support).

If you have found a security vulnerability in Sails or any of its dependencies, _do not report it in a public issue_.  Instead, alert the core maintainers immediately using the instructions detailed in the [Sails Security Policy](https://sailsjs.com/security).  Please observe this request _even for  external dependencies not directly maintained by the core Sails.js team_ (e.g. Socket.io, Express, Node.js, or openssl).  Whether or not you believe the core team can do anything to fix an issue, please follow the instructions in our security policy to privately disclose the vulnerability as quickly as possible.

Finally, discussion of a non-technical nature, including subjects like team membership, trademark, code of conduct, and high-level questions or concerns about the project should be sent directly to the core maintainers by emailing [inquiries@sailsjs.com](inquiries@sailsjs.com).

#### Opening an issue

> Sails is composed of a number of different sub-projects, many of which have their [own dedicated repository](https://sailsjs.com/architecture).  Even so, the best place to submit a suspected issue with a module maintained by the Sails core team is in the main Sails repo.  This helps us stay on top of issues and keep organized.

Before submitting an issue, please follow these simple instructions:

<a name="issue-instructions"></a>

First, search for issues similar to yours in [GitHub search](https://github.com/balderdashy/sails/search?type=Issues) within the main Sails repo.
  - If your original bug report is covered by an existing open issue, then add a comment to that issue instead of opening a new one.
  - If all clearly related issues are closed, then open a new issue and paste links to the URLs of the already closed issue(s) at the bottom.
  - If you cannot find any related issues, try using different search keywords, if appropriate (in case this affects how you search, at the time of this writing, GitHub uses ElasticSearch, which is based on Lucene, to index content).  If you still cannot find any relevant existing issues, then create a new one.
  - Please consider the importance of backlinks.  A contributor responding to your issue will almost always need to search for similar existing issues theirself, so having the URLs all in one place is a huge time-saver.  Also keep in mind that backlinking from new issues causes GitHub to insert a link to the URL of the new issue in referenced original issues automatically.  This is very helpful, since many visitors to our GitHub issues arrive from search engines.

Once you've determined that a new issue should be created,
+ Make sure your new issue does not report multiple unrelated problems.
  - If you are experiencing more than one problem&mdash;and the problems are clearly distinct&mdash;create a separate issue for each one, but start with the most urgent.
  - If you are experiencing multiple related problems (problems that you have only been able to reproduce in tandem), then please create only a single issue. Be sure to describe both problems thoroughly, though, as well as the steps necessary to cause them both to appear.

+ Check that your issue has a concise, on-topic title that uses polite, neutral language to explain the problem as best you can in the available space. The ideal title for your issue is one that communicates the problem at a glance.
  - For example, _"jst.js being removed from layout.ejs on lift"_ is a **very helpful** title for an issue.
  - Here are some **non-examples**&mdash;that is, examples of issue titles which are **not helpful**:
    - _"templates dont work"_ : This title is too vague. Even if more information cannot be gleaned, wording like _"unexpected behavior with templates"_ is a little more specific and would likely generate a quicker response.
    - _"app broken cannot access templates on filesystem because it is broken in the asset pipeline please help"_ : This title is repetative and contains unnecessary content ("_please help_"). Remember that a useful title is both desciptive and concise.
    - _"jst.js is being REMOVED!!!!!!!!!"_: This title contains unnecessary capitalization and punctuation, which is distracting at best, and may be perceived as impolite. In either case, it's unlikely to speed the response to your issue.
    - _"How does this dumb, useless framework remove jst.js from my app?"_: This title contains unnecessary negativity, which doesn't encourage participant review. Try keeping titles as objective as possible for the best possible issue resolution experience.
    - _"Thousands of files being corrupted in our currently deployed production app every time the server crashes."_: Language like this might be perceived as hyperbolic and could lessen the credibility of your claim. In this instance, it may even confuse the issue (e.g. "Is this only happening when NODE_ENV===production?").

+ Before putting together steps to reproduce your issue, normalize as many of the variables on your personal development environment as possible:
  - Make sure you have the right app lifted.
  - Make sure you've killed the Sails server with CTRL+C and started it again.
  - Make sure you do not have any open browser tabs pointed at localhost.
  - Make sure you do not have any other Sails apps running in other terminal windows.
  - Make sure the app you are using to reproduce the issue has a clean `node_modules/` directory, meaning:
    - no dependencies are linked (e.g. you haven't run `npm link foo`)
    - you haven't made any inline changes to files in the `node_modules/` folder
    - you don't have any weird global dependency loops
    The easiest way to double-check any of the above, if you aren't sure, is to run: `rm -rf node_modules && npm cache clear && npm install`.

+ Remember to provide the version of Sails that your app is using (`sails -v`).
  - Note that this could be different than the version of Sails you have globally installed.

+ Provide your currently-installed version of Node.js (`node -v`), your version of NPM (`npm -v`), and the operating system that you are running (OS X, Windows, Ubuntu, etc.)
  - If you are using `nvm` or another Node version manager like `n`, please be sure to mention that in the issue.

+ Provide detailed steps to reproduce the problem from a clean Sails app (i.e. an app created with `sails new` on a computer with no special environment variables or `.sailsrc` files)

+ Finally, take a moment to think about what you are about to post and how it will be interpreted by the rest of the Sails userbase.  Make sure it is aligned with our Code of Conduct, and make sure you are not endangering other Sails users by posting a [security vulnerability](https://sailsjs.com/security) publicly.

Issues which do not meet these guidelines will usually be closed without being read, with a response asking that the submitter review this contribution guide.  If this happens to you, _realize that it's nothing personal_, and that it may even happen again.  Please understand that Sails is a large project that receives hundreds of new issue submissions every month, and that we truly appreciate the time you donate to post detailed issues.  The more familiar you become with the conventions and ground rules laid out in this contribution guide, the more helpful your future contributions will be for the community.  You will also earn the respect of core team members and set a good example for future contributors.

> You might think of these rules as guardrails on a beautiful mountain road: they may not always be pretty, and if you run into them you may get banged up a little bit, but, collectively, they keep us all from sliding off a turn and into the abyss.

<docmeta name="displayName" value="Issue contributions">
