# Available hooks


This page is meant to be an up to date, comprehensive list of all of the core hooks in the Sails.js framework, and a reference of a few of the most popular community-made hooks.

### Core hooks

The following hooks are maintained by the Sails.js core team and are included in your Sails app by default. You can override or disable them using your [sailsrc file](https://sailsjs.com/documentation/concepts/configuration/using-sailsrc-files) or [environment variables](https://sailsjs.com/documentation/concepts/configuration#?setting-sailsconfig-values-directly-using-environment-variables).

| Hook           | Package       | Latest stable release   | Purpose     |
|:---------------|---------------|-------------------------|:------------|
| `grunt`        | [sails-hook-grunt](https://npmjs.com/package/sails-hook-grunt)      | [![NPM version](https://badge.fury.io/js/sails-hook-grunt.png)](http://badge.fury.io/js/sails-hook-grunt)     | Governs the built-in asset pipeline in Sails.
| `orm`          | [sails-hook-orm](https://npmjs.com/package/sails-hook-orm)          | [![NPM version](https://badge.fury.io/js/sails-hook-orm.png)](http://badge.fury.io/js/sails-hook-orm)         | Implements support for Waterline ORM in Sails.
| `sockets`      | [sails-hook-sockets](https://npmjs.com/package/sails-hook-sockets)  | [![NPM version](https://badge.fury.io/js/sails-hook-sockets.png)](http://badge.fury.io/js/sails-hook-sockets) | Implements Socket.io support in Sails.

### sails-hook-orm

Implements support for the Waterline ORM in Sails.

[![Release info for sails-hook-orm](https://img.shields.io/npm/dm/sails-hook-orm.svg?style=plastic)](http://npmjs.com/package/sails-hook-orm) &nbsp; [![License info](https://img.shields.io/npm/l/sails-hook-orm.svg?style=plastic)](http://npmjs.com/package/sails-hook-orm)

> + The default configuration set by this hook can be found [here](https://www.npmjs.com/package/sails-hook-orm#implicit-defaults).
> + You can find futher details about this hook's purpose [here](https://www.npmjs.com/package/sails-hook-orm#purpose).
> + You can disable this hook by following [these instructions](https://www.npmjs.com/package/sails-hook-orm#can-i-disable-this-hook).


### sails-hook-sockets

Implements socket.io support in Sails.

[![Release info for sails-hook-sockets](https://img.shields.io/npm/dm/sails-hook-sockets.svg?style=plastic)](http://npmjs.com/package/sails-hook-sockets) &nbsp; [![License info](https://img.shields.io/npm/l/sails-hook-sockets.svg?style=plastic)](http://npmjs.com/package/sails-hook-sockets)

> + You can find futher details about this hook's purpose [here](https://www.npmjs.com/package/sails-hook-sockets#purpose).

### sails-hook-grunt

Implements support for the built-in asset pipeline and task runner in Sails.

[![Release info for sails-hook-grunt](https://img.shields.io/npm/dm/sails-hook-grunt.svg?style=plastic)](http://npmjs.com/package/sails-hook-grunt) &nbsp; [![License info](https://img.shields.io/npm/l/sails-hook-grunt.svg?style=plastic)](http://npmjs.com/package/sails-hook-grunt)

> + You can find futher details about this hook's purpose [here](https://www.npmjs.com/package/sails-hook-grunt#purpose).
> + You can disable this hook by following [these instructions](https://www.npmjs.com/package/sails-hook-grunt#can-i-disable-this-hook).


### Community-made hooks

There are more than 200 community hooks for Sails.js [available on NPM](https://www.npmjs.com/search?q=sails+hook). Here are a few highlights:

| Hook        | Maintainer  | Purpose        | Stable release |
|-------------|-------------|:---------------|----------------|
| [sails-hook-webpack](https://www.npmjs.com/package/sails-hook-webpack) | [Michael Diarmid](https://github.com/Salakar) | Use Webpack for your Sails app's asset pipeline instead of Grunt. | [![Release info for sails-hook-webpack](https://img.shields.io/npm/dm/sails-hook-webpack.svg?style=plastic)](http://npmjs.com/package/sails-hook-webpack)
| [sails-hook-postcss](https://www.npmjs.com/package/sails-hook-postcss) | [Jeff Jewiss](https://github.com/jeffjewiss)| Process your Sails application’s CSS with Postcss. | [![Release info for sails-hook-postcss](https://img.shields.io/npm/dm/sails-hook-postcss.svg?style=plastic)](http://npmjs.com/package/sails-hook-postcss)
| [sails-hook-babel](https://www.npmjs.com/package/sails-hook-babel) |  [Onoshko Dan](https://github.com/dangreen), [Markus Padourek](https://github.com/globegitter) &amp; [SANE](http://sanestack.com/) | Process your Sails application’s CSS with Postcss. | [![Release info for sails-hook-babel](https://img.shields.io/npm/dm/sails-hook-babel.svg?style=plastic)](http://npmjs.com/package/sails-hook-babel)
| [sails-hook-responsetime](https://www.npmjs.com/package/sails-hook-responsetime) | [Luis Lobo Borobia](https://github.com/luislobo)| Add X-Response-Time to both HTTP and Socket request headers. | [![Release info for sails-hook-responsetime](https://img.shields.io/npm/dm/sails-hook-responsetime.svg?style=plastic)](http://npmjs.com/package/sails-hook-responsetime)
| [sails-hook-winston](https://www.npmjs.com/package/sails-hook-winston) | [Kikobeats](https://github.com/Kikobeats) | Integrate the Winston logging system with your Sails application. | [![Release info for sails-hook-winston](https://img.shields.io/npm/dm/sails-hook-winston.svg?style=plastic)](http://npmjs.com/package/sails-hook-winston)
| [sails-hook-allowed-hosts](https://www.npmjs.com/package/sails-hook-allowed-hosts) | [Akshay Bist](https://github.com/elssar) | Ensure that only requests made from authorized hosts/IP addresses are allowed. | [![Release info for sails-hook-allowed-hosts](https://img.shields.io/npm/dm/sails-hook-allowed-hosts.svg?style=plastic)](http://npmjs.com/package/sails-hook-allowed-hosts)
| [sails-hook-cron](https://www.npmjs.com/package/sails-hook-cron) | [Eugene Obrezkov](https://github.com/ghaiklor) | Run cron tasks for your Sails app. | [![Release info for sails-hook-cron](https://img.shields.io/npm/dm/sails-hook-cron.svg?style=plastic)](http://npmjs.com/package/sails-hook-cron)
| [sails-hook-organics](https://www.npmjs.com/package/sails-hook-organics) | [Mike McNeil](https://github.com/mikermcneil) | Exposes a set of commonly-used functions ("organics") as built-in helpers in your Sails app. | [![Release info for sails-hook-organics](https://img.shields.io/npm/dm/sails-hook-organics.svg?style=plastic)](http://npmjs.com/package/sails-hook-organics)


##### Add your hook to this list

If you see out of date information on this page, or if you want to add a hook you made, please submit a pull request to this file updating the table of community hooks above.

Note: to be listed on this page, an adapter must be free and open-source (_libre_ and _gratis_), preferably under the MIT license.


<docmeta name="displayName" value="Available hooks">
