# Blueprint routes

When you run `sails lift` with blueprints enabled, the framework inspects your models and configuration in order to [bind certain routes](https://sailsjs.com/documentation/concepts/Routes) automatically. These implicit blueprint routes (sometimes called "shadow routes", or even just "shadows") allow your app to respond to certain requests without you having to bind those routes manually in your `config/routes.js` file.  When enabled, the blueprint routes point to their corresponding blueprint *actions* (see "Action routes" below), any of which can be overridden with custom code.

There are four types of blueprint routes in Sails:

### RESTful blueprint routes
REST blueprints are the automatically generated routes Sails uses to expose a conventional REST API for a model, including `find`, `create`, `update`, and `destroy` actions. The path for RESTful routes is always `/:modelIdentity` or `/:modelIdentity/:id`.  These routes use the HTTP "verb" to determine the action to take.

For example, with [`rest`](https://sailsjs.com/documentation/reference/configuration/sails-config-blueprints#?routerelated-settings) enabled, having a `Boat` model in your app generates the following routes:

+ **GET /boat** -> find boats matching criteria provided on the query string, using the [`find` blueprint](https://sailsjs.com/documentation/reference/blueprint-api/find-where).
+ **GET /boat/:id** -> find a single boat with the given unique ID (i.e. primary key) value, using the [`findOne` blueprint](https://sailsjs.com/documentation/reference/blueprint-api/find-one).
+ **POST /boat** -> create a new boat with the attributes provided in the request body, using the [`create` blueprint](https://sailsjs.com/documentation/reference/blueprint-api/create).
+ **PATCH /boat/:id** -> update the boat with the given unique ID with the attributes provided in the request body, using the [`update` blueprint](https://sailsjs.com/documentation/reference/blueprint-api/update).
+ **DELETE /boat/:id** -> destroy the boat with the given unique ID, using the [`destroy` blueprint](https://sailsjs.com/documentation/reference/blueprint-api/destroy).

If the `Boat` model has a &ldquo;to-many&rdquo; relationship with a `Driver` model through an attribute called `drivers`, then the following additional routes would be available:

+ **GET /boat/:id/drivers** -> Finds the drivers' records associated to the boat record with the ID given as `:id` using the [`populate` blueprint](https://sailsjs.com/documentation/reference/blueprint-api/populate-where).
+ **PUT /boat/:id/drivers/:fk** -> add the driver with the unique ID equal to the `:fk` value to the `drivers` collection of the boat with the ID given as `:id`, using the [`add` blueprint](https://sailsjs.com/documentation/reference/blueprint-api/add-to).
+ **DELETE /boat/:id/drivers/:fk** -> remove the driver with the unique ID equal to the `:fk` value to the `drivers` collection of the boat with the ID given as `:id`, using the [`remove` blueprint](https://sailsjs.com/documentation/reference/blueprint-api/remove-from)
+ **PUT /boat/:id/drivers** -> replace the entire `drivers` collection with the drivers whose unique IDs are contained in an array provided as the body of the request, using the [`replace` blueprint](https://sailsjs.com/documentation/reference/blueprint-api/replace).

Depending on the style of app you generated, `rest` blueprint routes may be enabled by default, and could be suitable for use in a production scenario, as long as they are protected by [policies](https://sailsjs.com/documentation/concepts/Policies) to avoid unauthorized access. If you choose the "Web app" template, `rest` blueprint routes will not be enabled by default.

> Be forewarned: Most web apps, microservices, and even REST APIs eventually need custom features that aren't really as simple as "create", "update", or "destroy".  If/when the time comes, don't be afraid to write your own custom actions.  Custom actions and routes can, and in many cases _should_, still be organized as a RESTful API, and they can be mixed and matched with blueprints when necessary.  Best of all, thanks to the introduction of [async/await in Node.js](https://gist.github.com/mikermcneil/c1028d000cc0cc8bce995a2a82b29245), writing custom actions no longer requires the use of callbacks.

<!--
If we keep this, we should find a way to word it better:
In fact, unless you're already familiar with how to customize blueprints in Sails, it's usually a good idea to lean towards using custom actions any time you find yourself unsure whether to continue with REST blueprints or switch to a custom action for a particular feature, it's usually a good idea to lean towards custom actions.
-->

##### Notes

> + If CSRF protection is enabled, you'll need to provide or disable a [CSRF token](https://sailsjs.com/documentation/concepts/security/csrf) for POST/PUT/DELETE actions, otherwise you will get a 403 Forbidden response.
> + If your app contains a controller whose name matches that of your model, then you can override the default actions pointed to by the RESTful routes by providing your own controller actions.  For example, if you have an `api/controllers/BoatController.js` controller file containing a custom `find` action, then the `GET /boat` route will point at that action.
> + Also, as usual, the same logic applies whether you're using controllers or standalone actions.  (As far as Sails is concerned, once an app has been loaded into memory and normalized in `sails lift`, all of its actions look the same no matter where they came from.)
> + If your app contains a route in `config/routes.js` that matches one of the above RESTful routes, it will be used instead of the default route.

### Shortcut blueprint routes
Shortcut routes are a simple (development-mode only) hack that provides access to your models from your browser's URL bar.

The shortcut routes are as follows:

| Route | Blueprint Action | Example URL |
| ----- | ----------------------- | ------- |
| GET /:modelIdentity/find | [find](https://sailsjs.com/documentation/reference/blueprint-api/find-where) | `http://localhost:1337/user/find?name=bob`
| GET /:modelIdentity/find/:id | [findOne](https://sailsjs.com/documentation/reference/blueprint-api/find-one) | `http://localhost:1337/user/find/123`
| GET /:modelIdentity/create | [create](https://sailsjs.com/documentation/reference/blueprint-api/create) | `http://localhost:1337/user/create?name=bob&age=18`
| GET /:modelIdentity/update/:id | [update](https://sailsjs.com/documentation/reference/blueprint-api/update) | `http://localhost:1337/user/update/123?name=joe`
| GET /:modelIdentity/destroy/:id | [destroy](https://sailsjs.com/documentation/reference/blueprint-api/destroy) | `http://localhost:1337/user/destroy/123`
| GET /:modelIdentity/:id/:association/add/:fk | [add](https://sailsjs.com/documentation/reference/blueprint-api/add-to) | `http://localhost:1337/user/123/pets/add/3`
| GET /:modelIdentity/:id/:association/remove/:fk | [remove](https://sailsjs.com/documentation/reference/blueprint-api/remove-from) | `http://localhost:1337/user/123/pets/remove/3`
| GET /:modelIdentity/:id/:association/replace?association=[1,2...] | [replace](https://sailsjs.com/documentation/reference/blueprint-api/replace) | `http://localhost:1337/user/123/pets/replace?pets=[3,4]`

**Shortcut routes should always be disabled when Sails lifts in a production environment.  But they can be very handy during development, especially if you prefer not to use [the terminal](https://sailsjs.com/documentation/reference/command-line-interface/sails-console).**

##### Notes

> + Like RESTful routes, shortcut routes can be overridden by providing an action in a matching controller, or by providing a route in `config/routes.js`.
> + the same _action_ is executed for similar RESTful/shortcut routes.  For example, the `POST /user` and `GET /user/create` routes that Sails creates when it loads `api/models/User.js` will respond by running the same code (even if you [override the blueprint action](https://sailsjs.com/documentation/reference/blueprint-api#?overriding-blueprints))
> + When using a <a href="https://en.wikipedia.org/wiki/NoSQL" target="_blank">NoSQL</a> database (like <a href="https://docs.mongodb.com/" target="_blank">MongoDB</a>) with your model&rsquo;s [`schema` configuration](https://sailsjs.com/documentation/concepts/models-and-orm/model-settings#?schema) set to `false`, shortcut routes will interpret any parameter value for an unknown attribute as a _string_.  Be careful doing `http://localhost:1337/game/create?players=2` if you don&rsquo;t have a `players` attribute with a `number` type!

### Action shadow routes

When action shadow routes (or "action shadows") are enabled, Sails will automatically create routes for your custom controller actions.  This is sometimes useful (especially early on in the development process) for speeding up backend development by eliminating the need to manually bind routes.  When enabled, GET, POST, PUT, and DELETE routes will be generated for every one of a controller's actions.

For example, if you have a `FooController.js` file with a `bar` method, then a `/foo/bar` route will automatically be created for you as long as `sails.config.blueprints.actions` is enabled.  Unlike RESTful and shortcut shadows, implicit, per-action shadow routes do *not* require that a controller has a corresponding model file.

If an `index` action exists, additional naked routes will be created for it. Finally, all `actions` blueprints support an optional path parameter, `id`, for convenience.

Since Sails v1.0, action shadows are **disabled by default**. They can be OK for production-- however, if you'd like to continue to use controller/action autorouting in a production deployment, you must take great care not to inadvertently expose unsafe/unintentional controller logic to GET requests. You can easily turn off a particular method or path in your [`/config/routes.js`](https://sailsjs.com/documentation/anatomy/my-app/config/routes-js) file using the [response target syntax](https://sailsjs.com/documentation/concepts/routes/custom-routes#?response-target-syntax), for example:

```javascript
'POST /user': {response: 'notFound'}
```

##### Notes
> + Action routes respond to _all_ HTTP verbs (GET, PUT, POST, etc.).  You can use `req.method` inside an action to determine which method was used.

##### "Index" actions

When action shadows (`sails.config.blueprints.actions`) are enabled, an additional, root shadow route is automatically exposed for any actions that happen to be named `index`.  For example, if you have a `FooController.js` file with an `index` action in it, a `/foo` shadow route will automatically be bound for that action.  Similarly, if you have a [standalone action](https://sailsjs.com/documentation/concepts/actions-and-controllers#?standalone-actions) at `api/controllers/foo/index.js`, a `/foo` route will be exposed automatically on its behalf.

<!--
TODO: check on this (it's unclear what point it was trying to get across):

> Note:  Action shadows come with a special exception for top-level standalone actions.  For example, if you have a standalone action at `api/controllers/index.js`, it will be bound to a `/` shadow route automatically.

-->

Read more about [configuring blueprints in Sails](https://sailsjs.com/documentation/reference/configuration/sails-config-blueprints), including how to enable / disable different categories of blueprint routes.


<docmeta name="displayName" value="Blueprint routes">
