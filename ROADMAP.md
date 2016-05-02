# Sails Roadmap

This file contains the development roadmap for the upcoming release of Sails, as well as the project backlog.

&nbsp;
&nbsp;

## v1.0

This section includes the a **very early list** of some of the features, enhancements, and other improvements tentatively planned or already implemented for the v1.0 release of Sails.  Note that this is by no means a comprehensive changelog or release plan and may exclude important additions, bug fixes, and documentation tasks; it is just a reference point.  Please also realize that the following notes may be slightly out of date-- until the release is finalized, API changes, deprecation announcements, additions, etc. are all tentative.

+ **`sails.config.environment` and the `NODE_ENV` environment variable**
  + Sails will no longer set the `NODE_ENV` environment variable automatically by default.
  + Apps will need to set `NODE_ENV` themselves in addition to `sails.config.environment`.
  + If `NODE_ENV` is set to "production but `sails.config.environment` is _not specified_, then `sails.config.environment` will still be set to "production" automatically.
  + But if _both_ `NODE_ENV` and `sails.config.environment` are specified, then no changes will be made to either.
  + If `sails.config.environment` is set to "production" and the `NODE_ENV` environment variable is not also set to production, Sails will log a warning.
    + ^^needs tests.

+ More v1.0 info to come as it is finalized.

&nbsp;
&nbsp;


## Backlog

The backlog consists of approved proposals for useful features which are not currently in the immediate-term roadmap above, but would be excellent places to contribute code to the Sails framework. We would exuberantly accept a pull request implementing any of the items below, so long as it was accompanied with reasonable tests that prove it, and it doesn't break other core functionality. Please see the Sails [contribution guide](https://github.com/balderdashy/sails/blob/master/CONTRIBUTING.md) to get started.

> - If you would like to see a new feature or an enhancement to an existing feature in Sails, please review the [Sails contribution guide](https://github.com/balderdashy/sails/blob/master/CONTRIBUTING.md). When you are ready, submit a pull request adding a new row to the bottom of this table.
> - In your pull request, please include a detailed proposal with a short summary of your use case, the reason why you cannot implement the feature as a hook, adapter, or generator, and a well-reasoned explanation of how you think that feature could be implemented.  Your proposal should include changes or additions to usage, expected return values, and any errors or exit conditions.
> - Once your pull request has been created, add an additional commit which links to it from your new row in the table below.


Feature                                          | Proposal                                                                              | Summary
 :---------------------------------------------- | :------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------------------------------
 Generate `test/` folder in new Sails apps       | [#2499](https://github.com/balderdashy/sails/pull/2499#issuecomment-171556544)        | Generate a generic setup for mocha tests in all new Sails apps.  Originally suggested by [@jedd-ahyoung](https://github.com/jedd-ahyoung).
 View helper for bootstrapping script tags       | [#3522](https://github.com/balderdashy/sails/pull/3522)                               | Include a view helper for bootstrapping untrusted data from view locals onto the page via script tags in order to expose it to client-side JavaScript. The tricky part is ensuring protection from attempted XSS attacks.
 Improve CORS implementation                     | [#3651](https://github.com/balderdashy/sails/pull/3651)                               | Minor changes to the current CORS hooks to better follow the specs/remove inconsistencies.
 Keep error data on production                   | [#3568] (https://github.com/balderdashy/sails/pull/3568)                              | Never send error data in production for res.serverError() or res.negotiate(), but always send for res.ok(), res.forbidden(), res.badRequest(), res.notFound(), and have default error handler in Sails to call res.serverError()


&nbsp;
&nbsp;



## Pending Proposals

The backlog items below are from before the recent change to the Sails project's contribution guidelines, and are suggestions for features or enhancements, but are not yet accompanied by a complete proposal.  Before any of the following backlog items can be implemented or a pull request can be merged, a detailed proposal needs to be submitted, discussed and signed off on by the project maintainers.  For information on writing a proposal, see the [Sails contribution guide](https://github.com/balderdashy/sails/blob/master/CONTRIBUTING.md).  **Please do not submit a pull request _adding_ to this section.**

> - If you are the original proposer of one of these items, someone from the core team has contacted you in the linked issue or PR, if one was provided. Thank you for your help!
> - If you are interested in seeing one of the features or enhancements below in Sails core, please create a new pull request moving the relevant item(s) to the backlog table with additional details about your use case (see the updated contribution guide for more information).


Feature                                          | Summary
 :---------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 Atomic `update`                                 | See [this issue](https://github.com/balderdashy/sails-mysql/issues/253) for details.  Originally suggested by [@leedm777](https://github.com/leedm777).
 Log key configuration info on lift              | For example, if `config/local.js` is present, log a message explaining that it will be used.  See also https://github.com/dominictarr/rc/issues/23#issuecomment-33875197. Originally suggested by [@mikermcneil](https://github.com/mikermcneil).
 Lock + unlock app in dev env                    | Capability for a hook to "lock" and/or "unlock" the app (in a development env only).  When "locked" all requests are intercepted by an endpoint which responds with either a page or JSON payload communicating a custom message.  e.g. so the grunt hook can let us know as it syncs.  e.g. `sails.emit('lock')`. Originally suggested by [@mikermcneil](https://github.com/mikermcneil).
 Hook dependency/load order mgmt                 | Rebase the hook dependency+optional depenency system.  A detailed spec was originally proposed by @ragulka, but since then, custom hooks have complicated the equation.
 Standalone router                               | replace express dependency in `lib/router` with standalone router- either routification or @dougwilson's new project.  See https://github.com/balderdashy/sails/pull/2351#issuecomment-71855236 for more information.
 Standalone view renderer                        | Use @fishrock123's standalone views module (enables views over sockets).  See https://github.com/balderdashy/sails/pull/2351#issuecomment-71855236 for more information.
 Standalone static middleware                    | use static middleware directly in `lib/router` (enables static files over sockets)  See https://github.com/balderdashy/sails/pull/2351#issuecomment-71855236 for more information.
 Break out core hooks into separate modules      | Makes Sails more composable, and removes most of its dependencies in core. Also allows for easier sharing of responsibility w/ the community, controls issue flow.  Started with github.com/balderdashy/sails-hook-sockets
 Allow disabling session mw for static assets    | Allow session handling to be turned off for static assets. In certain situations, a request for a static asset concurrent to a request to a controller action can have undesirable consequences; specifically, a race condition can occur wherein the static asset response ends up overwriting changes that were made to the session in the controller action.  Luckily, this is a very rare issue, and only occurs when there are race conditions from two different simultaneous requests sent from the same browser with the same cookies.  If you encounter this issue today, first think about whether you actually need/want to do things this way.  If you absolutely need this functionality, a workaround is to change the order of middleware or override the `session` middleware implementation in `config/http.js`.  However, for the long-term, we need a better solution.  It would be good to improve the default behavior of our dependency, `express-session` so that it uses a smarter heuristics.  For more information, see the implementation of session persistence in [express-session](https://github.com/expressjs/session/blob/master/index.js#L207).  However, the single cleanest solution to the general case of this issue would be the ability to turn off session handling features for all static assets (or on a per-route basis).  This is easier said than done.  If you'd like to have this feature, and have the cycles/chops to implement it, please tweet @sgress454 or @mikermcneil and we can dive in and work out a plan.  Summary of what we could merge:  We could remove the default session middleware from our http middleware configuration, and instead add it as a manual step in the virtual router that runs before the route action is triggered.  Good news it that we're actually already doing this in order to support sessions [in the virtual router](https://github.com/balderdashy/sails/blob/master/lib/router/index.js#L101) (e.g. for use w/ socket.io).  So the actual implementation isn't a lot of work-- just needs some new automated tests written, as well as a lot of manual testing (including w/ redis sessions).  We also need to update our HTTP docs to explain that requests for static assets no longer create a session by default, and that default HTTP session support is no longer configured via Express's middleware chain (handled by the virtual router instead.)  Finally we'd also need to document how to enable sessions for assets (i.e. attaching the express-session middleware in `config/http.js`, but doing so directly _before_ the static middleware runs so that other routes don't try to retrieve/save the session twice).  [@sgress454](https://github.com/sgress454)
 Manual migrations in Sails CLI                  | For production environments it would be nice to have a save/secure command that creates the db automatically for you; e.g. a `sails migrate` or `sails create-db` command.  See [sails-migrations](https://github.com/BlueHotDog/sails-migrations) and [sails-db-migrate](https://github.com/building5/sails-db-migrate) for inspiration.  We should begin by contributing and using one or both of these modules in production in order to refine them further into a full fledged proposal (the Sails core team is using sails-migrations currently).  Originally suggested by [@globegitter](https://github.com/Globegitter).
 Wildcard action policies                        | Instead of only having one global action policy `'*'` it would be nice if we could define policies for a specific action in all controllers: `'*/destroy': ['isOwner']` or something similar.  Originally suggested by [@ProLoser](https://github.com/ProLoser).
 SPDY/HTTP2 protocol support                     | See https://github.com/balderdashy/sails/issues/80 for background.

