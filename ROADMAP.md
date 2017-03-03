# Sails Roadmap

This file contains the development roadmap for the upcoming release of Sails, as well as the project backlog.

&nbsp;
&nbsp;

## v1.0

This section is an early list of some of the features, enhancements, and other improvements tentatively planned or already implemented for the v1.0 release of Sails.  Note that this is by no means a comprehensive changelog or release plan, and may exclude important additions, bug fixes, and documentation tasks; it is just a reference point with the highlights.

> ##### What's up with Sails v1.0?
>
> For the latest news on Sails v1.0, and to check out specific changes and new features, see https://trello.com/b/s9zEnyG7/sails-v1.  (Please feel free to contribute by leaving comments on cards!  It helps the core team to verify that the new release is working as expected.)
>
> You can find more information about installing v1.0 here: http://sailsjs.com/documentation/upgrading/to-v-1-0

Please also realize that the following notes may be slightly out of date from time to time.  Until the release is finalized, API changes, deprecation announcements, additions, etc. are all tentative.  (But we're getting close.)

<a name="built-in-support-for-database-projections-i-e-select"></a>
+ **Built-in Support for Database Projections (i.e. `SELECT`)**
  + This is already implemented in Waterline, but not yet exposed in Sails.
  + We may do a minor release of Sails prior to v1.0 so that folks can take advantage of this today.
  + If you want to use Waterline 0.12 in your Sails app in the mean time, fork sails-hook-orm, upgrade its waterline dependency, then NPM install your forked version as a dependency in your Sails app project, and it will take effect automatically (see [this comment](https://github.com/balderdashy/sails-hook-orm/pull/1#issuecomment-238656139) for more details).
<a name="built-in-support-for-dynamic-database-connections"></a>
+ **Built-in Support for Dynamic Database Connections**
  + Implemented via `sails.hooks.orm.datastore()`
  + See https://github.com/node-machine/driver-interface and https://github.com/particlebanana/waterline-query-docs/issues/2
  + API: `sails.hooks.orm.datastore('foo').leaseConnection(during).meta(optionalMD).exec(afterDisconnecting)`
  + Also: `User.find().usingConnection(mySQLConnectionObtainedFromUsingRawDriver).exec();`
  + This is currently implemented at the driver level, as of early Oct 2016.
<a name="advanced-joins-using-compiled-statements-based-on-knex"></a>
+ **Advanced Joins (using compiled statements based on Knex)**
  + This is implemented at the driver layer, and will be exposed via `.datastore()` in Sails v1
  + See https://github.com/particlebanana/waterline-query-docs/
<a name="built-in-support-for-native-database-transactions-for-databases-that-support-it"></a>
+ **Built-in Support for Native Database Transactions (for databases that support it)**
  + See https://github.com/postmanlabs/sails-mysql-transactions/issues/26#issuecomment-191225758)
  + API is similar to above:  `sails.hooks.orm.datastore('foo').transaction(during).meta(optionalMD).exec(afterCommittingOrRollingBack)`
<a name="native-queries"></a>
+ **Native Queries**
  + Model-based usage like `User.native()` and `User.query()` will be deprecated.
  + Instead, native queries (e.g. SQL or Mongo queries) will be performed by accessing the appropriate datastore.
  + API is similar to above: `sails.hooks.orm.datastore('foo').sendNativeQuery(nativeQuery).usingConnection(optionalDbConnection).meta(optionalMD).exec(afterFinished)`
<a name="nested-create-nested-update"></a>
+ **Nested create / nested update**
  + Will be disabled by default (and likely completely deferred to userland).
+ **More granular `.save()`**
  + Three new static model methods will be available:
    + `addToCollection(3)`
    + `removeFromCollection(12)`
    + `.resetCollection([1,2,3])` / `.resetCollection([])`
  + Out of the box, queries like the following will also be supported:
    + `.create({ pets: [3,5,6] }).exec(...)`
    + `.create({ pets: [] }).exec(...)`
    + `.create({ favoritePet: 5 }).exec(...)`
    + `.create({ favoritePet: null }).exec(...)`
+ **Enhanced `.stream()` functionality**
  + Simplify interface and remove reliance on emitters
<a name="case-sensitivity-in-criteria-s-where-in-waterline-find-find-one-count-update-destroy"></a>
+ **Case sensitivity in criteria's `where` in Waterline find/findOne/count/update/destroy**
  + Will be database-specific instead of normalized to be case-insensitive.
  + This is primarily in order to improve performance on PostgreSQL and to allow for more customizability with character sets/collations across all databases.
<a name="automigrations"></a>
+ **Automigrations**
  + Will be moved out of Waterline and into sails-hook-orm.
  + Usage is unlikely to change.
+ ~~ **Default `res.ok()` response will no longer accept arguments.** ~~
  + (Modified this slightly -- default `res.ok()` can still accept a single data argument, but will no longer attempt to serve a view.  It will _always_ call `res.json()` with the data, unless the first argument is not specified or is `undefined`, in which case it will do `return res.sendStatus(200)`.)
+ ~~ **Default blueprint actions will no longer use `res.ok()` or serve matching views.** ~~
  + (Due to the modification of `res.ok()` described above, it's okay for blueprints to continue using it.)
<a name="built-in-xss-prevention-expose-locals-to-browser-view-helper"></a>
+ ✓ ~~**Built-in XSS Prevention (`exposeLocalsToBrowser()` view helper)**~~
  + ~~See https://github.com/balderdashy/sails/pull/3522~~~
<a name="federated-hooks-custom-builds"></a>
+ **Federated hooks (custom builds)**
  + See https://github.com/balderdashy/sails/pull/3504
<a name="upgrade-to-express-5"></a>
+ **Upgrade to Express 5**
  + Move implementation of `req.param()` from Express core into Sails core
  + Improve error handling and simplify Sails' `res.view()`
  + ✓ ~~For performance reasons, on-lift view stat-ing will still be used to build handlers for `{view: 'foo'}` route target syntax.~~
  + Use standalone Express router in virtual request interpreter, but continue using express core for handling HTTP requests
  + **Possibly:** Expose context-free view rendering API (replace experimental sails.renderView() and internally, use [`app.render()`](https://expressjs.com/en/4x/api.html#app.render) or better yet, standalone module)
  + See also https://github.com/expressjs/express/pull/2237?_ga=1.217677078.1437564638.1468192018 and https://expressjs.com/en/guide/migrating-5.html
<a name="built-in-support-for-request-parameter-validation-response-coercion"></a>
+ ✓ ~~**Built-In Support For Request Parameter Validation & Response Coercion**~~
  + ~~Declaratively specify request parameters, whether they are required, and other data type validations.~~
  + ~~Assign default values for optional params~~
  + ~~Declare schemas for responses~~
  + TODO: go ahead and branch v1 sails-docs and document request parameter validation, response standalone actions
<a name="standalone-actions"></a>
+ ✓ ~~**Standalone Actions**~~
  + Not all actions (whether it's a microservice, or an endpoint to serve a one-off view) fit nicely into controllers, and pointless categorization wastes developers' time and mental energy.
  + ✓ Run `sails generate action` to create a new standalone action file
<a name="deprecate-built-in-ejs-hbs-layouts-support-and-instead-emphasize-partials"></a>
+ **Deprecate Built-in EJS/HBS Layouts Support (and instead emphasize partials)**
  + Change `sails-generate-new` to build partials instead of layout (e.g. `views/partials/head.ejs`)
  + Update default EJS dep (see https://github.com/mde/ejs)
<a name="services-helpers"></a>
+ ✓ ~~**Services & Helpers**~~
  + ✓ ~~Services will continue to work exactly as they today, but the folder will no longer be generated in new Sails apps by default.~~
  + ✓ ~~Instead, new Sails projects will include `api/helpers/`, a new type of Sails project module.~~
    + `sails.helpers.fetchRecentFBMessages({ ... }).exec(function (err, fbMsgs) { ... });`
    + `sails.helpers.computeAverage({ ... }).execSync();`
    + `sails.helpers.foo.bar.baz.doSomething({ ... }).exec(...)`
  + ✓ ~~Running `sails generate helper` creates a new helper file~~
<a name="interalize-seldom-used-resourceful-pubsub-rps-methods"></a>
+ ✓ ~~**Interalize Seldom-Used Resourceful Pubsub (RPS) Methods**~~
  + RPS methods were originally internal to blueprints, and while a few of them are particularly useful (because they manage socket.io room names for you), the public exposure of other methods was more or less incidental.
  + To support more intuitive use, Sails v1.0 trims down the RPS API to just three methods:
    + `publish()`
    + `subscribe()`
    + `unsubscribe()`
<a name="improved-parsing-of-configuration-overrides"></a>
+ ✓ ~~**Improved parsing of configuration overrides**~~
  + ~~This expands the possibilities of env vars for setting configuration.  The only reason this hasn't been implemented up until now is that it requires knowing where configuration exported by `rc` is coming from (see https://github.com/dominictarr/rc/pull/33)~~
  + ~~Instead of receiving JSON-encoded values (numbers/booleans/dictionaries/arrays/null) as strings, they'll be parsed.~~
  + ~~See [rttc.parseHuman()](https://github.com/node-machine/rttc#parsehumanstringfromhuman-typeschemaundefined-unsafemodefalse) for details~~
<a name="validation-errors-in-blueprints-res-jsonx-error-handling-in-custom-responses"></a>
+ **Validation errors in blueprints, `res.jsonx()`, & error handling in custom responses**
  + Will be handled by calling res.badRequest() directly
  + The toJSON() function of errors will be called (since res.json will be used instead of res.jsonx)
  + https://github.com/balderdashy/sails/commit/b8c3813281a041c0b24db381b046fecfa81a14b7#commitcomment-18455430
<a name="error-handling-in-general"></a>
+ **Error handling (in general)**
  + Default implementation of res.serverError() will continue to never send error data in production
  + But default impl of `res.ok()` and `res.badRequest()` will _always_ send the provided argument as response data, even in production.
  + Default implementations of res.forbidden() and res.notFound() will no longer send a response body at all.
  + The default error handler in Sails (i.e. `next(err)`) will call `res.serverError()` instead of `res.negotiate()`.
  + Support for `res.negotiate()` will likely still exist, but will log a warning.
  + For more details, see https://github.com/balderdashy/sails/commit/b8c3813281a041c0b24db381b046fecfa81a14b7#commitcomment-18455430
  + For historical context, see also [#3568] (https://github.com/balderdashy/sails/pull/3568)
<a name="jsonp-support-in-blueprints"></a>
+ **JSONP support in blueprints**
  + Will be deprecated (along with res.jsonx, as mentioned above)
  + CORS support is so widespread in browsers today (IE8 and up) that JSONP is rarely necessary-- and certainly isn't worth the complexity/weight in core.  After upgrading to v1, if you want to implement support for JSONP within the blueprint API, it is still achievable by modifying the relevant default responses (`api/responses/badRequest.js`, `api/responses/serverError.js`, and `api/responses/notFound.js`) to use `res.jsonp()` instead of `res.json()` (or to determine which to use based on the value of a request param).
<a name="sails-config-environment-and-the-node-env-environment-variable"></a>
+ **`sails.config.environment` and the `NODE_ENV` environment variable**
  + Sails will no longer set the `NODE_ENV` environment variable automatically by default.
  + Apps will need to set `NODE_ENV` themselves in addition to `sails.config.environment`.
  + If `NODE_ENV` is set to "production but `sails.config.environment` is _not specified_, then `sails.config.environment` will still be set to "production" automatically.
  + But if _both_ `NODE_ENV` and `sails.config.environment` are specified, then no changes will be made to either.
  + If `sails.config.environment` is set to "production" and the `NODE_ENV` environment variable is not also set to production, Sails will log a warning.
    + ^^needs tests.
<a name="sails-config-dont-flatten-config-will-be-deprecated"></a>
+ ✓ ~~**The deprecated `sails.config.dontFlattenConfig` will be removed.**~~  _BORN DEPRECATED_
  + The `dontFlattenConfig` setting was [originally added](http://sailsjs.com/documentation/concepts/upgrading/to-v-0-11#?config-files-in-subfolders) for backards-compatibility with what was essentially a bug.
  + It will be completely removed in Sails v1.0 for simplicity.
<a name="better-built-in-support-for-command-line-scripts-that-require-access-to-the-sails-app-instance"></a>
+ ✓ ~~**Better built-in support for command-line scripts that require access to the Sails app instance**~~
  + https://github.com/treelinehq/machine-as-script/commits/master
<a name="normalize-usage-of-routes-disabled-config-keys"></a>
+ **Normalize usage of `routesDisabled` config keys**
  + Now applies only to sails.config.session: use Sails [route address syntax](http://sailsjs.com/documentation/concepts/routes/custom-routes#?route-address)
<a name="strip-out-deprecated-sockets-methods"></a>
+ ✓ ~~**Strip Out Deprecated Sockets Methods**
  + Remove the implementation of deprecated `sails.sockets.*` methods from Sails core.
  + (These were deprecated, but left in place with warning messages, in Sails v0.12)
<a name="sails-stdlib"></a>
+ **sails-stdlib**
  + Library of well-tested, well-documented, and officially supported modules for the most common everyday tasks in apps (e.g. password encryption)


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
~~Improve CORS implementation~~                     | [#3651](https://github.com/balderdashy/sails/pull/3651)                               | ~~Minor changes to the current CORS hooks to better follow the specs/remove inconsistencies.~~

&nbsp;
&nbsp;



## Pending Proposals

The backlog items below are from before the recent change to the Sails project's contribution guidelines, and are suggestions for features or enhancements, but are not yet accompanied by a complete proposal.  Before any of the following backlog items can be implemented or a pull request can be merged, a detailed proposal needs to be submitted, discussed and signed off on by the project maintainers.  For information on writing a proposal, see the [Sails contribution guide](http://sailsjs.com/documentation/contributing).  **Please do not submit a pull request _adding_ to this section.**

> - If you are the original proposer of one of these items, someone from the core team has contacted you in the linked issue or PR, if one was provided. Thank you for your help!
> - If you are interested in seeing one of the features or enhancements below in Sails core, please create a new pull request moving the relevant item(s) to the backlog table with additional details about your use case (see the updated contribution guide for more information).


Feature                                          | Summary
 :---------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
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

