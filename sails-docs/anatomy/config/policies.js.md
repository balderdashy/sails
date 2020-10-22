# config/policies.js

This file contains the default policies for your app.

Policies are simply Express middleware functions which run before your controllers. You can apply one or more policies to a given controller, or protect just one of it's actions. Any policy file (e.g. `api/policies/isLoggedIn.js`) can be dropped into the `api/policies/` folder, at which point it can be accessed by it's filename, minus the extension, (e.g. `isLoggedIn`).

### Usage

See [`sails.config.policies`](https://sailsjs.com/documentation/reference/configuration/sails-config-policies) for all available options.

<docmeta name="displayName" value="policies.js">
