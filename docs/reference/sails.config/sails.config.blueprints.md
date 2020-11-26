# `sails.config.blueprints`

These configurable settings allow you to configure the blueprint API in Sails.  Some settings (like `sails.config.blueprints.autoWatch`) control the behavior of built-in [blueprint actions](https://sailsjs.com/documentation/concepts/blueprints/blueprint-actions), whereas others (like `sails.config.blueprints.shortcuts`) tweak the behavior of implicit [blueprint routing](https://sailsjs.com/documentation/concepts/blueprints/blueprint-actions) and/or determine whether Sails automatically binds certain kinds of blueprint routes at all.

> Remember, blueprint actions can be attached to your custom routes _regardless of whether or not_ you have any kind of implicit blueprint routing enabled.

### Properties

##### Route-related settings

| Property    | Type       | Default   | Details |
|:------------|:----------:|:----------|:--------|
| `actions`| ((boolean))|`false`| Whether implicit blueprint ("shadow") routes are automatically generated for every action in your app. e.g. having an `api/controllers/foo/bar.js` file or a `bar` function in `api/controllers/FooController.js` would automatically route incoming requests to `/foo/bar` to that action, as long as it is not overridden by a [custom route](https://sailsjs.com/documentation/concepts/routes/custom-routes).  When enabled, this setting _also_ binds additional, special implicit ("shadow") routes to any actions named `index`, and for the relative "root" URL for your app and each of its controllers.  For example, a `/foo` shadow route for `api/controllers/foo/index.js`, or a `/` shadow route for `api/controllers/index.js`.
|`rest`|((boolean))|`true`|Automatic REST blueprints enabled? e.g. `'get /:model/:id?'` `'post /:model'` `'put /:model/:id'` `'delete /:model/:id'`.
|`shortcuts`|((boolean))|`true`|These CRUD shortcuts exist for your convenience during development, but you'll want to disable them in production.: `'/:model/find/:id?'`, `'/:model/create'`, `'/:model/update/:id'`, and `'/:model/destroy/:id'`.
| `prefix`      | ((string))| `''`     | Optional mount path prefix (e.g. '/api/v2') for all [blueprint routes](https://sailsjs.com/documentation/concepts/blueprints/blueprint-routes), including `rest`, `actions`, and `shortcuts`.  This only applies to implicit blueprint ("shadow") routes, not your [custom routes](https://sailsjs.com/documentation/concepts/routes/custom-routes).
| `restPrefix`  | ((string))| `''`     | Optional mount path prefix for all REST blueprint routes on a controller, e.g. '/api/v2'. (Does not include `actions` and `shortcuts` routes.) This allows you to take advantage of REST blueprint routing, even if you need to namespace your RESTful API methods.  Will be joined to your `prefix` config, e.g. `prefix: '/api'` and `restPrefix: '/rest'`. RESTful actions will be available under `/api/rest`.
|`pluralize`|((boolean))|false| Whether to use plural model names in blueprint routes, e.g. `/users` for the `User` model. (This only applies to blueprint autoroutes, not manual routes from `sails.config.routes`.)


##### Action-related settings

| Property    | Type       | Default   | Details |
|:------------|:----------:|:----------|:--------|
|`autoWatch`|((boolean))|`true`| Whether to subscribe the requesting socket in the `find` and `findOne` blueprint action to notifications about newly _created_ records via the blueprint API.
|`parseBlueprintOptions`|((function))|(See below)|Provide this function in order to override the default behavior for blueprint actions (including search criteria, skip, limit, sort and population).

##### Using `parseBlueprintOptions`

Each blueprint action includes, at its core, a Waterline model method call.  For instance, the `find` blueprint, when run for the `User` model, runs `User.find()` in order to retrieve some user records.  The options that are passed to these Waterline methods are determined by a call to `parseBlueprintOptions()`.  The default version of this method (available via `sails.hooks.blueprints.parseBlueprintOptions()`) determines the default behaviors for blueprints.  You can override `parseBlueprintOptions` in your [blueprints config](https://sailsjs.com/documentation/reference/configuration/sails-config-blueprints) (in [`config/blueprints.js`](https://sailsjs.com/documentation/anatomy/config/blueprints.js)) to customize the behavior for _all_ blueprint actions, or on a [per-route basis](https://sailsjs.com/documentation/concepts/routes/custom-routes#?route-target-options) to customize the behavior for a single route.

The `parseBlueprintOptions()` method takes a single argument (the [request object](https://sailsjs.com/documentation/reference/request-req)) and is expected to return a dictionary of Waterline query options.  (You can review an unrealistically-expanded example of a such a dictionary [here](https://gist.github.com/mikermcneil/1b87af6b6a8458254deb83a6d1cf264f), but keep in mind that not all keys apply to all blueprint actions. See [source code in Sails code](https://github.com/balderdashy/sails/tree/v1.2.2/lib/hooks/blueprints/actions) for complete details).

Adding your own `parseBlueprintOptions()` is an advanced concept, and it is recommended that you first familiarize yourself with the [default method code](https://github.com/balderdashy/sails/blob/v1.2.2/lib/hooks/blueprints/parse-blueprint-options.js) and use it as a starting point.  For small modifications to blueprint behavior, it is best to first call the default method inside your override and then make changes to the returned query options:

```js
parseBlueprintOptions: function(req) {

  // Get the default query options.
  var queryOptions = req._sails.hooks.blueprints.parseBlueprintOptions(req);

  // If this is the "find" or "populate" blueprint action, and the normal query options
  // indicate that the request is attempting to set an exceedingly high `limit` clause,
  // then prevent it (we'll say `limit` must not exceed 100).
  if (req.options.blueprintAction === 'find' || req.options.blueprintAction === 'populate') {
    if (queryOptions.criteria.limit > 100) {
      queryOptions.criteria.limit = 100;
    }
  }

  return queryOptions;

}
```


<docmeta name="displayName" value="sails.config.blueprints">
<docmeta name="pageType" value="property">
