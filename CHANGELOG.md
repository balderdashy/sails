# Sails Changelog

### master

* [FEATURE] Added request logging via [morgan](https://github.com/expressjs/morgan) [#2432](https://github.com/balderdashy/sails/pull/2432) as well as options in `http.js` to configure settings
* [ENHANCEMENT] Upgrade express and skipper because of security vulnerabilities
* [BUGFIX] Fix Sails crashes if Redis goes down [#2277](https://github.com/balderdashy/sails/pull/2277)
* [BUGFIX] Fix crash when using sessionless requests over WebSockets [#2107](https://github.com/balderdashy/sails/pull/2107)
* [ENHANCEMENT] Allow hooks to be installed in node_modules and dynamic changing of hook name
* [ENHANCEMENT] Checking npm-version on install
* [ENHANCEMENT] Updated "skipAssets" regex to ignore query string

### 0.10.5

* [ENHANCEMENT] Updated `waterline` to `~0.10.9`
* [ENHANCEMENT] Added new `routesDisabled` option for CSRF [#2121](https://github.com/balderdashy/sails/pull/2121)
* [ENHANCEMENT] Refactoring and cleanup.
* [ENHANCEMENT] Switched from `express3-handlebars` to `express-handlebars`
* [BUGFIX] Add missing require for async module [#2101](https://github.com/balderdashy/sails/pull/2101)
