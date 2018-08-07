# Sails Changelog

## 1.1.0

> As always, we owe a debt of gratitude to our contributors-- we mentioned you below next to the features/enhancements/fixes you contributed to.  (Apologies to anyone we missed, there was a lot in this release!  Let us know and we'll add you to the list.)
>
> We especially want to thank those contributors who helped out with the documentation:
> - [Rachael Shaw](https://github.com/rachaelshaw)
> - [Mike McNeil](https://github.com/mikermcneil)
> - [Ronny Medina](https://github.com/ronnymedinave)
> - [Alex Schwarz](https://github.com/alexschwarz89)
> - [Xavier Spriet](https://github.com/loginx)
> - [Ian Harris](https://github.com/harrisi)
> - [Vladyslav Piskunov](https://github.com/vpiskunov)
> - [Michael Frederick](https://github.com/mdfrederick)
> - [Mark Strelecky](https://github.com/streleck)
> - [Freddy](https://github.com/mdfrederick)
> - [pavan](https://github.com/pavanmehta91)
> - [Scott Reed](https://github.com/AdJesumPerMariam)
> - [Mario Colque](https://github.com/colkito)
> - [Okoli Lemuel](https://github.com/okolilemuel)
> - [ultimate-tester](https://github.com/ultimate-tester)
> - [@snidell](https://github.com/snidell)
> - [Pika](https://github.com/ThatNerdyPikachu)
> - [AYEDOUN Fiacre](https://github.com/afidosstar)
> - [Tim Wisniewski](https://github.com/timwis)
> - [Tom Saleeba](https://github.com/tomsaleeba)
> - [s-slavchev](https://github.com/s-slavchev)
> - [Daniel Harvey](https://github.com/danielsharvey)
> - [Julien Le Coupanec](https://github.com/LeCoupa)
> - [floriancummings](https://github.com/floriancummings)
> - [Bernardo Gomes](https://github.com/Bernardoow)
> - [Eli Peters](https://github.com/elipeters)
> - [Dennis Cheung](https://github.com/oaksofmamre)
> - [Minh Tri Nguyen](https://github.com/kevinvn1709)
>
> Finally, big thanks to [Dennis Cheung](https://github.com/oaksofmamre) who did the painstaking work of compiling this changelog!
>
>   ~[mike](https://twitter.com/mikermcneil)


#### Framework:
- **New model methods: `.updateOne()`, `.destroyOne()`, and `.archiveOne()`**
- **`exits` argument may now be excluded from your `fn` function in all helpers, actions2 definitions, and shell scripts.**
- **Cleaner usage for `.stream()`,  `.transaction()`, and `.leaseConnection()`.  Functions provided as procedural parameters (i.e. `during` and iteratees) no longer expect a callback to be invoked, as long as you omit their 2nd callabck argument from the function signature.**
- **The bootstrap function (`config/bootstrap.js`) and the `initialize` function of hooks no longer expect a callback to be invoked, as long as the callback argument is excluded from the function signature.**
- **New chainable methods available on helper invocations: `.timeout()` and `.retry()`.**
- Use vuejs VueRouter (and a virtual page example) by default, and make vuejs <router-view> more apparent
- Update helper, action, and hook generators, plus a few other updates to boilerplate output from generators.
- Update boilerplate bootstrap and hook initialize functions.
- Disable 'async' dependency when generated the expanded starter app, to avoid confusion.  (Can always still be installed, it just won't be bundled by default anymore, and auto-globalization is also, of course, disabled.)
- Include FontAwesome 4 files, and update instructions for removal if desired
- Update check for production/staging in vuejs to assume we're in production if no SAILS_LOCALS are present
- Provide documentation tip on how to configure Mongo as default datastore w/ link to tutorial
- Take advantage of next-gen whelk.
- Improve Windows compatibility (for 'sails generate page', sails generate action, etc)
- Exclude 'async' dep by default in all new apps
- Update boilerplate to take advantage of optional 'exits' argument in helpers, actions, and shell scripts.
- Use updated bootstrap for web app template
- Implement Google fonts/typekit/google tag manager/google analytics
- Include (hard-code) Bowser inline now
- Improve <ajax-form> to also include 'is' rule
- Redirect away ALL unrecognized base subdomains (not just webhooks and click), but only do it in staging/production.
- Fix "sails g page" with nested folders on Windows
- Add FileList and FormData to reserved list to protect them from mangling.  (Should be fine anyway, but this protects against potential issues from changing uglify versions.)
- Take advantage of patch in Parasails 0.7.7
- Leverage .updateOne()
- Add 5 second timeout for all four of those calls, to protect user experience from any 3rd party API call issues.  (For context, this is rare, but it happens.  I've noticed Stripe go all 500 on a customer app twice in the last 6 months: once for about 28 minutes earlier this summer, and once last month for a split second.  I've never seen it hang, but this is such a common thing with other 3rd party apis better to be safe than sorry.  An error message after a reasonable wait time is a far better user experience than having to wait 2 whole minutes for the TCP timeout.  And this way, any error handling logic to unroll stuff etc that gets added here will still be able to run.)
- Integrate Cloud SDK into Parasails
- Use top-level implementationSniffingTactic and pass through to whelk and MaA
- Force homogeneous sniffing tactic for helpers+actions.
- Force minimum SVRs (re implementationType: 'classical').
- Finish up support for smarter .bootstrap and .initialize. (Continued from 21bc1f1ab88dfa1064f2e312a4b1135b92763d2a)
- Add faux callbacks for easier debugging
- Add `create` method to datastore fixture, and test "no validation errors" case. [(Scott Gress)](https://github.com/sgress454)
- Fix test descriptions for `update` [(Scott Gress)](https://github.com/sgress454)
- Add test cases for validations on primary key [(Scott Gress)](https://github.com/sgress454)
- Hoist flag for determining whether to apply validation rules, and use it for both PKs and generic attributes. [(Scott Gress)](https://github.com/sgress454)
- Add implementation-sniffing to .stream()
- Setup updateOne() method
- Set up destroyOne() and archiveOne(), and use an omen in the 'found too many' error in findOne() to improve the stack trace.
- Implement implementation sniffing in .transaction() and .leaseConnection().
- Enable ORM to accept attributes named 'length'. Replace `_.each()` with `_.forIn()` to enable ORM to accept attributes named 'length'. [(Daniel Harvey)](https://github.com/danielsharvey)
- Add an isError check when handling errors thrown from validation rules to prevent potential issues in extreme edge cases (where something weird gets thrown)
- Clean up tests for greater clarity and usefulness
- Finish restructuring things to match latest conventions in parley, etc.  Leave standalone/ alias for backwards-compatibility
- Update docs about other adapter methods
- Improve error messaging to assist in debugging
- Add E_TOO_MANY_FILES error code.
- Add Cloud.on() and Cloud.off(), improve error msgs, and remove idempotency guarantee
- Add typeof check to ensure reasonable behavior even with strange input.
- Enhance built-in catchall error msg for Cloud.on()
- Refactor UMD approach to make it easier to see what's going on at a glance.
- Add experimental support for FileList instances (multi-file upload via Cloud SDK).
- Improve performance of +500K ops/sec by collapsing IIFE
- Setup for being able to use AsyncFunctions with .intercept() and .tolerate().
- Add new method: getInvocationinfo() -- a public API for accessing private info such as _timeout. Add .interruptions to getInvocationInfo().
- Introduce working impl of .retry()
- Clone (shallow) metadata on the way in during .retry(), just to avoid any potential edge cases with a fn attaching additional properties and that actually mattering for subsequent invocations with the same arguments.
- Take advantage of new getInvocationInfo() method in parley related to .retry()
- Implement partial support for blended tolerate/intercept with retry (Note: works only for completely parallel error conditions).
- Optimize AsyncFunction function constructor check.
- Allow implementationSniffingTactic to be customized.
- Add failsafe to ensure app lifts inside of Mocha tests. Related to https://github.com/balderdashy/sails/issues/4395 and https://github.com/balderdashy/captains-log/pull/22
- Also in new Sails apps: Force min 3.10.3 of lodash in new projects
- Also in new Sails apps: Update eslintrc templates to tolerate unused args and vars that begin with 'unused' (or are just named 'unused')
- Also in new Sails apps: Add 'custom' validation rule.
- Also in new Sails apps: Replace autofocus with focus-first, and ensure this feature is opt-in for <ajax-form> and <modal>. Also add typeof check for bowser.
- Also in new Sails apps: Tolerate required: false, etc in <ajax-form>
- Also in new Sails apps: Improve error msg in weird edge case
- Also in new Sails apps: Allow completely numeric passwords by default when using 'isHalfwayDecentPassword' validation rule for <ajax-form>
- Also in new Sails apps: Update email templates
- Also in new Sails apps: Add a couple opinionated-yet-reasonable global styles to the 'bootstrap-overrides' file
- Also in new Sails apps: Bump appveyor+travis files to always include Node 10
- Also in new Sails apps: Standardize redis url format to be consistent with site documentation for db (numerical database names only). [Scott Reed](https://github.com/AdJesumPerMariam)
- Also in new Sails apps: Ignore files generated by 'npm link' in recent NPM releases
- Also in new Sails apps: Add note about conditional requiredness and validation rules.
- Also in new Sails apps: Add autocomplete attributes to form fields where applicable
- Also in new Sails apps: Disable lesshint rule for border-boxing everything in bootstrap-overrides
- Also in new Sails apps: Fix mismatched tags in email templates
- Also in new Sails apps: Fix that silly checkbox alignment on login/signup templates
- Also in new Sails apps: Fix camelCasing issue in intermediate subdirectories for newly created view actions.
- Also in new Sails apps: Fix fullName validation on edit profile page [(S.Slavchev)](https://github.com/s-slavchev)
- Also in new Sails apps: Don't include inputs in generated shell script.
- Also in new Sails apps: Make 'semi' and 'curly' lint violations burn yellow instead of burning red
- Also in new Sails apps: Tweak generated comment about 'no lodash'
- Also in new Sails apps: Add note about the function signature of 'leave'
- Also in new Sails apps: Simplify readme links
- Also in new Sails apps: Tweak inline docs for <ajax-form>
- Also in new Sails apps: Bring in self-updating timestamp component for web app template
- Also in new Sails apps: Update model examples
- Also in new Sails apps: Use kebab-cased status to avoid database-dependent behavior in edge cases (b/c case sensitivity)
- Also in new Sails apps: Rename var and kebab-case desired effect strings for consistency
- Also in new Sails apps: Use _.extend for consistency
- Also in new Sails apps: Include moment in eslintrc-override
- Also in new Sails apps: Tweak <js-timestamp>, and then include a demo in the welcome page.
- Also in new Sails apps: Normalize indentation in "send template email" helper
- Also in new Sails apps: Make sure the HTML email contents are actually being logged properly
- Also in new Sails apps: Change method names on welcome page for consistency, and also use `this.modal`, since there can only be one modal on the page at a time anyway
- Also in new Sails apps: Rearrange virtual page example
- Also in new Sails apps: Bring in unsupported browser overlay
- Also in new Sails apps: Change href so it makes more sense
- Also in new Sails apps: Expand comment re virtual pages.
- Also in new Sails apps: Expand comments in js-timestamp a bit.
- Also in new Sails apps: Rearrange note about filtering argins now that handleSubmitting exists.
- Also in new Sails apps: Don't specify testMode when calling out to Mailgun, to avoid confusion.
- Also in new Sails apps: Never indicate that the email was logged instead of sent if it wasn't.
- Also in new Sails apps: Add retries w/ exponentional back-off for idempotent / low-risk 3rd party API calls.
- Also in new Sails apps: Add 'ensureAck' flag to sendTemplateEmail(), and change behavior to background the sending by default.
- Also in new Sails apps: Simplify rebuild-cloud-sdk script a bit.
- Also in new Sails apps: Use for instead of _.each()
- Also in new Sails apps: Fix typo introduced in 22df26e832aeef817a6e3c01561041eda83830cd
- Also in new Sails apps: Tweak verbiage in boilerplate FAQ for clarity. (action not controller)
- Also in new Sails apps: Normalize capitalization in generated footer
- Also in new Sails apps: Include a placeholder logo image for the branding in the masthead
- Also in new Sails apps: On homepage for web app template, add more space between "feature" sections on small screens
- Also in new Sails apps: Use consistent link styles all across the web app template, and also add some special blockquote styles
- Also in new Sails apps: Verbiage tweaks / capitalization normalizaish
- Also in new Sails apps: 'No matter how legal it is, capitalization should never look this ugly.'  -mike, amateur lawyer
- Also in new Sails apps: Add FAQ item with info about placeholders, and give the questions some more breathing room
- Also in new Sails apps: Cleanup and friendlify boilerplate legal documents
- Also in new Sails apps: Provide better example config
- Also in new Sails apps: Tweak constant name to match
- Also in new Sails apps: Fix inconsistent constants
- Also in new Sails apps: Avoid find/replace conflicts with constants. Also, add the link we mention in the FAQ.
- Also in new Sails apps: Correct the boilerplate language
- Also in new Sails apps: Add clarifications to boilerplate stylesheet
- Also in new Sails apps: Remove custom `a:not(.btn)` styles from homepage, because those are set elsewhere now
- Parasails: Tweak varname for clarity.
- Parasails: Rename private method for clarity.
- Parasails: Leave better error sniffability, but rip out attempt to actually use it from 173685357364baaf9e2e2b3c16307c3fa7ec5d44
- Parasails: An additional layer to Cloud.on() and Cloud.off()  (intermediate commit to track concept of wildcard key -- ends up being too confusing for custom error handling, but might be worth revisiting as a kind of lifecycle callback in the future)
- Parasails: Rename "*" catchall handler to "error" and finish implementation
- Parasails: Rename to Cloud.listen() and Cloud.ignore(), add aliases, and improve error msgs.
- Parasails: Intermediate commit: Tracks how we'd approach making .listen() idempotent-- but actually this probably isn't the right granularity to do that (save that for parasails proper on a per-Vue-component basis)
- Parasails: Change .listen() and .ignore() back to .on() and .off(), and remove idempotency guarantee (that'll need to live at the component/Vue instance level in parasails proper -- see also https://github.com/mikermcneil/parasails/commit/36f87501cd174104e6b75a18b7c16d83ec74
edaa and https://github.com/mikermcneil/parasails/commit/b54258a9f244fabbbd3c89e35c7be5095c5d8dfa)
- Parasails: Add back conveniences for multiple bindings.
- Parasails: 'error' => '*'
- Parasails: Add uncaught error handler
- Parasails: Bring in most recent updates
- Parasails: Remove double-binding
- Parasails: Update parasails.js [(Mark Strelecky)](https://github.com/streleck)
- Parasails: Throw error when upload request is no good because it contains structured data as text parameter values.
- Parasails: Add tip about uglify
- Parasails: Follow-up to 4941181912646ec27132afb82c2be32bb3cf6203 to make $.ajax() transport work with FileList instances (on browsers where this is supported).
- Parasails: Fix hard-coded version number in parasails.js file.
- Parasails: Allow sparser shorthand for setting up virtual pages, while also implementing more error-checking and edge-case handling for various configurations of virtualPages, virtualPagesRegExp, and html5HistoryMode.
- Parasails: Improve 'did you mean?' intelligence and add two FUTURE nice-to-haves.
- Force sails-generate@1.15.19
- Fix linting and global var issues for globals tests [(Scott Gress)](https://github.com/sgress454)
- Fix paths to Lodash for globals tests [(Scott Gress)](https://github.com/sgress454)
- Fix lint and global var issues in www test [(Scott Gress)](https://github.com/sgress454)
- Use `tmp` in www tests to attempt to fix Appveyor issues [(Scott Gress)](https://github.com/sgress454)
- Address https://github.com/balderdashy/sails/commit/8168dffb8052c0a2df3de923a18c60dd27875915#diff-78ca47cd74fd541e85ff2100564371ddR656
- Use `tmp` in remaining www test to try and address random Appveyor failures [(Scott Gress)](https://github.com/sgress454)
- Use more accurate verb in secure cookie info msg
- Contextualize the 'yes secure cookies, no trustProxy' debug mesage.
- Clarify message and change it to be verbose
- Closes #4392 (by removing coffee-script, checksum, and istanbul devDependencies)
- Ignore 'npm link' collateral
- Stub implementation opts for helpers re upcoming opt-ins
- Add note about implementationSniffingTactic
- Implicitly set implementationSniffingTactic
- Add bookends about 'customize' for whelk and machine-as-action
- Don't use explicit implementationSniffingTactic yet.
- Bump machine runner SVR and remove unnecessary code
- Note optimization
- Setup for smarter .bootstrap and .initialize
- Correctly apply implementationSniffingTactic for helpers
- Default value for implementationSniffingTactic
- Add note in 'sails run'
- Expand explanations in changelog.
- For compatibility, tolerate action identities that contain '$'.
- Change variable name to prevent confusion with built-in 'module'.
- Follow-up to a22598eb26f108768be91a31f4baa8fc92a9c5c7 which covers the rest of the cases
- Change var name for clarity (same idea as in 2eaaf968daae8f00ebc0007210baa32b5d50f7f0)
- Log warnings if special actions-only props are in use in helper defs.
- Update changelog to reflect what's happening w/ the responses hook
- Bump skipper dep
- Clarify optional-ness of bootstrap callback in comment.
- Update error messages for bootstrap/initialize to reflect new reality.
- 2nd follow up to 97082b8e067a490531758f6bcbc471e08874c209 to allow for "$" in route bindings
- Use prerelease of sails-generate
- Fix sails-generate SVR
- Pin merge-dictionaries
- Fix test now that async is no longer included as a dep. in newly generated sails apps (thanks to await and sails.helpers.flow via organics)
- Fix expectations of test to match correct child process output (follow up to c694f2d2b1db4b9f397c52f540b19d7d4a4125f4)
- Fix one more test related to c694f2d2b1db4b9f397c52f540b19d7d4a4125f4
- Waterline: [PATCH] Fix typo and swap unit test description misplaced in fix #1554 to issue #4360 [(Luis Lobo Borobia)](https://github.com/luislobo)
- Waterline: Add link to drawing demonstrating how Waterline works underneath the hood
- Waterline: Stub out the spots where implementationSniffingTactic needs to apply
- Waterline: Improve error msg when attempting to use a too-generic WHERE clause with updateOne/destroyOne/archiveOne
- Waterline: Don't use skipEncryption for archiveOne() and destroyOne() -- doesn't make sense.
- sails-hook-orm: Add missing comma and link to lifecycle hooks in docs [(Tom Saleeba)](https://github.com/tomsaleeba)
- sails-hook-orm: Update error message about adapter compatibility
- sails-hook-orm: Stub out the spots where implementationSniffingTactic needs to apply
- waterline-utils: Update boilerplate
- waterline-utils: Resolve lint issues
- waterline-utils: Ignore fun new files generated by 'npm link'
- waterline-utils: Add normalize-datastore-config from sails-mongo (needs more love)
- waterline-utils: Set 'protocol' property automatically.
- waterline-utils: Expose .normalizeDatastoreConfig()
- waterline-utils: Change .protocol -> protocolPrefix  (and get rid of trailing colon)
- waterline-utils: Add missing change from prev. commit, and also set .protocolPrefix when appropriate, even if no url was specified.
- waterline-utils: Grab dictionary of models (w/ backwards compatibility)
- waterline-utils: Fix backwards conditional
- anchor: Fix build status urls
- anchor: Bump validator version re https://snyk.io/test/npm/anchor?severity=high&severity=medium&severity=low#npm:validator:20160218 (without applying any of the necessary changes yet, if there are any). Also upgrade to latest eslintrc file, etc, and bump eslint dep.
- anchor: Fix out of date test label
- anchor: Tweak checkConfig error msgs for isBefore+isAfter
- anchor: Clean up checkConfig for isBefore and isAfter, and clarify another comment.
- anchor: Reroll isBefore and isAfter the dumb, explicit way.
- anchor: Added a few more tests.
- anchor: Add validator upgrade
- sails-hook-sockets: Fix typo in function being checked when preparing driver in case of unexpected failure [(Luis Lobo Borobia)](https://github.com/luislobo)
- sails-hook-sockets: Modify deprecation message to recommend install Sails owned socket.io-redis, to match up documentation https://sailsjs.com/documentation/concepts/deployment/scaling [(Luis Lobo Borobia)](https://github.com/luislobo)
- skipper: Update boilerplate.
- skipper: Add eslint dev dep
- skipper: Set up lint script and add docs for quota-related error codes in README
- skipper: Some lint fixes plus remove stringfile and 2 unnecessary deps.
- skipper: sailshq/lodash
- skipper: Improve linter
- skipper: Consolidate roadmap w/ sails core
- skipper: Consolidate contributor info
- skipper: Remove old logger in favor of consistently using 'debug'
- skipper: Documentation
- skipper: Conslidate into lib/ (part 1)
- skipper: Move index.js to lib/skipper.js
- skipper: Remove standalone/ alias
- skipper: Latest SVR for skipper-adapter-tests
- Backport https://github.com/lodash/lodash/commit/d8e069cc3410082e44eb18fcf8e7f3d08ebe1d4a
- Flaverr: Fix bad error message
- Parley: Shorten error message and pull out exec countdown secs into a constant.
- Parley: Tweak verbiage in warning msg one more time for further clarity.
- Parley: Implement .timeout() and initial pass at .retry().
- Parley: Set up more of .retry(), and add relevant TODO about what needs to happen now
- Parley: Avoid 1MM ops/sec perf. loss by using .slice() alternative
- Parley: 200k ops/sec to general-case performance  (and take care of annoying arguments keyword usage)
- Parley: Implement IIFE but prepare for about-face since it takes away 1MM ops/sec
- Parley: Regain 1MM ops/sec by moving IIFE out
- Parley: Cleanup, deduplication, and docs
- Parley: +350K ops/sec
- Parley: Change where bindUserlandAfterExecLC lives, for consistency
- Parley: Rearrange for clarity, and update comments
- Parley: Boilerplate update
- Parley: Setup first pass at async function support for userland afterExec LCs
- Parley: Remove usage assertion now that AsyncFunctions are supported
- Parley: Added _hasStartedButNotFinishedAfterExecLC
- Parley: Eliminate todos now that "one tick" flag takes afterexec LCs into account
- Parley: Rough .retry() impl
- Parley: Rip out retry from parley (realized it needs to live a level higher up in the stack)
- Parley: Remove two now-unused reserved keys from blacklist
- Parley: Update examples
- Parley: Add 'thenable' option for backwards-compatibility for older node releases (specifically important for .tolerate())
- Parley: Fix backwards conditional
- Parley: Revert "3.6.0"
- Parley: Prevent throwing when no afterExec LC handler is specified
- Parley: Don't throw a special error when handler provided to .tolerate() throws -- instead just allow it through unscathed.
- Machine (runner for actions2, helpers, & shell scripts): Upgrade eslint
- Machine: Obey new 'instructionTimeout' meta key
- Machine: Reverse 8af993b01c1480aca45d7e7e2952cfd8d288a293 because all metadata isn't known at build time.  (This will need more shuffling to accomplish)
- Machine: Update boilerplate and bump min parley version.
- Machine: Finish "Too many retries" error, and make note of situation with [Circular]
- Machine: Disable old tests, remove now-irrelevant future note
- Machine: More cleanup, after verifying it works w/ defaultArgins and defaultMeta.
- Machine: Add note explaining why we don't pass in a build-time omen (or any omen) to .retry()'s extra .build() call.
- Machine: Respect original invocation timeout
- Machine: Remove strict idempotency check.
- Machine: Eliminate support for variadic usage (because it's potentially confusing/imprecise -- negotation rules and retry series can BOTH be arrays)
- Machine: Fix an oversight/edge case: an error message would have itself thrown an error.
- Machine: Fix typo in .retry().
- Machine: Setup for implementationSniffingTacticgls
- Machine: Catch attempt to use AsyncFunction in sync:true method at build time instead of waiting until exec-time.
- Machine: Cursory setup of exits arg detection
- Machine: Don't freak out about new customization option
- Machine: Validate implementationSniffingTactic
- Machine: Eliminate old comments, and one trivial optimization
- Machine: Tweak comments and add clarification
- Machine: Handle implementationType: 'classical' for 'exits'-less functions.
- Machine: Skip 'await' tests for Node versions that dont support it.
- Machine: Avoid returning from .catch()  (this is not tied to any known issue, just cleanup)
- Machine: Fix to properly simulate chaining: promise = promise.catch()
- Machine: Swap around 71eb66400f73a52baf0a78a38c1b8d44061737ac so that .then() gets handled first.  Otherwise, you get either an unhandled promise rejection OR a called-it-twice warning.
- whelk (shell scripts): Add note about customizations
- whelk (shell scripts): Add support for new `customize` option
- whelk (shell scripts): Ensure at least machine@15.2.2

#### Documentation:
- Add documentation for new model methods in Sails 1.1.0.
- Sails 1.1.0 updates for .transaction() and .leaseConnection() -- also some follow up from b126f7b66a1c46be0208c2a81235e0584cc50225 for .stream()
- Update examples for .stream() in advance of sails 1.1.0
- Update Blueprint API docs for clarity
- Update Platzi course links
- Update adapterList.md [(Ronny Medina)](https://github.com/ronnymedinave)
- Update policies.md [(Alex Schwarz)](https://github.com/alexschwarz89)
- Update waterline.md
- Update dependencies.md
- Normalize capittalization
- Update upgrading.md
- Update routes.md
- Add link and clarify a bit further
- Update res.status.md
- Updated link [(Simon)](https://github.com/svict4)
- Fix event documentation for `lower` [(Xavier Spriet)](https://github.com/loginx)
- Add note to upgrading guide re: i18n (see https://gitter.im/balderdashy/sails?at=5ac46d9cc574b1aa3e6533f6)
- Fix commented-out code block
- Fix getLocale link
- Update locales.md
- Update req.setLocale.md
- Fix broken links in old 0.12 upgrading guide
- Fix RESTful route examples for `add` and `remove`
- Update content for req.acceptsLanguages()
- Update content for req.acceptsCharsets(), and rename both files
- Clean up req.accepts() reference page.
- Update upgrading guide
- Update logging.md
- Fixed typo in routing actions description [(Scott Reed)](https://github.com/AdJesumPerMariam)
- Fix action name in docs [(Ian Harris)](https://github.com/harrisi)
- Update views.md
- Fixed broken links to req.wantsJSON & req.allParams() [(Vladyslav Piskunov)](https://github.com/vpiskunov)
- Update Lifecyclecallbacks.md
- Update cors.md link from cors.js to security.js [(Michael Frederick)](https://github.com/mdfrederick)
- Update cors.md - Adjusting links and updating examples [(Michael Frederick)](https://github.com/mdfrederick)
- Remove link to guide that doesn't exist anymore (fixes #1000)
- Update faq.md
- Fix some links, and create a page in tutorials linking to the course/demo app
- Create req.hostname [(Mark Strelecky)](https://github.com/streleck)
- Update req.host.md and change to deprecated [(Mark Strelecky)](https://github.com/streleck)
- Update req.isSocket.md [(Mark Strelecky)](https://github.com/streleck)
- Update req.wantsJSON.md [(Mark Strelecky)](https://github.com/streleck)
- Update req.hostname
- Fix docmeta tag
- Update req.isSocket.md
- Update req.wantsJSON.md
- Update res.send.md [(Mark Strelecky)](https://github.com/streleck)
- Add res headers to examples
- Add fragments to cors links. Update another link to use /documentation [(Freddy)](https://github.com/mdfrederick)
- Update low-level-mysql-access.md
- Update mongo.md
- Update cors.md since there's no config/cors.js in 1.0 and the settings are in config/security.js [(pavan)](https://github.com/pavanmehta91)
- Fix broken link [(Scott Reed)](https://github.com/AdJesumPerMariam)
- Add the ) and } forgotten, to close the queries in the right way. [(Mario Colque)](https://github.com/colkito)
- Add hooks + a few tweaks
- Update hooks.md
- Update services.md
- Update sendNativeQuery.md
- Update findOrCreate.md
- Clarify sentence, and add link
- Add file extension
- Update req.host.md
- Update ExampleHelper.md [(Okoli Lemuel)](https://github.com/okolilemuel)
- Update standalone-usage.md to 1.0 [(ultimate-tester)](https://github.com/ultimate-tester)
- Correct syntax typo for log messages [(Alex Schwarz)](https://github.com/alexschwarz89)
- Update Validations.md [(Okoli Lemuel)](https://github.com/okolilemuel)
- Take first pass at e-commerce page
- Remove irrelevant example
- Add note re: customToJSON does not support async functions [(Scott)](https://github.com/snidell)
- Add sails-hook-organics to the Hooks page [(Pika)](https://github.com/ThatNerdyPikachu)
- Fix missing comma [(Scott Reed)](https://github.com/AdJesumPerMariam)
- Waterline initialize function must be async [(Scott Reed)](https://github.com/AdJesumPerMariam)
- Update sails.sockets.md [(AYEDOUN Fiacre)](https://github.com/afidosstar)
- Fix custom model methods example [(Tim Wisniewski)](https://github.com/timwis)
- Add quotes to key in headers example re: dictionary keys [(Tom Saleeba)](https://github.com/tomsaleeba)
- Fix typo in ActionsAndControllers.md [(s-slavchev)](https://github.com/s-slavchev)
- Fix typo in URL link [(Daniel Harvey)](https://github.com/danielsharvey)
- Update GeneratingActions.md to fix typo manging => managing [(Julien Le Coupanec)](https://github.com/LeCoupa)
- Update extending-sails.md to remove remove broken link [(Julien Le Coupanec)](https://github.com/LeCoupa)
- Update Testing.md to add dd Semaphore [(Julien Le Coupanec)](https://github.com/LeCoupa)
- Update To1.0.md [(floriancummings)](https://github.com/floriancummings)
- Add information about optional param. [(Bernardo Gomes)](https://github.com/Bernardoow)
- Update sort.md to fix code example typo [(Eli Peters)](https://github.com/elipeters)
- Update standalone-usage.md
- Add back and correct link
- Update Models.md
- Update To1.0.md
- Edit Sails versioning for consistency (v1.0 and JavaScript) [(Dennis Cheung)](https://github.com/oaksofmamre)
- Update globals.md to fix broken link for Services and Models [(Minh Tri Nguyen)](https://github.com/kevinvn1709)
- Update res.redirect.md [(Julien Le Coupanec)](https://github.com/LeCoupa)
- Update res.status.md [(Julien Le Coupanec)](https://github.com/LeCoupa)
- Add link to info about negotiating errrors
- Update errors.md
- Simplify examples.
- Fix typo in .update() usage example.
- Update sails.config.bootstrap.md
- Update decrypt.md
- Update attributes.md

#### Organics:
- Improve security
- Add note for future about new exit from .saveBillingInfo()
- Update package.json [(Pika)](https://github.com/ThatNerdyPikachu)
- Use `encodeURIComponent` instead of `encoreURI` for `url-friendly` style.
- Replace all special characters and skip encoding entirely. [(Scott Gress)](https://github.com/sgress454)
- Swap open with opn to remove critical error on audit ([Peter Barrett)](https://github.com/Peter-Barrett)
- Pin opn version number and move back to json5 [(Peter Barrett)](https://github.com/Peter-Barrett)
- Remove unused dep

#### Adapters:
- Check `exits` against raw instead of built machine as it seems as though the built machine doesn’t expose the exits  [(Yuki von Kanel)](https://github.com/Rua-Yuki)
- Update debug to fix ReDoS vulnerability [(Alec Fenichel)](https://github.com/fenichelar)
- Remove auto setting JSON to LONGTEXT [(Betanu701)](https://github.com/Betanu701)
- sails-disk: Update eslint
- sails-disk: Don't test node 0.10 and 0.12 because eslint doesn't even run on them anymore
- MySQL: Pin debug version [(Alec Fenichel)](https://github.com/fenichelar)
- MySQL: machine@15 adjustment
- MySQL: Follow up to d41eb10e1804ccc884cf6e290fd5a340f8f12c0b
- MySQL: Test on Node 10
- MySQL: eslint for tests
- MySQL: Use the right port
- MySQL: Get rid of ajv keywords dev install warning and clean up machine SVR
- MySQL: Update skipped test
- MySQL: Rename test files for easier quick-switching and add back linting for tests
- MySQL: Move the files (still need to update require paths-- see next commit)
- MySQL: Fix require paths (follow up to d9db8cda4fcd9ffb37b738402d855991991c892b)
- MySQL: Update travis.yml and remove Dockerfile
- MySQL: Normalize the license stuff
- MySQL: Fix those badge things
- PostgreSQL: Correctly raises error when you have bad model attributes [(Tony Buser)](https://github.com/tbuser)
- PostgreSQL: Allow for other auto increment scenarios other than numeric [(Andrew Greenstreet)](https://github.com/gstreetmedia)
- PostgreSQL: Single quotes (eslint) and a couple of other minor adjustments to comments and varnames
- PostgreSQL: Improve linter
- PostgreSQL: Change it's => its
- PostgreSQL: Fix failing test (https://travis-ci.org/balderdashy/sails-postgresql/jobs/368925613).  This is because https://github.com/balderdashy/sails-postgresql/pull/278 actually breaks normal usage (because logical types are not made accessible to the adapter in the per-table DDL spec passed into the define() adapter method- instead, another approach must be used)
- PostgreSQL: Update node versions tested to include all LTS releases
- PostgreSQL: Improve error message
- PostgreSQL: Adjust tests to stop using 'integer' columnType for auto-incrementing pk
- PostgreSQL: Close https://github.com/balderdashy/sails-postgresql/pull/279
- PostgreSQL: Include additional number type property to model. This will cause the registerDatastore method to throw an error due to autoMigrations being undefined for anotherGood property on the model. [(Andrew Salib)](https://github.com/andezzat)
- PostgreSQL: Check that property autoMigrations exists before checking its child property columnType resolving undefined errors [(Andrew Salib)](https://github.com/andezzat)
- MongoDB: Upgrade 'machine' dependency to ^15.0.0 [(Yuki von Kanel)](https://github.com/Rua-Yuki)
- MongoDB: Use `.switch(...)` where needed [(Yuki von Kanel)](https://github.com/Rua-Yuki)
- MongoDB: Allow tests to run on PRs (hopefully) - see https://docs.travis-ci.com/user/environment-variables/
- MongoDB: Bump devdep SVRs

#### Tools:
- sails-hook-dev: Recommend simple solution to setting up staging environment in readme.md

#### Raw diffs:

##### Framework:
- https://github.com/balderdashy/sails-generate/compare/master@%7B2018-03-29%7D...master
- https://github.com/balderdashy/sails/compare/master@%7B2018-03-29%7D...master
- https://github.com/balderdashy/waterline/compare/master@%7B2018-03-29%7D...master
- https://github.com/balderdashy/sails-hook-orm/compare/master@%7B2018-03-29%7D...master
- https://github.com/sailshq/waterline-utils/compare/master@%7B2018-03-29%7D...master
- https://github.com/balderdashy/waterline-schema/compare/master@%7B2018-03-29%7D...master
- https://github.com/sailshq/anchor/compare/master@%7B2018-03-29%7D...master
- https://github.com/balderdashy/sails-hook-sockets/compare/master@%7B2018-03-29%7D...master
- https://github.com/balderdashy/sails.io.js/compare/master@%7B2018-03-29%7D...master
- https://github.com/mikermcneil/socket.io-redis/compare/master@%7B2018-03-29%7D...master
- https://github.com/balderdashy/skipper/compare/master@%7B2018-03-29%7D...master
- https://github.com/rachaelshaw/sails-hook-uploads/compare/master@%7B2018-03-29%7D...master
- https://github.com/sailshq/sails-hook-grunt/compare/master@%7B2018-03-29%7D...master
- https://github.com/sailshq/lodash/compare/master@%7B2018-03-29%7D...master
- https://github.com/mikermcneil/connect-redis/compare/master@%7B2018-03-29%7D...master
- https://github.com/mikermcneil/flaverr/compare/master@%7B2018-03-29%7D...master
- https://github.com/mikermcneil/parley/compare/master@%7B2018-03-29%7D...master
- https://github.com/node-machine/machine/compare/master@%7B2018-03-29%7D...master
- https://github.com/node-machine/rttc/compare/master@%7B2018-03-29%7D...master
- https://github.com/sailshq/whelk/compare/master@%7B2018-03-29%7D...master
- https://github.com/sailshq/whelk/compare/master@%7B2018-03-29%7D...master
- https://github.com/balderdashy/captains-log/compare/master@%7B2018-03-29%7D...master
- https://github.com/mikermcneil/reportback/compare/master@%7B2018-03-29%7D...master
- https://github.com/balderdashy/include-all/compare/master@%7B2018-03-29%7D...master
- https://github.com/sailshq/machinepack-redis/compare/master@%7B2018-03-29%7D...master
- https://github.com/sailshq/sort-route-addresses/compare/master@%7B2018-03-29%7D...master
- https://github.com/balderdashy/sails-stringfile/compare/master@%7B2018-03-29%7D...master

##### Documentation:
- https://github.com/balderdashy/sails-docs/compare/master@%7B2018-03-29%7D...master

##### Organics:
- https://github.com/mikermcneil/parasails/compare/master@%7B2018-03-29%7D...master
- https://github.com/sailshq/sails-hook-organics/compare/master@%7B2018-03-29%7D...master
- https://github.com/mikermcneil/machinepack-http/compare/master@%7B2018-03-29%7D...master
- https://github.com/sailshq/machinepack-strings/compare/master@%7B2018-03-29%7D...master
- https://github.com/mikermcneil/machinepack-fs/compare/master@%7B2018-03-29%7D...master
- https://github.com/sailshq/machinepack-process/compare/master@%7B2018-03-29%7D...master

##### Adapters:
- https://github.com/balderdashy/sails-disk/compare/master@%7B2018-03-29%7D...master
- https://github.com/balderdashy/sails-mysql/compare/master@%7B2018-03-29%7D...master
- https://github.com/sailshq/machinepack-mysql/compare/master@%7B2018-03-29%7D...master
- https://github.com/sailshq/waterline-sql-builder/compare/master@%7B2018-03-29%7D...master
- https://github.com/balderdashy/sails-postgresql/compare/master@%7B2018-03-29%7D...master
- https://github.com/sailshq/machinepack-postgresql/compare/master@%7B2018-03-29%7D...master
- https://github.com/balderdashy/sails-mongo/compare/master@%7B2018-03-29%7D...master
- https://github.com/balderdashy/sails-redis/compare/master@%7B2018-03-29%7D...master
- https://github.com/balderdashy/skipper-disk/compare/master@%7B2018-03-29%7D...master
- https://github.com/balderdashy/skipper-s3/compare/master@%7B2018-03-29%7D...master

##### Tools:
- https://github.com/mikermcneil/sails-hook-apianalytics/compare/master@%7B2018-03-29%7D...master
- https://github.com/balderdashy/sails-hook-dev/compare/master@%7B2018-03-29%7D...master
- https://github.com/mikermcneil/eslint/compare/master@%7B2018-03-29%7D...master
- https://github.com/mikermcneil/htmlhint/compare/master@%7B2018-03-29%7D...master
- https://github.com/mikermcneil/lesshint/compare/master@%7B2018-03-29%7D...master



## 1.0.0

Sails v1.0 comes with a host of new features and improvements as well as some breaking changes to previous versions.  Please see the [migration guide](http://sailsjs.com/upgrading) if you're upgrading from a previous version of Sails!

* [ENHANCEMENT] Introduce Actions 2 -- ability to declare actions as [Machines](http://node-machine.org) in individual files.  See the [Actions and controllers](http://sailsjs.com/documentation/concepts/actions-and-controllers) and [Action target syntax](http://sailsjs.com/documentation/concepts/routes/custom-routes#?action-target-syntax) docs for more info.
* [ENHANCEMENT] Introduce Helpers -- the successor to services.  See the [Helpers](http://sailsjs.com/documentation/concepts/helpers) docs for more info.
* [BUGFIX] Improve path resolution in moduleloader for Windows [f13bb77](https://github.com/balderdashy/sails/commit/f13bb77eb49b9b61aa225c43cc2aacaadd4f07be)
* [BUGFIX] Fix output for virtual requests that have non 2xx/3xx status codes and no body [525c7c5](https://github.com/balderdashy/sails/commit/525c7c503347ef586ebf26730af77e2aa8626060)
* [REMOVAL] Remove support for (undocumented) "action/model" route syntax for binding routes to blueprint actions
* [BUGFIX] Fix issue causing Sails to sometimes crash when using Redis sessions if it receives a request after the Redis server has unexpectedly disconnected [3f29dce](https://github.com/balderdashy/sails/commit/3f29dce22b5a36403108d8d1aab7a903aa4488a5)
* [ENHANCEMENT] Add `sails.getActions()` method to return a dictionary of registered Sails actions [5598179](https://github.com/balderdashy/sails/commit/55981792ea52febfa5c343bbae4517c6a38f20c9)
* [ENHANCEMENT] Add `sails.registerAction()` method to programmatically register a Sails action [dd9af88](https://github.com/balderdashy/sails/commit/dd9af88b114db696dde2fbeee79a1dc745f2d748)
* [ENHANCEMENT] Add `exposeLocalsToBrowser` local in all views
* [ENHANCEMENT] Add `sails.registerActionMiddleware()` to programmatically register middleware to be applied to one or more actions [2c281d5](https://github.com/balderdashy/sails/commit/2c281d51301e684f00c91da5cc9d8fa37814094c)
* [ENHANCEMENT] Allow explicitly defined actions in Sails config via `sails.config.controllers.moduleDefinitions` [3b264fa](https://github.com/balderdashy/sails/commit/3b264facc2e0a72bd2aa5366271c588c903e6f5c), [4ad23dd](https://github.com/balderdashy/sails/commit/4ad23dd353ff1d7e607c0a75377a0ba6d9dd2f3d)
* [BUGFIX] Default `req.options.populate` to the value of `sails.config.blueprints.populate [d8f4df8](https://github.com/balderdashy/sails/commit/d8f4df8e19cfb7eaefa00bbcbbc6cab870483194)
* [ENHANCEMENT] Add `sails.reloadActions()` method to reload actions from disk / config while an app is running [df2ee46](https://github.com/balderdashy/sails/commit/df2ee4657774a092fb0bd25b3013448c9f155700)
* [ENHANCEMENT] Allow loaded modules (actions, controllers, policies, models, etc.) to have _any_ file extension besides `.md` and `.txt` (which are ignored).  Direct support for anything besides plain Javascript has been removed; variants like CoffeeScript and TypeScript can be used by registering them in the `app.js` file.  See the [Using CoffeeScript tutorial](http://sailsjs.com/documentation/tutorials/using-coffee-script) for an example.
* [REMOVAL] Remove support for custom blueprints.  These can easily be replaced by regular actions.  See the [migration guide](http://sailsjs.com/upgrading#custom-blueprints) for more info. [0fd4362](https://github.com/balderdashy/sails/commit/0fd4362795ee338ea5b18c3ee42dbdae4b08fd43)
* [REMOVAL] Remove support for blueprint route target syntax [0fd4362](https://github.com/balderdashy/sails/commit/0fd4362795ee338ea5b18c3ee42dbdae4b08fd43)
* [REMOVAL] Remove deprecated `dontFlattenConfig` option [56c9b5b](https://github.com/balderdashy/sails/commit/56c9b5bc4b4f876778653a3995981516bb0767a7)
* [ENHANCEMENT] Humanize config vars that are loaded from the environment [7eb6af6](https://github.com/balderdashy/sails/commit/7eb6af659b67eb856719c8c0d08c7e7043c9e3e8)
* [REMOVAL] Remove most Resourceful PubSub methods, leaving just `.subscribe()`, `.unsubscribe()` and `.publish()`. [c981c6e](https://github.com/balderdashy/sails/commit/c981c6edf8573fea0d3a13451d51292ba9038b3b)
* [ENHANCEMENT] Expose Sails generator for programmatic use [e008a6b](https://github.com/balderdashy/sails/commit/e008a6b7e76cf0c272ec556f0ab48b67499269f5)
* [UPGRADE] Upgrade to Express 4.14.0.  Thanks to [josebaseba](https://github.com/josebaseba) for his help in the transition to Express 4!
* [ENHANCEMENT] Improved CORS support.  See the [migration guide](http://sailsjs.com/upgrading#security) and [CORS docs](http://sailsjs.com/documentation/concepts/security/cors) for more info.
* [REMOVAL] Removed `req.validate()` functionality.  Use Actions 2 instead, which automatically validate parameters. [68fa8ff](https://github.com/balderdashy/sails/commit/68fa8ff0327530973237dfd602b3155e0386cad5)
* [ENHANCEMENT] Updated syntax for policies.  See the [migration guide](http://sailsjs.com/upgrading#policies) and the [policies documentation](http://sailsjs.com/documentation/concepts/policies) for more details. [66d2b2d](https://github.com/balderdashy/sails/commit/66d2b2d8d9d7f23b35cad7693eab79a58e888d77)
* [ENHANCEMENT] Automatically sort routes to avoid wildcards swallowing static routes.  See the [sort-route-addresses](https://github.com/treelinehq/sort-route-addresses) module for more info on route sorting.
* [ENHANCEMENT] Combine CORS and CSRF hooks into new "Security" hook.  See the [migration guide](http://sailsjs.com/upgrading#security) for more details.
* [ENHANCEMENT] Update CSRF configuration and replace `/csrfToken` route with an action that can be bound to any route.  See the [migration guide](http://sailsjs.com/upgrading#security) and [CSRF docs](http://sailsjs.com/documentation/concepts/security/csrf) for more info. [7328c05](https://github.com/balderdashy/sails/commit/7328c0527de4d6ae7bfd48f0c6959ff90c7e3d30)
* [REMOVAL] `res.created()` will no longer be included by default. [7988866](https://github.com/balderdashy/sails/commit/7988866f68f3cb9926d750265acf1fa9e1cb25c6)
* [BUGFIX] Ignore default installed hooks when searching `node_modules` for hooks.  [#3855](https://github.com/balderdashy/sails/issues/3855).
* [SECURITY] Don't serve CSRF token via websockets [50b0684](https://github.com/balderdashy/sails/commit/50b06845a0075f4a45f5e2b5d66c05ea3ed62c4b)
* [INTERNAL] Bring EJS layout code into Sails rather than relying on the unmaintained `ejs-locals` package [d3ba9bd](https://github.com/balderdashy/sails/commit/d3ba9bdd3c7301b6ac438d2b4591c74c40e2b06c)
* [REMOVAL] Remove handlebars dependency and support for layouts in view engines other than EJS. See the [migration guide](http://sailsjs.com/upgrading#layouts) for more details. [ae7e656](https://github.com/balderdashy/sails/commit/ae7e656cf815480d135a8d124db6c3269bad1b92), [9f1f2fb](https://github.com/balderdashy/sails/commit/9f1f2fb91b69a8f6a6e29e9a171a981e7a109f51)
* [ENHANCEMENT] Don't set NODE_ENV based on Sails environment, except in special circumstances. See the [migration guide](http://sailsjs.com/upgrading#node-env) for more details. [cf20d07](https://github.com/balderdashy/sails/commit/cf20d070700230f73b158bd37fb7109739f16519), [abbf1f7](https://github.com/balderdashy/sails/commit/abbf1f724f4b45176d9c8cd46db1a94bef7c37f9)
* [ENHANCEMENT] Make session hook `routesDisabled` use Sails route address syntax (including regular expression syntax) [aba8f2f](https://github.com/balderdashy/sails/commit/aba8f2fe9856e43168b423d813e17f1b3067746a)
* [BUGFIX] Supply `res.locals._csrf` to _all_ routes when CSRF protection is enabled.  Fixes [#3865](https://github.com/balderdashy/sails/issues/3865)
* [REMOVAL] Remove Consolidate dependency -- view template engines are now configurable via the `sails.config.views.getRenderFn` setting.  See the [migration guide](http://sailsjs.com/upgrading#views) for more details. [6316452](https://github.com/balderdashy/sails/commit/63164527b2e0b7c268488539aa3a0e011ff332f9)
* [REMOVAL] Remove deprecated RPS "firehose" [86b88](https://github.com/balderdashy/sails/commit/86b8884f15b647ebc963cadff8502f2449ce04a2)
* [REMOVAL] Remove deprecated 0.9.x socket support [6464d8f](https://github.com/balderdashy/sails/commit/6464d8f89bd74aaaed380cee15143e6ad0aad614)
* [BUGFIX] Update and standardize precedence of route param, query and body in `req.param()` and `req.allParams()` [820d1eb](https://github.com/balderdashy/sails/commit/820d1eb53e12774cd644f516d5952c8da8f02da8)
* [REMOVAL] Remove JSONP support from blueprints.  CORS is fairly ubiquitous now. [effd6c3](https://github.com/balderdashy/sails/commit/effd6c315f2ef9fe55cf5dafdf65b59b8c5cbe1e)
* [REMOVAL] Remove deprecated `sails.getBaseUrl` method. [d0fe4ff](https://github.com/balderdashy/sails/commit/d0fe4ff169ae9e01a799d4fd32da45700daba21e)
* [INTERNAL] Remove `sails-util` [1fee468](https://github.com/balderdashy/sails/commit/1fee468bacf98b847d2455d3c40f92bae8b33233)
* [INTERNAL] Remove grunt, sockets and ORM hooks [48750d7](https://github.com/balderdashy/sails/commit/48750d7010218bcb224623c532474430063dbdb3), [07c59ce](https://github.com/balderdashy/sails/commit/07c59ceaccf3e5a7258962b01f9eaae03fd888d9)
* [REMOVAL] Remove deprecated `req.params.all()` method [9c6b217](https://github.com/balderdashy/sails/commit/9c6b21773b07ab816fea28f67d3e614e5eb2210b)
* [BUGFIX] Correctly load custom adapters (stored in either `FooAdapter.js` files or in subfolders) [#3884](https://github.com/balderdashy/sails/issues/3884)
* [INTERNAL] Add benchmarks [6b4ba32](https://github.com/balderdashy/sails/commit/6b4ba32d1d5219976be81fe7a5bf57a38635d681)
* [ENHANCEMENT] Requests for assets will skip running session middleware by default [3c5ddf7](https://github.com/balderdashy/sails/commit/3c5ddf719e78acbe66d0896b9d0d013d9e02279b)
* [ENHANCEMENT] Support `routesDisabled` for sessions in virtual requests [a00cf78](https://github.com/balderdashy/sails/commit/a00cf78895836f3ab982fab00c52fdcb668c4eef)
* [INTERNAL] Standardize log level for warnings to always use "debug" except for warning related to security.
* [ENHANCEMENT] Add 404, 500 and `startRequestTimer` to middleware order automatically (and remove them from default sails.config.http.middleware.order) [a22e4e7](https://github.com/balderdashy/sails/commit/a22e4e730f42e9868f604bc62eaf9dcc4d2abd6b), [f788e39](https://github.com/balderdashy/sails/commit/f788e3956cf2daf521dbe36fdb8d64a2a8dbb5c8)
* [REMOVAL] Remove the `handleBodyParserError` middleware from the stack, use the `onBodyParserError` option in Skipper instead.  [f788e39](https://github.com/balderdashy/sails/commit/f788e3956cf2daf521dbe36fdb8d64a2a8dbb5c8)
* [BUGFIX] Take locale into account in views.render() [#3833](https://github.com/balderdashy/sails/issues/3833)
* [ENHANCEMENT] Allow session adapter to be required directly [039d245](https://github.com/balderdashy/sails/commit/039d24580f55c4e03f187de87339f88dd31afbc6)
* [REMOVAL] Remove support for Express 3 session adapters [628a55b](https://github.com/balderdashy/sails/commit/628a55b687ed95adc7b6f7667023ddb96bd939fd)
* [INTERNAL] Switch from i18n to i18n-2. See the [migration guide](http://sailsjs.com/upgrading#i18n) for more details. [4a90de2](https://github.com/balderdashy/sails/commit/4a90de293883545fb0418851826fa84c5331dad9)
* [BUGFIX] Fail to lift Sails if `connect-redis` can't initialize. [#3590](https://github.com/balderdashy/sails/issues/3590)
* [REMOVAL] Remove `method-override` from default middleware list. [575c4a3](https://github.com/balderdashy/sails/commit/575c4a37613992af92a3e40338fe5b470ec2531b)
* [BUGFIX] Use _.clone() instead of _.cloneDeep() for config overrides, to preserve things like Redis clients passed into config. [1b970b6](https://github.com/balderdashy/sails/commit/1b970b6c445659a731967550ec6132c582613bea)
* [ENHANCEMENT] Update `sails.config.globals` functionality.  See the [migration guide](http://sailsjs.com/upgrading#globals) for more details. [44c6d9b](https://github.com/balderdashy/sails/commit/44c6d9b41e1b1ffd38150788085890c8c2cbe286)
* [ENHANCEMENT] Add `sails.config.session.onDisconnect` and `sails.config.session.onReconnect` functions [1e55c63](https://github.com/balderdashy/sails/commit/1e55c639b617e13199db7ee4c3a17f62db87b8ea)
* [ENHANCEMENT] Add `sails.config.sockets.adapterOptions.onDisconnect` and `sails.config.sockets.adapterOptions.onReconnect` functions [3a25971](https://github.com/balderdashy/sails-hook-sockets/commit/3a2597155eefa086bba54b70b1f3274aaa97a1f5)
* [DEPRECATION] Deprecate `.jsonx()` [cdcc3c0](https://github.com/balderdashy/sails/commit/cdcc3c09ad864329474ae50b5888571cd6dc2654)
* [INTERNAL] Update default responses [510504e](https://github.com/balderdashy/sails/commit/510504e210047a2ae8aced98a3a17ced5b499140)
* [REMOVAL] Remove update-via-POST blueprint route [5c3814d](https://github.com/balderdashy/sails/commit/5c3814d0162535d8f5b9e907ed9a25aa263c2eff)
* [INTERNAL] Disconnect Redis session client when Sails is lowering [80fb71b](https://github.com/balderdashy/sails/commit/80fb71b45fa7dab94f4c6054b6d365a9319150f7)
* [UPGRADE] Upgrade EJS dependency to v2.5.3 [6bfad70](https://github.com/balderdashy/sails/commit/6bfad700445038533486affb1637b52b73ed2eac)
* [REMOVAL] Removed deprecated `connect-flash` middleware [c5c4900](https://github.com/balderdashy/sails/commit/c5c49007f9d55ed74b3ca3062b465c470a15e82b)
* [REMOVAL] Removed 16 unused dependencies (see full list [here](https://gist.github.com/sgress454/4a4930fec3520b24bdf0df552f70a45c))



> Also see the [Waterline changelog](https://github.com/balderdashy/waterline/blob/a7cad817e831af5367be2d2c89c021d12a674b86/CHANGELOG.md#edge).



## 0.12.11

* [BUGFIX] fix typo in error message (see https://github.com/balderdashy/sails/pull/3902)  Thanks [Johnny](https://github.com/Hiro-Nakamura) and [@appdevdesigns](https://github.com/appdevdesigns)!
* [BUGFIX] backport fix for `_.isFunction()` from Lodash 4 (see https://github.com/lodash/lodash/issues/2768 and https://github.com/balderdashy/sails/issues/3863)  Thanks [@adnan-kamili](https://github.com/adnan-kamili) and [@jdalton](https://github.com/jdalton)!
* [INTERNAL] rebase changelog updates from master [223567c](https://github.com/balderdashy/sails/commit/223567cf986dd62317d958cb29a6683a4cf1e140)


## 0.12.10

* [BUGFIX] Fix issue where incorrect file size was computed for incoming (multi-)file uploads on skipper-disk and skipper-s3 [#3847](https://github.com/balderdashy/sails/issues/3847)  (thanks [@crobinson42](https://github.com/crobinson42), [@NAlexandrov](https://github.com/NAlexandrov) and [@vbogdanov](https://github.com/vbogdanov)!)  See also https://github.com/balderdashy/skipper/issues/109.
* [BUGFIX] Internationalization fix ([#3833](https://github.com/balderdashy/sails/issues/3833) fixes [#3889](https://github.com/balderdashy/sails/pull/3889) (thanks [@josebaseba](https://github.com/Josebaseba)!)
* [INTERNAL] Added automated request latency benchmarks -- primarily in advance of 1.0 for the purpose of comparison (thanks [@sgress454](http://github.com/sgress454)!)
* [BUGFIX] Fixed issue with defined-in-app adapters being improperly loaded [#3884](https://github.com/balderdashy/sails/issues/3884) (thanks [@richdunajewski](https://github.com/richdunajewski)!)

## 0.12.9

* [INTERNAL] Fix deprecation warning from express-session [3872](https://github.com/balderdashy/sails/issues/3872)  (thanks [@Boycce](https://github.com/Boycce) and [@dougwilson](https://github.com/dougwilson)!)

## 0.12.8

* [BUGFIX] Fix issue with multiple config files that have the same filename [3850](https://github.com/balderdashy/sails/issues/3850)
* [ENHANCEMENT] Add criteria validation for the `find` and `findOne` blueprint actions. [ab9c2c3...c6e8ad0](https://github.com/balderdashy/sails/compare/ab9c2c3431a5298e8fd140e5c1e2ed2c7260526c...c6e8ad0940e1034222b958b97e8f28287fae32b6)
* [INTERNAL] Fix Gitter link in README so it displays properly on NPM [284c660](https://github.com/balderdashy/sails/commit/284c66008632d906524b2238447a0b79715855e7)

## 0.12.7

* [BUGFIX] Fix issue with multiple config files that have the same filename [3846](https://github.com/balderdashy/sails/issues/3846)
* [ENHANCEMENT] Warn about overly permissive CORS settings when lifting in production [ca43e05](https://github.com/balderdashy/sails/commit/ca43e0507af79f15361789a3489013b01c8e1825)

## 0.12.6

* [BUGFIX] Revert inadvertent breaking change to CORS config in 0.12.5, see [f80252f](https://github.com/balderdashy/sails/commit/f80252f66edc0bf00cf6ed317d9a3e68b4e8d948) for details)

## 0.12.5

* [INTERNAL] Upgrade version of `include-all` to ^1.0.0 [f6e8d32](https://github.com/balderdashy/sails/commit/f6e8d3243d7d695983a3816e6cf7c43ca4237948)
* [ENHANCEMENT] Add experimental `sails console --dontLift` option [029fe06](https://github.com/balderdashy/sails/commit/029fe0683ea4f01a962b91381b948136f5c18f63)
* [UPGRADE] Dependencies in captains-log
* [UPGRADE] Moduleloader now uses include-all@1, and sails-build-dictionary is deprecated (all of its methods were folded into include-all)
* [BUGFIX] In moduleloader: Improve path resolution on windows
* [BUGFIX] Fix property name for ('status' => 'statusCode') in virtual request header


## 0.12.4

* [INTERNAL] Upgrade Mocha to 3.0.0 to remove more of the deprecation notices when installing dependencies (see [mocha:#2200](https://github.com/mochajs/mocha/issues/2200))
* [INTERNAL] Simplify config-merging code in captains-log.  This also gets rid of more deprecation notices during install (see [captains-log:49f433eff348c05115a2caf292b4da0db9499887](https://github.com/balderdashy/captains-log/commit/49f433eff348c05115a2caf292b4da0db9499887))
* [BUGFIX] Fix long-standing, low-priority (but super annoying) issue with logged dictionaries/arrays getting extra quote marks (due to a pecularity in the usage of util.format()) [d67e9c8e6775](https://github.com/balderdashy/captains-log/commit/d67e9c8e67759e8dda3a2d664c3607e9127d209c)
* [ENHANCEMENT] Add `sails.config.session.routesDisabled` config option to specify routes that should not use session middleware [c712acf](https://github.com/balderdashy/sails/commit/c712acf29de257d438b422b2c47e67a4d5126ddc)
* [ENHANCEMENT] Use `res.forbidden()` when denying access to a route via a policy.  Thanks [@wulfsolter](https://github.com/wulfsolter)!  [3764](https://github.com/balderdashy/sails/pull/3764)
* [ENHANCEMENT] Allow use of Express style path and RegExp in `sails.config.csrf.routesDisabled`.  Thanks [@bolasblack](https://github.com/bolasblack)!
* [BUGFIX] Fix for query / body params called `length` [3738](https://github.com/balderdashy/sails/issues/3738)
* [BUGFIX] Fix view rendering when i18n hook is disabled.  Thanks [@mordred](https://github.com/Mordred)! [3741](https://github.com/balderdashy/sails/pull/3741)
* [BUGFIX] Allow `sails.renderView` to work with globals turned off [3753](https://github.com/balderdashy/sails/issues/3753)
[d3f634c](https://github.com/balderdashy/sails/commit/d3f634c9ac0c5e2172710fe27ab3f61f8303d840)
* [BUGFIX] Fix typo which could cause crashing when attempting to serialize non-json-compatible output in the response to a socket request.
* [UPGRADE] Update all Grunt dependencies [5f6be05](https://github.com/balderdashy/sails/commit/5f6be059823aeb235ef3b4cf53a8d40a341c5873)
* [UPGRADE] Update "connect" dependency to 3.4.1 [1d3c9e6](https://github.com/balderdashy/sails/commit/1d3c9e6459253261e0f763d133c559641bcbfa33)
* [UPGRADE] Update "compression" dependency to version 1.6.2
* [UPGRADE] Upgraded version of Consolidate to `0.14.1` [a70623c](https://github.com/balderdashy/sails/commit/a70623ce2809d497b3581268354f06904d862268)
* [UPGRADE] Upgraded version of grunt-contrib-watch to `1.0.0` [3678](https://github.com/balderdashy/sails/issues/3678)
* [INTERNAL] Use standalone CSRF package instead of using the one (formerly) bundled with Connect.  Sails should be using all standalone middleware now. [1d3c9e6](https://github.com/balderdashy/sails/commit/1d3c9e6459253261e0f763d133c559641bcbfa33)
[98861ef](https://github.com/balderdashy/sails/commit/98861ef12ddca0ff6d57cf7ea6d4bb9f8bca9656)
* [INTERNAL] Add some assertions to ensure custom hooks don't use reserved properties [2e76dac](https://github.com/balderdashy/sails/commit/2e76dac2f961a1f20c591fb0a5d7ea6556d2ab70)
* [INTERNAL] Update code that virtual response uses to read buffer to work with all Node versions [a5ab134](https://github.com/balderdashy/sails/commit/a5ab134c4bafa40db6b2b2133145f8a5462e4abc)
* [INTERNAL] Remove un-maintained "wrench" module from tests; use "fs-extra" instead.  Thanks [@Ignigena](https://github.com/Ignigena)! [4f90f78](https://github.com/balderdashy/sails/commit/4f90f78fbfb1b2edf088c5e57d5e4cab56e3cf47)

## 0.12.3

* [BUGFIX] Allow `skipAssets` and `skipRegex` to be used with direct/static view route target syntax [3682](https://github.com/balderdashy/sails/issues/3682).  Thanks [@dottodot](https://github.com/dottodot), [@nikhilbedi](https://github.com/nikhilbedi), and [@AlexanderKozhevin](https://github.com/AlexanderKozhevin)!
* [BUGFIX] Automatically route to `index/` in deeply nested views when using direct/static view route target syntax
* [BUGFIX] Add assertion about views which contain extra dots (`.`) in their paths when using direct/static view route target syntax
* [INTERNAL] Use `chalk` instead of `colors` for console output. Thanks [@markelog](https://github.com/markelog)! [3680](https://github.com/balderdashy/sails/pull/3680)

## 0.12.2

* [ENHANCEMENT] Allow use of `fn` in expanded route targets [e1790b7](https://github.com/balderdashy/sails/commit/e1790b70b35cd7dc50743a63bb169585f8a927f2)
* [BUGFIX] Add blacklist to "update" blueprint action so that it can be used with primary keys that are not "id" [3625](https://github.com/balderdashy/sails/issues/3625)
* [ENHANCEMENT] Allow hooks to be turned off by setting their environment var to the string "false" [3618](https://github.com/balderdashy/sails/issues/3618)
* [BUGFIX] Allow view target syntax for routes to specify deeply-nested views [3604](https://github.com/balderdashy/sails/issues/3604)
* [BUGFIX] Allow custom bodyParser middleware config [3592](https://github.com/balderdashy/sails/issues/3592)
* [BUGFIX] When lifting with unknown validation rule, exit gracefully instead of throwing.
* [BUGFIX] Update validation rules from anchor [3649](https://github.com/balderdashy/sails/issues/3649)
* [BUGFIX] Respond with an error if attempting to use `req.file()` from a virtual request (i.e. when Skipper is not available).  And don't pass in `res` when building the mock request, since it is not available yet. [3656](https://github.com/balderdashy/sails/issues/3656)
* [BUGFIX] Fix incorrect handling of errors in responses hook.  Thanks [@tapuzzo-fsi](https://github.com/tapuzzo-fsi)! [3645](https://github.com/balderdashy/sails/pull/3645)
* [BUGFIX] Fix error from `routeCorsConfig` sometimes being undefined [3662](https://github.com/balderdashy/sails/issues/3662)
* [INTERNAL] Replace `ready` event with an async `handleLift` lifecycle callback in order to simplify the behavior of `sails lift` and ensure the timing of the "done" callback is correct when using it programmatically.
* [INTERNAL] Massive overhaul of tests.  See [b033f2d thru e85810a](https://github.com/balderdashy/sails/compare/71aa56db59129da58825b22f32030234a4f5ae2c...b033f2d9af4953fd65c3e1bbb44ed4df15da1f68).
* [INTERNAL] Extrapolate ORM hook into sails-hook-orm.
* [INTERNAL] Force asynchronicity in the optional third argument of `res.view()`/`res.render()` to pave the way for better, request-agnostic view rendering methods.  This prevents double-calling of the callback if userland code throws an error.  Thanks [@lennym](https://github.com/lennym)! [cd413e15435947aa855e27aab16d9cd9e65ad493](https://github.com/balderdashy/sails/commit/cd413e15435947aa855e27aab16d9cd9e65ad493)
* [ENHANCEMENT] Update version of i18n to `0.8.1` [3631](https://github.com/balderdashy/sails/pull/3631).
* [ENHANCEMENT] Improve auto-migrate prompt, and skip the prompt and log an info message instead if `sails.config.models.migrate` is being automatically set to production anyways.  [sails-hook-orm/commit/3161c34edbe0aa07055f8665493734dda1688c2a](https://github.com/balderdashy/sails-hook-orm/commit/3161c34edbe0aa07055f8665493734dda1688c2a)
* [ENHANCEMENT] Add production check in case sails-disk is being used, and experimental `sails.config.orm.skipProductionWarnings` flag for preventing the warning. [sails-hook-orm/commit/9a0d46e135dadf00bc4576341624a31e50b12838](https://github.com/balderdashy/sails-hook-orm/commit/9a0d46e135dadf00bc4576341624a31e50b12838)
* [INTERNAL] Don't clone target function in expanded route syntax [6cfb2de](https://github.com/balderdashy/sails/commit/6cfb2de17ccafd789d4af001934b286bc189d1a4)
* [BUGFIX] Replace naughty code in implicit default res.forbidden() response; relevant when api/responses/ is deleted. See #3667 for more info. Thanks [@Biktop](https://github.com/biktop)!  [4767585994c45e7a7040402a057f0e41660d3419](https://github.com/balderdashy/sails/commit/4767585994c45e7a7040402a057f0e41660d34)19
* [INCONSISTENCY] Fix embarassing old link that was being shown when you `console.log` the `sails` app instance.  Thanks [@wulfsolter](https://github.com/wulfsolter) [52d45688fcfb6c4437348115f3e9c91595a8d379](https://github.com/balderdashy/sails/commit/52d45688fcfb6c4437348115f3e9c91595a8d379)!
* [INTERNAL] Get rid of a whimsical little `--require` in mocha.opts that must have gotten lost.  Don't ask us how it ended up there. Thanks [@markelog](https://github.com/markelog)! [06837a53b48352de7c46a1be84e87e28a084ffe2](https://github.com/balderdashy/sails/commit/06837a53b48352de7c46a1be84e87e28a084ffe2)
* [INTERNAL] Remove needless require from mocha opts. Thanks [@markelog](https://github.com/markelog)! [3681](https://github.com/balderdashy/sails/pull/3681)


## 0.12.1

* [INTERNAL] Expose private `loadAndRegisterControllers` method for now, since certain apps are relying on it [0ba7829](https://github.com/balderdashy/sails/commit/0ba78296047874debd33ce62588e97c371b7138c)
* [BUGFIX] Updated default HTTP cache config property to match what's documented [750d434](https://github.com/balderdashy/sails/commit/750d434a5592b422686ef0217ecab6cc2abcce7a)
* [BUGFIX] Check for `sails.io` before checking for `sails.io.httpServer` when lowering [92c4b19](https://github.com/balderdashy/sails/commit/92c4b1907073336b879c7c6abf57d5d34b3fca46)
* [ENHANCEMENT] Keep cookie middleware even if session middleware is deactivated [d21ae2d](https://github.com/balderdashy/sails/commit/d21ae2d8cf16df1169187392c9f522f99d556a85)
* [BUGFIX] Reset process.env.NODE_ENV after Sails lowers to whatever it was originally (to make it non-sticky when lifting/lowering multiple apps) [f9db888](https://github.com/balderdashy/sails/commit/f9db888a4fd39d43138bad4b279ad86046c27482)
* [BUGFIX] Use correct extension config for Handlebars [3559](https://github.com/balderdashy/sails/issues/3559)
* [BUGFIX] Update usage of `sails.sockets.id()` in pubsub hook to `sails.sockets.getId()` to avoid deprecation warning [3552](https://github.com/balderdashy/sails/issues/3552)
* [INTERNAL] Replace usage of Express middleware (e.g. `require('express').favicon`) with equivalent standalone packages (e.g. `require('serve-favicon')`)
* [BUGFIX] Allow passing in non-model instances to `publishCreate` [3558](https://github.com/balderdashy/sails/issues/3558)

## 0.12.0

* [UPGRADE] Bump Waterline dependency to `0.11.0` and Sails-Disk to `0.10.9`
* [ENHANCEMENT] More core hooks are now fully documented ([controllers](https://github.com/balderdashy/sails/tree/master/lib/hooks/controllers)|[grunt](https://github.com/balderdashy/sails/tree/master/lib/hooks/grunt)|[logger](https://github.com/balderdashy/sails/tree/master/lib/hooks/logger)|[cors](https://github.com/balderdashy/sails/tree/master/lib/hooks/cors)|[responses](https://github.com/balderdashy/sails/tree/master/lib/hooks/responses)|[orm](https://github.com/balderdashy/sails/tree/master/lib/hooks/orm))
* [ENHANCEMENT] Improve `sails --help` output (note that this removes support for common misspellings) [#3539](https://github.com/balderdashy/sails/issues/3539)
* [ENHANCEMENT] Detect EMFILE warnings from grunt-contrib-watch and treat them as fatal (this is the too many open files / `ulimit -n 1024` thing)  [#3523](https://github.com/balderdashy/sails/issues/3523)
* [BUGFIX] Downgrade default grunt-contrib-watch dependency installed in new Sails apps to use v0.5.3 [#3526](https://github.com/balderdashy/sails/issues/3526)
* [BUGFIX] Use locally-installed Sails (when available) with `sails console` instead of always using global [093ec01](https://github.com/balderdashy/sails/commit/093ec01754f1caa54333e97cfb9a095f1697a2f1)
* [UPGRADE] Update `express-handlebars` to `3.0.0` [1760604](https://github.com/balderdashy/sails/commit/1760604b5a78eacc2d5a1facd4db2de3ea930972)
* [BUGFIX] Don't attempt to run CSRF protection methods if session is not available
* [BUGFIX] Properly remove process listeners on sails.lower() to avoid EventEmitter leaks when lifting/lowering multiple apps (e.g. in tests) [#2693](https://github.com/balderdashy/sails/issues/2693)
* [UPGRADE] Updated versions of Lodash (v3.10.1) and Async (v1.5.0) used in Sails (and globalized in Sails apps by default)
* [ENHANCEMENT] Support for newer versions of connect-redis session adapter (and other session adapters using express-session)
* [ENHANCEMENT] Set the useGlobal config option for REPL while using sails console, allows autoreload hook to reflect changes on global models and services
* [ENHANCEMENT] Support JSON sorting syntax in blueprints [#2449](https://github.com/balderdashy/sails/issues/2449)
* [ENHANCEMENT] Support namespaced modules as hooks [#3022](https://github.com/balderdashy/sails/issues/3022), [#3514](https://github.com/balderdashy/sails/pull/3514)
* [ENHANCEMENT] Allow installable hooks to override their default names [#3168](https://github.com/balderdashy/sails/pull/3168)
* [BUGFIX] Fixed issues with subscribing sockets to new model instances in a clustered environment [#2990](https://github.com/balderdashy/sails/issues/2990), [#3008](https://github.com/balderdashy/sails/issues/3008)
* [UPGRADE] Update `consolidate` to `^0.12.1`
* [BUGFIX] Don't allow changing a model's primary key via blueprints
* [ENHANCEMENT] Added sails.config.keepResponseErrors option to keep response errors in production mode [#2853](https://github.com/balderdashy/sails/pull/2853)
* [ENHANCEMENT] Added Livescript support [#2662](https://github.com/balderdashy/sails/pull/2662), [#2599](https://github.com/balderdashy/sails/pull/2599)
* [ENHANCEMENT] Added IcedCoffeeScript support (brrr) [#2599](https://github.com/balderdashy/sails/pull/2599)
* [BUGFIX] Fix req.param() to work correctly with falsy params [#2756](https://github.com/balderdashy/sails/pull/2756)
* [ENHANCEMENT] Support "exposeHeaders" option in CSRF config [#2712](https://github.com/balderdashy/sails/pull/2712)
* [BUGFIX] Honor all route options when using policy target syntax (https://github.com/balderdashy/sails/issues/2609#issuecomment-77527609)
* [ENHANCEMENT] New `sails deploy` CLI command.  See https://github.com/mikermcneil/sails-deploy-azure for an example deployment strategy.
* [ENHANCEMENT] Support CSRF hook route configuration [#2366](https://github.com/balderdashy/sails/issues/2366)
* [BUGFIX] Fix [RangeError: Maximum call stack size exceeded] error in PubSub hook
* [ENHANCEMENT] Support layout for Ractive template engine
* [ENHANCEMENT] Body parser error logs no longer outputted in production, unless `sails.config.keepResponseErrors` is set [#3347](https://github.com/balderdashy/sails/pull/3347)
* [BUGFIX] Pluralize option works correctly for all routes [#3223](https://github.com/balderdashy/sails/pull/3223)
* [BUGFIX] Blueprint create now works when POSTing arrays [#3228](https://github.com/balderdashy/sails/pull/3228)
* [UPGRADE] Updated `sails-hook-sockets` to `^0.13.0`, which uses an updated socket.io-client module and has some bugfixes
* [BUGFIX] Default responses now work correctly when views hook is disabled [#2770](https://github.com/balderdashy/sails/pull/2770)
* [BUGFIX] Restored troubleshooting messages in console when Sails server fails to lift
* [BUGFIX] app-wide locals (sails.config.views.locals) are combined using a shallow merge (`_.extend()` instead of `_.merge()`) [#3500](https://github.com/balderdashy/sails/issues/3500)
* [ENHANCEMENT] Added `sails.getRouteFor()` and `sails.getUrlFor()`, utility methods for reverse routing  [#3402](https://github.com/balderdashy/sails/issues/3402#issuecomment-167137610)
* [BUGFIX] Improve interoperability of virtual requests to provide a more consistent API to Socket.io and `sails.request()` (e.g. for tests)  [121f3feb8702d44420e86707ef05e3282461d136](https://github.com/balderdashy/sails/commit/121f3feb8702d44420e86707ef05e3282461d136)
* [INTERNAL] Use shallow merge in services hook when loading modules (37eceee9b0ff0a20a285ac2889f4a5e96f3f5b30)
* [INTERNAL] Don't expose sails.services until `loadModules` is called in the services hook (37eceee9b0ff0a20a285ac2889f4a5e96f3f5b30)

## 0.11.5

* [BUGFIX] Allow disabling of installed hooks [#3550](https://github.com/balderdashy/sails/pull/3550)
* [ENHANCEMENT] Support namespaced modules as hooks (hotfix from [#3022](https://github.com/balderdashy/sails/issues/3022), [#3514](https://github.com/balderdashy/sails/pull/3514))
* [ENHANCEMENT] Allow installable hooks to override their default names (hotfix from [#3168](https://github.com/balderdashy/sails/pull/3168))

## 0.11.4

* [SECURITY] Updated several dependencies due to security vulnerabilities (https://github.com/balderdashy/sails/issues/3464#issuecomment-169255559)

## 0.11.3

* [BUGFIX] Fix [RangeError: Maximum call stack size exceeded] error in PubSub hook (https://github.com/balderdashy/sails/issues/2636)
* [ENHANCEMENT] Allow custom route options in policy target syntax (https://github.com/balderdashy/sails/commit/0990fc10709520a9f6c55923b991708d5eaf8aa0)
* [ENHANCEMENT] Support CSRF hook route configuration [#2366](https://github.com/balderdashy/sails/issues/2366)
* [ENHANCEMENT] Added "exposeHeaders" option in CORS configuration (https://github.com/balderdashy/sails/pull/2712)

## 0.11.2

* [BUGFIX] Fixes to allow proper installation / execution in environments using Node 4 and/or NPM 3.

## 0.11.1

* Shhhh nothing to see here (version skipped)

## 0.11.0

* [ENHANCEMENT] Allow hooks to be installed in node_modules and dynamic changing of hook name
* [ENHANCEMENT] Pull out the `sockets` hook to its own repository
* [ENHANCEMENT] Allow hooks to have individual timeouts, and a global `sails.config.hookTimeout`
* [ENHANCEMENT] Pull out `sails.io`.js to its own generator
* [UPGRADE] Update `sails.io.js` for the latest version of the sockets hook
* [UPGRADE] Upgrade from Socket.IO 0.9.17 to 1.2.1
* [FEATURE] Add `restPrefix` setting in addition to `prefix` setting for blueprints for finer control
* [ENHANCEMENT] Support partials and layout with Handlebars for the `backend` generator
* [BUGFIX] Blueprint creation returns 201 status code instead of 200
* [BUGFIX] `ractive.toHTML()` replaces `ractive.renderHTML()` for Ractive template engine
* [BUGFIX] Fix arguments for publishAdd, publishRemove and publishUpdate
* [ENHANCEMENT] Enable views hook for all methods
* [BUGFIX] Resolve depreciation warnings
* [BUGFIX] Fix dependency for npm 2.0.0
* [BUGFIX] Fix Grunt launching when it's a peer dep
* [ENHANCEMENT] Upgrade express and skipper because of security vulnerabilities
* [BUGFIX] Fix Sails crashes if Redis goes down [#2277](https://github.com/balderdashy/sails/pull/2277)
* [BUGFIX] Fix crash when using sessionless requests over WebSockets [#2107](https://github.com/balderdashy/sails/pull/2107)
* [ENHANCEMENT] Checking npm-version on install
* [ENHANCEMENT] Updated "skipAssets" regex to ignore query string


## 0.10.5

* [ENHANCEMENT] Updated `waterline` to `~0.10.9`
* [ENHANCEMENT] Added new `routesDisabled` option for CSRF [#2121](https://github.com/balderdashy/sails/pull/2121)
* [ENHANCEMENT] Refactoring and cleanup.
* [ENHANCEMENT] Switched from `express3-handlebars` to `express-handlebars`
* [BUGFIX] Add missing require for async module [#2101](https://github.com/balderdashy/sails/pull/2101)

## 0.10.4 and earlier?

See https://github.com/balderdashy/sails/commits/eea3b43b4e79d6b9f1b03b318a3ccab80704f22a.
