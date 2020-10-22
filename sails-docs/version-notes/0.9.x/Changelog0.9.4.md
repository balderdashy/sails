# Changelog 0.9.4
_September 5, 2013_
+ Improved CSRF prevention support (thanks to [@sgress454](https://github.com/sgress454))
+ Support for CORS (thanks to [@sgress454](https://github.com/sgress454))
+ CoffeeScript supported client-side by default in gruntfile thanks to @reecelewellen
+ Improves/fixes internationalization (thanks to [@xdissent](https://github.com/xdissent) and [@silvinci](https://github.com/silvinci))
+ Removed vanilla HAML support and tests since it was incomplete (jade is still supported)
+ Config: Sails core is no longer automatically copied as a dependency during `sails new`. This speeds up the process significantly and avoids occassional recursive copy death spirals.
+ Config: Added explicit `--port` option to `sails lift`.
+ Sockets: Added query string parsing to requests.
+ Sockets: Headers can now be specified in requests (**_This has implications on full compatibility w/ most Express middleware!_**)
+ Routing: Fixed issues with default 404 and 500 responses.
+ Other minor bug fixes/inconsistencies and documentation enhancements

> And thanks a ton to anybody I left out! Send me a message on twitter and I'll add you.

<docmeta name="displayName" value="0.9.4 Changelog">
<docmeta name="version" value="0.9.4">
