# Sails Changelog

### master
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

### 0.11.4

* [SECURITY] Updated several dependencies due to security vulnerabilities (https://github.com/balderdashy/sails/issues/3464#issuecomment-169255559)

### 0.11.3

* [BUGFIX] Fix [RangeError: Maximum call stack size exceeded] error in PubSub hook (https://github.com/balderdashy/sails/issues/2636)
* [ENHANCEMENT] Allow custom route options in policy target syntax (https://github.com/balderdashy/sails/commit/0990fc10709520a9f6c55923b991708d5eaf8aa0)
* [ENHANCEMENT] Support CSRF hook route configuration [#2366](https://github.com/balderdashy/sails/issues/2366)
* [ENHANCEMENT] Added "exposeHeaders" option in CORS configuration (https://github.com/balderdashy/sails/pull/2712)

### 0.11.2

* [BUGFIX] Fixes to allow proper installation / execution in environments using Node 4 and/or NPM 3.

### 0.11.1

* Shhhh nothing to see here (version skipped)

### 0.11.0

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


### 0.10.5

* [ENHANCEMENT] Updated `waterline` to `~0.10.9`
* [ENHANCEMENT] Added new `routesDisabled` option for CSRF [#2121](https://github.com/balderdashy/sails/pull/2121)
* [ENHANCEMENT] Refactoring and cleanup.
* [ENHANCEMENT] Switched from `express3-handlebars` to `express-handlebars`
* [BUGFIX] Add missing require for async module [#2101](https://github.com/balderdashy/sails/pull/2101)
