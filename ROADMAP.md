# Sails Roadmap

As of November 2017, the Sails project roadmap is now managed [on Trello](https://trello.com/b/s9zEnyG7) to allow for simpler feedback and collaboration.

The "Bugs/Priority" and "Frontlog" columns on Trello consist of relatively hashed-out proposals for useful features or patches which would be excellent places to contribute code to the Sails framework. We would exuberantly accept a pull request implementing any of the Trello cards in these columns, so long as that pull request was accompanied with reasonable tests that prove it, all code changes adhere to the style guide laid out in the `.eslintrc` file, and it doesn't cause breaking changes to any other core functionality.

> Community proposals can still be made as pull requests against this file-- but instead of managing status updates here, once approved, they are now managed on the [Trello board](https://trello.com/b/s9zEnyG7).  See "Pending Proposals" below for more on that.


> ##### What's up with Sails v1.0?
>
> For the latest news on Sails v1.0 and beyond, and to check out specific changes and new features, see https://trello.com/b/s9zEnyG7.  (Please feel free to contribute by leaving comments on cards!  It helps the core team to verify that the new release is working as expected.)
>
> You can find more information about installing v1.0 here: http://sailsjs.com/documentation/upgrading/to-v-1-0



## Pending Proposals

The table below consists of pending proposals for useful features which are not currently in the official roadmap on Trello.  To submit a proposal, send a pull request adding a row to this column.  Please see the Sails [contribution guide](https://github.com/balderdashy/sails/blob/master/CONTRIBUTING.md) to get started.

> - If you would like to see a new feature or an enhancement to an existing feature in Sails, please review the [Sails contribution guide](https://github.com/balderdashy/sails/blob/master/CONTRIBUTING.md). When you are ready, submit a pull request adding a new row to the bottom of this table.
> - Check [the official Sails roadmap on Trello](https://trello.com/b/s9zEnyG7) to make sure there isn't already something similar feature already planned, in discussion, or under active development.
> - In your pull request, please include a detailed proposal with a short summary of your use case, the reason why you cannot implement the feature as a hook, adapter, or generator, and a well-reasoned explanation of how you think that feature could be implemented.  Your proposal should include changes or additions to usage, expected return values, and any errors or exit conditions.
> - Once your pull request has been created, add an additional commit which links to it from your new row in the table below.
> - If there is sufficient interest in the proposal from other contributors, a core team member will close your PR and add a new card for the proposal to the appropriate column [on Trello](https://trello.com/b/s9zEnyG7).


Feature                                          | Proposal                                                                              | Summary
 :---------------------------------------------- | :------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------------------------------
 Allow select/omit clauses when populating a singular association | https://trello.com/c/yM9WPxzr/107-waterline-fs2q-tolerate-a-subcriteria-being-provided-to-populate-for-a-singular-associations-but-only-if-it-exclusively-contains | Don't throw an error if these clauses are included in a `populate` for a singular association (but still error if actual "where" criteria are used)
 Generate `test/` folder in new Sails apps       | [#2499](https://github.com/balderdashy/sails/pull/2499#issuecomment-171556544)        | Generate a generic setup for mocha tests in all new Sails apps.  Originally suggested by [@jedd-ahyoung](https://github.com/jedd-ahyoung).



<!--

TODO: Double check that all items from here are covered in Trello:


## 1.1.0 and beyond

+ **Blueprint API: Support transactions, when possible.**
  + See "FUTURE" comments throughout the code for the blueprints hook in this repo.
+ **Sessions: Expand `express-session`/Connect session store interface**
  + Expose a method in session stores which can be used to do an initial, asynchronous ping in order to check configuration.
  + Worst case, we should also be able to use [`.get()`](https://github.com/expressjs/session/blob/2667028d39b3655a45eb1f9579d7f66f26a6937f/README.md#storegetsid-callback) with a nonsense session id to do this-- the errors just won't be as nice, or as easy to negotiate.
  + The best middle-of-the-road solution is probably to get a couple of standardized error codes in the spec for `.get()`
    + Most likely, that's stuff like `ECONNREFUSED`
    + But would be a lot better if we could swing more specific error codes-- e.g. `E_BAD_SESSION_STORE_CONFIG` and `E_COULD_NOT_CONNECT_TO_SESSION_STORE`-- since that would eliminate the possibility of false positives due to throwing / `cb(err)`-ing.


## 2.0.0 and beyond

+ **Custom responses: Deprecate res.ok() in favor of res.success(); as well as some other breaking changes to custom responses.**
  + See first half of https://github.com/balderdashy/sails/commit/518bae84f01d17eac84c96977e5ed0c3b6a98083#commitcomment-20917978 for details.
+ **Blueprint API: Make the behavior of certain error conditions in blueprint actions customizable via `sails.config.blueprints.handle*`**
  + See second half of https://github.com/balderdashy/sails/commit/518bae84f01d17eac84c96977e5ed0c3b6a98083#commitcomment-20917978 for details.
+ **Federate sails-hook-blueprints**
  + In the process, pull the implementation of the three public RPS methods into sails-hook-sockets (and take the rest of the private methods out and drop them into the blueprints hook)
+ **Federate sails-hook-session**
  + Remember: This will involve a few delicate tweaks to the boilerplate config generated by `sails new foo --without=session`
+ **Federate sails-hook-i18n**
  + ~~(Will need to publish the backwards-compatible i18n hook as a separate package at that point)~~
+ **Switch to Lodash view engine by default?**
  + This is really just to normalize the confusing backwardsness of `<%=` vs. `<%-` in EJS/Lodash/Underscore
  + Would need to figure out partials/layouts though

-->


<!--

TODO: go through these lingering pending proposals:

Atomic `update`                                 | See [this issue](https://github.com/balderdashy/sails-mysql/issues/253) for details.  Originally suggested by [@leedm777](https://github.com/leedm777).
Log key configuration info on lift              | For example, if `config/local.js` is present, log a message explaining that it will be used.  See also https://github.com/dominictarr/rc/issues/23#issuecomment-33875197. Originally suggested by [@mikermcneil](https://github.com/mikermcneil).
Lock + unlock app in dev env                    | Capability for a hook to "lock" and/or "unlock" the app (in a development env only).  When "locked" all requests are intercepted by an endpoint which responds with either a page or JSON payload communicating a custom message.  e.g. so the grunt hook can let us know as it syncs.  e.g. `sails.emit('lock')`. Originally suggested by [@mikermcneil](https://github.com/mikermcneil).
Hook dependency/load order mgmt                 | Rebase the hook dependency+optional depenency system.  A detailed spec was originally proposed by @ragulka, but since then, custom hooks have complicated the equation.
~~Standalone router~~                               | ~~replace express dependency in `lib/router` with standalone router- either routification or @dougwilson's new project.  See https://github.com/balderdashy/sails/pull/2351#issuecomment-71855236 for more information.~~
Standalone view renderer                        | Use @fishrock123's standalone views module (enables views over sockets).  See https://github.com/balderdashy/sails/pull/2351#issuecomment-71855236 for more information.
Standalone static middleware                    | use static middleware directly in `lib/router` (enables static files over sockets)  See https://github.com/balderdashy/sails/pull/2351#issuecomment-71855236 for more information.
Break out core hooks into separate modules      | Makes Sails more composable, and removes most of its dependencies in core. Also allows for easier sharing of responsibility w/ the community, controls issue flow.  Started with github.com/balderdashy/sails-hook-sockets
~~Allow disabling session mw for static assets~~    | ~~Allow session handling to be turned off for static assets. In certain situations, a request for a static asset concurrent to a request to a controller action can have undesirable consequences; specifically, a race condition can occur wherein the static asset response ends up overwriting changes that were made to the session in the controller action.  Luckily, this is a very rare issue, and only occurs when there are race conditions from two different simultaneous requests sent from the same browser with the same cookies.  If you encounter this issue today, first think about whether you actually need/want to do things this way.  If you absolutely need this functionality, a workaround is to change the order of middleware or override the `session` middleware implementation in `config/http.js`.  However, for the long-term, we need a better solution.  It would be good to improve the default behavior of our dependency, `express-session` so that it uses a smarter heuristics.  For more information, see the implementation of session persistence in [express-session](https://github.com/expressjs/session/blob/master/index.js#L207).  However, the single cleanest solution to the general case of this issue would be the ability to turn off session handling features for all static assets (or on a per-route basis).  This is easier said than done.  If you'd like to have this feature, and have the cycles/chops to implement it, please tweet @sgress454 or @mikermcneil and we can dive in and work out a plan.  Summary of what we could merge:  We could remove the default session middleware from our http middleware configuration, and instead add it as a manual step in the virtual router that runs before the route action is triggered.  Good news it that we're actually already doing this in order to support sessions [in the virtual router](https://github.com/balderdashy/sails/blob/master/lib/router/index.js#L101) (e.g. for use w/ socket.io).  So the actual implementation isn't a lot of work-- just needs some new automated tests written, as well as a lot of manual testing (including w/ redis sessions).  We also need to update our HTTP docs to explain that requests for static assets no longer create a session by default, and that default HTTP session support is no longer configured via Express's middleware chain (handled by the virtual router instead.)  Finally we'd also need to document how to enable sessions for assets (i.e. attaching the express-session middleware in `config/http.js`, but doing so directly _before_ the static middleware runs so that other routes don't try to retrieve/save the session twice).  [@sgress454](https://github.com/sgress454)~~
Manual migrations in Sails CLI                  | For production environments it would be nice to have a save/secure command that creates the db automatically for you; e.g. a `sails migrate` or `sails create-db` command.  See [sails-migrations](https://github.com/BlueHotDog/sails-migrations) and [sails-db-migrate](https://github.com/building5/sails-db-migrate) for inspiration.  We should begin by contributing and using one or both of these modules in production in order to refine them further into a full fledged proposal (the Sails core team is using sails-migrations currently).  Originally suggested by [@globegitter](https://github.com/Globegitter).
Wildcard action policies                        | Instead of only having one global action policy `'*'` it would be nice if we could define policies for a specific action in all controllers: `'*/destroy': ['isOwner']` or something similar.  Originally suggested by [@ProLoser](https://github.com/ProLoser).
SPDY/HTTP2 protocol support                     | See https://github.com/balderdashy/sails/issues/80 for background.


-->

