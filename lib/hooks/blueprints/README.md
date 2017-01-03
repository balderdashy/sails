# sails-hook-blueprints

Implements support for the blueprint API in Sails.

> This is a core hook in the Sails.js framework.  You can override or disable it using your `.sailsrc` file or environment variables.  See [Concepts > Configuration](http://sailsjs.com/docs/concepts/configuration) for more information.


## Purpose

This hook's responsibilities are:

1. Use `sails.modules` to read blueprints from the user's app into `self.middleware`.
2. Bind shadow routes to blueprint actions and controller actions.
3. Listen for `route:typeUnknown` on `sails`, interpret route syntax which should match a blueprint action, and bind the appropriate middleware (this happens when the Router is loaded, after all the hooks.)


## Help

Have questions or having trouble?  Click [here](http://sailsjs.com/support).

> For more information on overriding core hooks, check out [Extending Sails > Hooks](http://sailsjs.com/documentation/concepts/extending-sails/hooks).


## Bugs &nbsp; [![NPM version](https://badge.fury.io/js/sails-hook-blueprints.svg)](http://npmjs.com/package/sails-hook-blueprints)

To report a bug, [click here](http://sailsjs.com/bugs).


## Contributing

Please observe the guidelines and conventions laid out in the [Sails project contribution guide](http://sailsjs.com/documentation/contributing) when opening issues or submitting pull requests.

[![NPM](https://nodei.co/npm/sails-hook-blueprints.png?downloads=true)](http://npmjs.com/package/sails-hook-blueprints)

## License

The [Sails framework](http://sailsjs.com) is free and open-source under the [MIT License](http://sailsjs.com/license).
