# Sails Roadmap

This file contains the development roadmap for the upcoming release of Sails, as well as the project backlog.

&nbsp;
&nbsp;

## v0.12

This section includes the main features, enhancements, and other improvements tentatively planned or already implemented for the v0.12 release of Sails.  Note that this is by no means a comprehensive changelog or release plan and may exclude important additions, bug fixes, and documentation tasks; it is just a reference point.  Please also realize that the following notes may be slightly out of date-- until the release is finalized, API changes, deprecation announcements, additions, etc. are all tentative.

 + Documentation / Meta
   + New guide for contributing to Sails docs, as well as a few tweaks to the process for starting or contributing to translation projects (see http://blog.sailsjs.org/post/137189916152/updates-to-how-we-contribute-to-the-sails-docs)
   + [Improved docs](https://github.com/balderdashy/sails-docs/pull/615) for log configuration (thanks @kevinob11 and @felixmc)
   + Contributor documentation for more of Sails' core hooks
     + [Grunt hook](https://github.com/balderdashy/sails/tree/master/lib/hooks/grunt)
     + [Responses hook](https://github.com/balderdashy/sails/tree/master/lib/hooks/responses)
     + ORM hook _(esp. example documentation for implementing a custom override)_
     + Blueprints hook
   + Added [Code of Conduct](https://github.com/balderdashy/sails/blob/master/CODE-OF-CONDUCT.md)
   + Created updated contribution guide with a streamlined process for feature/enhancement proposals (also added much more extensive guide to issue and code contributions)
   + Set up http://blog.sailsjs.org
 + Sockets hook
   + Clean up the API for `sails.socket.*` methods, normalizing overloaded functions and deprecating methods which cause problems in a multi-node setting.
   + Generally improve multi-node support (and therefore scalability) of low-level `sails.socket.*` methods, and make additional adjustments and improvements related to latest sio upgrade.  Add additional custom logic for when socket.io-redis is being used, using a redis client to implement the admin bus, instead of an additional socket client.
   + Add a few brand new sails.sockets methods: `.leaveAllRooms()`, `.union()`, and `.difference()`
   + `id()` -> `parseSocketId()` (backwards compatible w/ deprecation message)
 + Generators
   + Upgrade sails.io.js dependency in new generators (includes sio upgrades and the ability to specify common headers for socket requests from `sails.io.js`)
   + Deal with copying vs. symlinking dependencies in new projects for NPM 3
   + Upgrade to latest trusted versions of `grunt-contrib-*` dependencies (eliminates many NPM deprecation warnings and provides better error messages from NPM)
 + Waterline improvements (see https://github.com/balderdashy/waterline)
 + Skipper improvements (see https://github.com/balderdashy/skipper)
 + Captains Log improvements (see https://github.com/balderdashy/captains-log)
 + See also https://github.com/balderdashy/sails/blob/master/CHANGELOG.md#master


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
 `sails.getRouteAddress()`                       | [#3402](https://github.com/balderdashy/sails/issues/3402#issuecomment-167137610)      | Given a route target, return the route address configured in the app's explicit routes.
 Federate core hooks                             | [#3504](https://github.com/balderdashy/sails/pull/3504)                               | Custom builds of Sails (ability to install only the hooks and dependencies your app needs).


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
 Allow disabling session mw for static assets    | Allow session handling to be turned off for static assets. In certain situations, a request for a static asset concurrent to a request to a controller action can have undesirable consequences; specifically, a race condition can occur wherein the static asset response ends up overwriting changes that were made to the session in the controller action.  Luckily, this is a very rare issue, and only occurs when there are race conditions from two different simultaneous requests sent from the same browser with the same cookies.  If you encounter this issue today, first think about whether you actually need/want to do things this way.  If you absolutely need this functionality, a workaround is to change the order of middleware or override the `session` middleware implementation in `config/http.js`.  However, for the long-term, we need a better solution.  It would be good to improve the default behavior of our dependency, `express-session` so that it uses a smarter heuristics.  For more information, see the implementation of session persistence in [express-session](https://github.com/expressjs/session/blob/master/index.js#L207).  However, the single cleanest solution to the general case of this issue would be the ability to turn off session handling features for all static assets (or on a per-route basis).  This is easier said than done.  If you'd like to have this feature, and have the cycles/chops to implement it, please tweet @sgress454 or @mikermcneil and we can dive in and work out a plan.  Summary of what we could merge:  We could remove the default session middleware from our http middleware configuration, and instead add it as a manual step in the virtual router that runs before the route action is triggered.  Good news it that we're actually already doing this in order to support sessions [in the virtual router](https://github.com/balderdashy/sails/blob/master/lib/router/index.js#L101) (e.g. for use w/ socket.io).  So the actual implementation isn't a lot of work-- just needs some new automated tests written, as well as a lot of manual testing (including w/ redis sessions).  We also need to update our HTTP docs to explain that requests for static assets no longer create a session by default, and that default HTTP session support is no longer configured via Express's middleware chain (handled by the virtual router instead.)  Finally we'd also need to document how to enable sessions for assets (i.e. attaching the express-session middleware in `config/http.js`, but doing so directly _before_ the static middleware runs so that other routes don't try to retrieve/save the session twice).  [@sgress454](https://github.com/sgress454)
 Manual migrations in Sails CLI                  | For production environments it would be nice to have a save/secure command that creates the db automatically for you; e.g. a `sails migrate` or `sails create-db` command.  See [sails-migrations](https://github.com/BlueHotDog/sails-migrations) and [sails-db-migrate](https://github.com/building5/sails-db-migrate) for inspiration.  We should begin by contributing and using one or both of these modules in production in order to refine them further into a full fledged proposal (the Sails core team is using sails-migrations currently).  Originally suggested by [@globegitter](https://github.com/Globegitter).
 Wildcard action policies                        | Instead of only having one global action policy `'*'` it would be nice if we could define policies for a specific action in all controllers: `'*/destroy': ['isOwner']` or something similar.  Originally suggested by [@ProLoser](https://github.com/ProLoser).
 SPDY/HTTP2 protocol support                     | See https://github.com/balderdashy/sails/issues/80 for background.


