# Sails Changelog

### master

* [ENHANCEMENT] Support CSRF hook route configuration [#2366](https://github.com/balderdashy/sails/issues/2366)
* [BUGFIX] Fix [RangeError: Maximum call stack size exceeded] error in PubSub hook
* [ENHANCEMENT] Support layout for Ractive template engine


### 0.11.0

* [BUGFIX] Blueprint ignoring defaultLimit from controller's _config
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
