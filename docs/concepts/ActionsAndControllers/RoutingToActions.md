# Routing to actions

### Manual routing

By default, controller actions in your Sails app will be inaccessible to users until you _bind_ them to a route in your [`config/routes.js` file](https://sailsjs.com/documentation/reference/configuration/sails-config-routes).  When you bind a route, you specify a URL that users can access the action at, along with options like [CORS security settings](https://sailsjs.com/documentation/concepts/security/cors#?configuring-cors-for-individual-routes).

To bind a route to an action in the `config/routes.js` file, you can use the HTTP verb and path (i.e. the **route address**) as the key, and the action identity as the value (i.e. the **route target**).

For example, the following manual route will cause your app to trigger the `make` action in `api/controllers/SandwichController.js` whenever it receives a POST request to `/make/a/sandwich`:

```js
  'POST /make/a/sandwich': 'SandwichController.make'
```

If you&rsquo;re using standalone actions, so that you had an `api/controllers/sandwich/make.js` file, a more intuitive syntax exists which uses the path to the action (relative to `api/controllers`):

```js
  'POST /make/a/sandwich': 'sandwich/make'
```

For a full discussion of routing, please see the [routes documentation](https://sailsjs.com/documentation/concepts/Routes).

### Automatic routing

Sails can also automatically bind routes to your controller actions so that a `GET` request to `/:actionIdentity` will trigger the action.  This is called _blueprint action routing_, and it can be activated by setting `actions` to `true` in the [`config/blueprints.js`](https://sailsjs.com/documentation/reference/configuration/sails-config-blueprints) file.  For example, with blueprint action routing turned on, a `signup` action saved in `api/controllers/UserController.js` or `api/controllers/user/signup.js` would be bound to a `/user/signup` route.  See the [blueprints documentation](https://sailsjs.com/documentation/reference/blueprint-api) for more information about Sails&rsquo; automatic route binding.


<docmeta name="displayName" value="Routing to actions">
