# Security policy

Sails is committed to providing a secure framework, and quickly responding to any suspected security vulnerabilities.  Contributors work carefully to ensure best practices, but we also rely heavily on the community when it comes to discovering, reporting, and remediating security issues.

### Reporting a security issue in Sails

If you believe you've found a security vulnerability in Sails, Waterline, or one of the other modules maintained by the Sails core team, please send an email to **critical at sailsjs dot com**.  In the spirit of [responsible disclosure](https://en.wikipedia.org/wiki/Responsible_disclosure), we ask that you privately report any security vulnerability at that email address, and give us time to patch the issue before publishing the details</em>.

### What is a security vulnerability?

A security vulnerability is any major bug or unintended consequence that could compromise a Sails.js app in production.

For example, an issue where Sails crashes in a development environment when using non-standard Grunt tasks is _not a security vulnerability_.  On the other hand, if it was possible to perform a trivial DoS attack on a Sails cluster running in a production environment and using documented best-practices (a la the [Express/Connect body parser issue](http://expressjs-book.com/index.html%3Fp=140.html)), that _is a security vulnerability_ and we want to know about it.

> Note that this definition includes any such vulnerability that exists due to one of our dependencies.  In this case, an upgrade to a different version of the dependency is not always necessary: for example, when Express 3 deprecated multipart upload support in core, Sails.js dealt with the feature mismatch by implementing a wrapper around the `multiparty` module called [Skipper](https://github.com/balderdashy/skipper#history).

### What should be included in the email?

- The name and NPM version string of the module where you found the security vulnerability (e.g. Sails, Waterline, other core module).
- A summary of the vulnerability
- The code you used when you discovered the vulnerability or a code example of the vulnerability (whichever is shorter).
- Whether you want us to make your involvement public.  If you want such a reference the name and link you wish to be referred (e.g. Jane Doe's link to her GitHub account)

> Please respect the core team's privacy and do not send bugs resulting from undocumented usage, questions, or feature requests to this email address.

### The process
When you report a vulnerability, one of the project members will respond to you within a maximum of 72 hours.  This response will most likely be an acknowledgement that we've received the report and will be investigating it immediately.  Our target patching timeframe for most security vulnerabilities is 14 days.

Based upon the nature of the vulnerability, and the amount of time it would take to fix, we'll either send out a patch that disables the broken feature, provide an estimate of the time it will take to fix, and/or document best practices to follow to avoid production issues.

You can expect follow-up emails outlining the progression of a solution to the vulnerability along with any other questions we may have regarding your experience.

##### When a solution is achieved we do the following:

- notify you
- release a patch on NPM
- coordinate with [Node Security](http://nodesecurity.io) to issue an [advisory](https://nodesecurity.io/advisories?search=sails), crediting you (unless you expressly asked not to be identified)
- publicize the release via our [newsgroup](https://groups.google.com/forum/#!forum/sailsjs)

### Is this an SLA?

No. The Sails framework is available under the [MIT license](https://sailsjs.com/license), which does not include a service level agreement.  However, the core team and contributors care deeply about Sails, and all of us have websites and APIs running on Sails in production.  We will _always_ publish a fix for any serious security vulnerability as soon as possible-- not just out of the kindness of our hearts, but because it could affect our apps (and our customer's apps) too.

> For more support options, see https://sailsjs.com/support.


