# Changelog 0.9.7
_October 10, 2013_
+ Complete improvement/refactoring of configuration loader (fixes bugs)
+ Complete improvement/refactoring of ORM loader (fixes bugs)
+ Continued improvements of tests
+ Include a modified version of consolidate to better support view engines
+ Blueprints are now configurable per-controller (thanks [@xdissent](https://github.com/xdissent), and everyone else who helped!)
+ (waiting to expose this and deprecate the old behavior in the docs until the next minor release to avoid causing any breaking changes)
+ New `prefix` option in global blueprint config, as well as per-controller.
+ New `jsonp` option in global controller config, as well as per-controller.
+ New `pluralize` option in global controller config, as well as per-controller.

+ Models can now easily use one or more custom named connections which use different adapters
+ (waiting to expose this and deprecate the old behavior in the docs until the next minor release to avoid causing any breaking changes)

+ Adds configurable default behavior for 403/404/500/400 HTTP status code error cases.
+ (waiting to expose this and deprecate the old behavior in the docs until the next minor release to avoid causing any breaking changes)

+ Properly namespace the io in bundled sails.io.js client in new projects (thanks [@drosen0](https://github.com/drosen0))
+ Better handle crash scenario, particularly in nodemon (thanks [@edy](https://github.com/edy))

> Thanks to everyone else I missed, and to everyone else who helped out with this release!

<docmeta name="displayName" value="0.9.7 Changelog">
<docmeta name="version" value="0.9.7">
