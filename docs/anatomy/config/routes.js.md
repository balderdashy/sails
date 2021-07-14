# config/routes.js

This file contains custom routes.  Sails uses these routes to determine what to do each time it receives a request.

If Sails receives a URL that doesn't match any of the [custom routes](https://sailsjs.com/documentation/concepts/routes/custom-routes) in this file, it will check for matching [assets](https://sailsjs.com/documentation/concepts/assets) (images, scripts, stylesheets, etc.). Finally, if those don't match either, the [default 404 handler](https://sailsjs.com/documentation/reference/response-res/res-not-found) is triggered.

When you first generate your Sails app, there is only one route in this file.  Its job is to serve the home page.

You'll probably want to add some more.

> Sails also injects _shadow routes_, or implicit routes that handle certain kinds of requests behind the scenes.  For more information about these kinds of routes, see **[Concepts > Blueprints](https://sailsjs.com/documentation/concepts/blueprints)**.

### Usage

See [`sails.config.routes`](https://sailsjs.com/documentation/reference/configuration/sails-config-routes) for all available options.

<docmeta name="displayName" value="routes.js">
