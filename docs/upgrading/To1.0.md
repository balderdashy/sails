# Upgrading to Sails v1.0

Sails v1.0 is here!  Keep reading for a high-level overview of what's changed in this release, and to learn about some new features you might want to take advantage of in your app.


### A note about breaking changes
While working on this version of Sails, a lot of the decisions we made favored a better developer experience over backwards compatibility. Because of this, the upgrade to Sails 1.0 will involve dealing with more breaking changes than previous versions. But when you're finished, there'll be a much better chance that the features you're using in Sails are things that its author and maintainers understand thoroughly and use almost every day.

For more about the philosophy behind many of the breaking changes in 1.0, you can read Mike McNeil's in-depth explanation [here](https://gitter.im/balderdashy/sails?at=5a1d8fcd3a80a84b5b907099).


### Upgrading an existing app using the automated tool

Ready to upgrade your existing v0.12.x Sails app to version 1.0?  To get started, we recommend using the Sails 1.0 upgrade tool, which will help with some of the most common migration tasks.  To use the tool, first install Sails 1.0 globally with `npm install -g sails@^1.0.0` and then run `sails upgrade`.  After the tool runs, it will create a report for you with a list of remaining items that need to be manually upgraded.

### Upgrading an existing app manually

The checklist below covers the changes most likely to affect the majority of apps.

If your app still has errors or warnings on startup after following this checklist, or if you're seeing something unexpected, head back to this document and take a look further down the page.  (One of the guides for covering various app components will probably be applicable.)

> We've done a lot of work to make the upgrade process as seamless as possible, particularly when it comes to the errors and warnings you'll see on the console.  But if you're stumped or have lingering questions about any of the changes below, feel free to [drop by the Sails community Gitter channel](https://sailsjs.com/support).  (If your company is using Sails Flagship, you can also chat directly with the Sails core team [here](https://flagship.sailsjs.com/ask).)

### tl;dr checklist: things you simply _must_ do when upgrading to version 1.0

The upgrade tool does its best to help with some of these items, but it won&rsquo;t change your app-specific code for you!

+ **Step 0**: Check your Node version
+ **Step 1**: Install hooks & update dependencies
+ **Step 2**: Update configuration
+ **Step 3**: Modify client-side code for the new blueprint API
+ **Step 4**: Adopt the new release of Waterline ORM

##### Step 0: Check your Node version!

If your app needs to support Node versions earlier than v4, you will not be able to upgrade to Sails 1.0, as Sails 1.0 no longer supports Node v0.x. The earliest version of Node supported by Sails 1.0 is Node 4.x.

##### Step 1: Install hooks & update dependencies
Sails v1 introduces [custom builds](https://github.com/balderdashy/sails/pull/3504).  This means that certain core hooks are now installed as direct dependencies of your app, giving you more control over your dependencies and making `npm install sails` run _considerably_ faster.  So, the first thing you'll need to do is install the core hooks you're using.  (And while you're at it, be sure to update the other dependencies mentioned in the list below.)

* **Install the `sails-hook-orm` package** into your app with `npm install --save sails-hook-orm`, unless your app has the ORM hook disabled.
* **Install the `sails-hook-sockets` package** into your app with `npm install --save sails-hook-sockets`, unless your app has the sockets hook disabled.
* **Install the `sails-hook-grunt` package** into your app with `npm install --save sails-hook-grunt`, unless your app has the Grunt hook disabled.
* **Install the latest version of your database adapter**.  For example, if you're using `sails-mysql`, do `npm install --save sails-mysql@latest`.
* **Upgrade your `sails.io.js` websocket client** with `sails generate sails.io.js`.  See the ["Websockets" section below](https://sailsjs.com/documentation/upgrading/to-v-1-0/#?websockets) for more details.


##### Step 2: Update configuration
Sails v1 comes with several improvements in app configuration. For example, automatic install of lodash and async can now be customized to any version, and view engine configuration syntax is now consistent with that of Express v4+. The most significant change to configuration, however, is related to one of the most exciting new features in Sails v1: [datastores](https://sailsjs.com/documentation/reference/waterline-orm/datastores).  To make sure you correctly upgrade the configuration for your database(s) and other settings, be sure to carefully read through the steps below and apply the necessary changes.

* **Update your `config/globals.js` file** (unless your app has `sails.config.globals` set to `false`)
  + Set `models` and `sails` to have boolean values (`true` or `false`).
  + Set `async` and `lodash` to either have `require('async')` and `require('lodash')` respectively, or else `false`. You may need to `npm install --save lodash` and `npm install --save async`, as well.
* **Comment out any database configuration your aren&rsquo;t using** in `config/connections.js`.  Unlike previous versions, Sails 1.0 will load _all_ database adapters that are referenced in config files, regardless of whether they are actually used by a model.  See the [migration guide section on database configuration](https://sailsjs.com/documentation/upgrading/to-v-1-0/#?changes-to-database-configuration) for more info.
* **The `/csrfToken` route** is no longer provided to all apps by default when using CSRF.  If you're utilizing this route in your app, you'll need to manually add it to `config/routes.js` as `'GET /csrfToken': { action: 'security/grant-csrf-token' }`.
* **If your app relies on [action shadow routes](https://sailsjs.com/documentation/concepts/blueprints/blueprint-routes#?action-routes)** (where every custom controller action is automatically mapped to a route), you&rsquo;ll need to update your `config/blueprints.js` file and set `actions` to `true`.  This setting is now `false` by default.
* **If your app uses CoffeeScript or TypeScript** see the [CoffeeScript](https://sailsjs.com/documentation/tutorials/using-coffee-script) and [TypeScript](https://sailsjs.com/documentation/tutorials/using-type-script) tutorials for update information.
* **If your app uses a view engine other than EJS**, you&rsquo;ll need to configure it yourself in the `config/views.js` file, and you'll likely need to run `npm install --save consolidate` for your project.  See the "Views" section below for more details.
* **If your `api` or `config` folders and subfolders contain any non-source files**, they&rsquo;ll need to be moved.  The exception is for Markdown (.md) and text (.txt) files, which will continue to be ignored.  Sails will attempt to read all other files in those folders as code, allowing for more flexibility in choosing between Javascript dialects (see the notes about CoffeeScript and TypeScript above).

##### Step 3: Modify client-side code for the new blueprint API
As well as having been expanded to include a new endpoint, there also are a couple of minor&mdash;but breaking&mdash;changes to the blueprint API that may require you to make changes to your client-side code.

* **If your app uses blueprint routes**, be aware that a couple of implicit "shadow" routes have had their HTTP method (aka verb) changed:
  + the RESTful blueprint route address for [**add**](https://sailsjs.com/documentation/reference/blueprint-api/add-to) has changed from `POST` to `PUT`.
  + the RESTful blueprint route address for [**update**](https://sailsjs.com/documentation/reference/blueprint-api/update) has changed from `PUT` to `PATCH`.
* **If your app relies on the default socket notifications from blueprint actions**, be aware that there have been some performance-related upgrades that change the structure of these messages somewhat:
  + Sails no longer publishes separate `addedTo` notifications, one for each new member of a collection. Those individual notifications are now rolled up into a single notification, and the new message contains an array of ids (`addedIds`) instead of just one.
  + Sails no longer publishes separate `removedFrom` notifications, one for each former member of a collection. Sails now rolls those up into a single notification, and the new message now contains an array of ids (`removedIds`) instead of just one.


##### Step 4: Adopt the new release of Waterline ORM
The new release of Waterline ORM (v0.13) introduces full support for SQL transactions, the ability to include or omit attributes in result sets (aka "projections"), dynamic database connections, and more extensive granular control over query behavior.  It also includes a major stability and performance overhaul, which comes with a few breaking changes to usage.  The bullet points below cover the most common issues you're likely to run into with the Waterline upgrade.

* **If your app relies on getting records back from `.create()`, `.createEach()`, `.update()`, or `.destroy()` calls**, you&rsquo;ll need to update your model settings to indicate that you want those methods to fetch records (or chain a `.fetch()` to individual calls).  See the [migration guide section on `create()`, `.createEach()`, `.update()`, and `.destroy()` results](https://sailsjs.com/documentation/upgrading/to-v-1-0/#?changes-to-create-createeach-update-and-destroy-results) for more info.
* **If your app relies on using the `.add()`, `.remove()`, and `.save()` methods to modify collections**, you will need to update them to use the new [.addToCollection](https://sailsjs.com/documentation/reference/waterline-orm/models/add-to-collection), [.removeFromCollection](https://sailsjs.com/documentation/reference/waterline-orm/models/remove-from-collection), and [.replaceCollection](https://sailsjs.com/documentation/reference/waterline-orm/models/replace-collection) model methods.
* **Waterline queries will now rely on the database for case sensitivity.** This means that in most adapters your queries will now be case-sensitive, whereas before they were not. This may have unexpected consequences if you are used to having case-insensitive queries. For more information on how to manage this for databases such as MySQL, see the [case sensitivity docs](https://sailsjs.com/documentation/concepts/models-and-orm/models#?case-sensitivity).
* **Waterline no longer supports nested creates or updates**, and this change extends to the related blueprints.  If your app relies on these features, see the [migration guide section on nested creates and updates](https://sailsjs.com/documentation/upgrading/to-v-1-0/#?nested-creates-and-updates) for more info.
* **If your app sets a model attribute to `null`** using `.create()`, `.findOrCreate()` or `.update()`, you&rsquo;ll need to change the type of that attribute to `json`, or use the base value for the existing attribute type, instead of `null` (e.g. `0` for numbers).  See [the validations docs](https://sailsjs.com/documentation/concepts/models-and-orm/validations#?null-and-empty-string) for more info.
* **The `create` blueprint response is now fully populated**, just like responses from `find`, `findOne`, `update` and `destroy`.  To suppress population of records, add a `parseBlueprintOptions` to your blueprints config or to a specific route.  See the [blueprints configuration reference](https://sailsjs.com/documentation/reference/configuration/sails-config-blueprints#?using-parseblueprintoptions) for more information.
* **If you're using `createEach`** to insert large numbers of rows into a database, keep in mind that the Sails 1.0-compatible versions of most adapters now optimize the `createEach` method to use a single query, instead of using one query per row.  Depending on your database, per-request data size limits may apply.  See the [notes at the bottom of the `.createEach()` reference page](https://sailsjs.com/documentation/reference/waterline-orm/models/create-each#?notes) for more information.
* **The `size` property for attributes** is no longer supported.  Instead, you may indicate column size using [the `columnType` property](https://sailsjs.com/documentation/concepts/models-and-orm/attributes#?columntype).
* **The `defaultsTo` property for attributes may no longer be defined as a function.** Instead, you will either need to hard-code a default value, or remove the `defaultsTo` entirely and update your code to determine the appropriate value for the attribute before creating new records. (This can either be handled before calls to `.create()`/`.createEach()` in your actions, or in the model's [`beforeCreate`](https://sailsjs.com/documentation/concepts/models-and-orm/lifecycle-callbacks#?lifecycle-callbacks-on-create)).



### Other breaking changes

The upgrade guide above provides for the most common upgrade issues that Sails contributors have encountered when upgrading various apps between version 0.12 and version 1.0. Every app is different, though, so we recommend reading through the points below, as well.  Not all of the changes discussed will necessarily apply to your app, but some might.

* **Several properties and methods on `req` now work a little differently:**
  * `req.accepted` has been replaced with [`req.accepts()`](https://sailsjs.com/documentation/reference/request-req/req-accepts)
  * `req.acceptedLanguages` and `req.acceptsLanguage()` have been replaced with [`req.acceptsLanguages()`](https://sailsjs.com/documentation/reference/request-req/req-accepts-languages)
  * `req.acceptedCharsets` and `req.acceptsCharset()` have been replaced with [`req.acceptsCharsets()`](https://sailsjs.com/documentation/reference/request-req/req-accepts-charsets)
* **Several `req.options` properties related to blueprints are no longer supported.**  Instead, the new `parseBlueprintOptions` method can be used to give you complete control over blueprint behavior.  See the [blueprints configuration reference](https://sailsjs.com/documentation/reference/configuration/sails-config-blueprints#?using-parseblueprintoptions) for more information.
* **The `defaultLimit` and `populate` blueprint configuration options are no longer supported.** Instead, the new `parseBlueprintOptions` method can be used to give you complete control over blueprint behavior.  See the [blueprints configuration reference](https://sailsjs.com/documentation/reference/configuration/sails-config-blueprints#?using-parseblueprintoptions) for more information.
* **The `.findOne()` query method no longer supports `sort` and `limit` modifiers, and will throw an error if the given criteria match more than one record**.  If you want to find a single record using anything besides a `unique` attribute (like the primary key) as criteria, use `.find(<criteria>).limit(1)` instead (keeping in mind that this will return an array of one item).
* **`autoPk`, `autoCreatedAt` and `autoUpdatedAt`** are no longer supported as top-level model properties.  See the [migration guide section on model config changes](https://sailsjs.com/documentation/upgrading/to-v-1-0/#?changes-to-model-configuration) for more information.
* **Dynamic finders** (such as `User.findById()`) are no longer added to your models automatically.  You can implement these yourself as [custom model methods](https://sailsjs.com/documentation/concepts/models-and-orm/models#?custom-model-methods).
* **Model Instance Methods** are no longer supported. This allows records returned from find queries to be plain JavaScript objects instead of model record instances.
* **Custom `.toJSON()`** instance methods are no longer supported.  Instead, add a [`customToJSON` method](https://sailsjs.com/documentation/concepts/models-and-orm/model-settings#?customtojson) to the model class (outside of the `attributes` dictionary).  See the [model settings documentation](https://sailsjs.com/documentation/concepts/models-and-orm/model-settings) for more information.
* **The `.toObject()` instance method** is no longer added to every record.  When implementing [`customToJSON`](https://sailsjs.com/documentation/concepts/models-and-orm/model-settings#?customtojson) for a model, be sure to clone the record using `_.omit()`, `_.pick()` or `_.clone()`.
* **`autoUpdatedAt` timestamps can now be manually updated** in calls to `.update()` (previously, the passed-in attribute value would be ignored).  The previous behavior faciliated the use of `.save()`, which is no longer supported.  Now, you can update the `updatedAt` if you need to (but generally you should let Sails do this for you!)
* **`beforeValidate` and `afterValidate` lifecycle callbacks no longer exist**. Use one of the [many other lifecycle callbacks](https://sailsjs.com/documentation/concepts/models-and-orm/lifecycle-callbacks) to tap into the query.
* **`afterDestroy` lifecycle callback now receives a single record**. It has been normalized to work the same way as the `afterUpdate` callback and call the function once for each record that has been destroyed rather than once with all the destroyed records.
* **Many resourceful PubSub methods have changed** (see the PubSub section below for the full list).  If your app only uses the automatic RPS functionality provided by blueprints (and doesn&rsquo;t call RPS methods directly), no updates are required.
* **The `.find()` model method no longer automatically coerces constraints that are provided for unrecognized attributes**.  For example, if you execute `Purchase.find({ amount: '12' })`, e.g. via blueprints (http://localhost:1337/purchase?amount=12), and there is no such "amount" attribute, then even if the database contains a record with the numeric equivalent (`12`), it will not be matched.  (This is only relevant when using MongoDB and sails-disk.)  If you are running into problems because of this, either define the attribute as a number or (if you're using blueprints) use an explicit `where` clause instead (e.g. `http://localhost.com:1337/purchase?where={"amount":12}`).
* **Custom blueprints and the associated blueprint route syntax have been removed**.  This functionality can be replicated using custom actions, helpers, and routes.  See the "Replacing custom blueprints" section below for more information.
* **Blueprint action shadow routes no longer include `/:id?`** at the end -- that is, if you have a `UserController.js` with a `tickle` action, you will no longer get a `/user/tickle/:id?` route (instead, it will be just `/user/tickle`).  Apps relying on those routes should add them manually to their `config/routes.js` file.
* **`sails.getBaseUrl`**, deprecated in v0.12.x, has been removed.  See the [v0.12 docs for `getBaseUrl`](http://0.12.sailsjs.com/documentation/reference/application/sails-get-base-url) for more information on why it was removed and how you should replace it.
* **`req.params.all()`**, deprecated in v0.12.x, has been removed.  Use `req.allParams()` instead.
* **`sails.config.dontFlattenConfig`**, deprecated in v0.12.x, has been removed.  See the [original notes about `dontFlattenConfig`](https://sailsjs.com/documentation/upgrading/to-v-0-11#?config-files-in-subfolders) for details.
* **The order of precedence for `req.param()` and `req.allParams()` has changed.**  It is now consistently path > body > query (that is, url path params override request body params, which override query string params).
* **`req.validate()`** has been removed.  Use [`actions2`](https://sailsjs.com/documentation/concepts/actions-and-controllers#?actions-2) instead.
* **The default `res.created()` response has been removed.**  If you&rsquo;re calling `res.created()` directly in your app, and you don't have an `api/responses/created.js` file, you&rsquo;ll need to create one.
 + On a related note, the [Blueprint create action](https://sailsjs.com/documentation/reference/blueprint-api/create) will now return a 200 status code upon success, instead of 201.
* **The default `notFound` and `serverError` responses no longer accept a `pathToView` argument.** They will only attempt to serve a `404` or `500` view.  If you need to be able to call these responses with different views, you can customize the responses by adding `api/responses/notFound.js` or `api/responses/serverError.js` files to your app.
* **The default `badRequest` or `forbidden` responses no longer display views**.  If you don&rsquo;t already have the `api/responses/badRequest.js` and `api/responses/forbidden.js` files, you&rsquo;ll need add them yourself and write custom code if you want them to display view files.
* **The <a href="https://www.npmjs.com/package/connect-flash" target="_blank">`connect-flash`</a> middleware has been removed** (so `req.flash()` will no longer be available by default).  If you wish to continue using `req.flash()`, run `npm install --save connect-flash` in your app folder and [add the middleware manually](https://sailsjs.com/documentation/concepts/middleware).
* **The `POST /:model/:id` blueprint RESTful route has been removed.**  If your app is relying on this route, you&rsquo;ll need to add it manually to `config/routes.js` and bind it to a custom action.
* **The `handleBodyParserError` middleware has been removed**; in its place, the <a href="https://www.npmjs.com/package/skipper" target="_blank">Skipper body parser</a> now has its own `onBodyParserError` method.
  + If you have customized the [middleware order](https://sailsjs.com/documentation/concepts/middleware#?adding-or-overriding-http-middleware), you&rsquo;ll need to remove `handleBodyParserError` from the array.
  + If you've overridden `handleBodyParserError`, you&rsquo;ll need to instead override `bodyParser` with your own customized version of Skipper, including your error-handling logic in the `onBodyParserError` option.
* **The `methodOverride` middleware has been removed.** If your app utilizes this middleware:
  + `npm install --save method-override`
  + Make sure your `sails.config.http.middleware.order` array (in `config/http.js`) includes `methodOverride` somewhere before `router`
  + Add `methodOverride: require('method-override')()` to `sails.config.http.middleware`.
* **The `router` middleware is no longer overrideable.**  Instead, the Express 4 router is used for routing both external and internal (aka &ldquo;virtual&rdquo;) requests.  It&rsquo;s still important to have a `router` entry in `sails.config.http.middleware.order` to delimit which middleware should be added before and after the router.
* **The query modifiers `lessThan`, `lessThanOrEqual`, `greaterThan`, and `greaterThanOrEqual` have been removed**. Use the shorthand versions instead (`<`, `<=`, `>`, `>=`).
* **The [`find one`](https://sailsjs.com/documentation/reference/blueprint-api/find-one) and [`find`](https://sailsjs.com/documentation/reference/blueprint-api/find-where) blueprint actions** now accept a `populate=false` rather than `populate=` to specify that no attributes should be populated.
* **The [`add`](https://sailsjs.com/documentation/reference/blueprint-api/add-to) and [`remove`](https://sailsjs.com/documentation/reference/blueprint-api/remove-from) blueprint actions** now require that the primary key of the child record to add or remove be supplied as part of the URL, rather than allowing it to be passed on the query string or in the body.
* **The [`destroy`](https://sailsjs.com/documentation/reference/blueprint-api/destroy) blueprint action** now requires that the primary key of the record to destroy be supplied as part of the URL, rather than allowing it to be passed on the query string or in the body.
* **The `sails.config.session.routesDisabled` setting has changed** to `sails.config.session.isSessionDisabled()`, a function.  See the [`config/session.js` docs](https://sailsjs.com/documentation/reference/configuration/sails-config-session) for more information on configuring `isSessionDisabled()`.
* **The experimental &ldquo;switchback-style&rdquo; usage for Waterline methods is no longer supported**.  Only function callbacks may be used with Waterline model methods.
* **The experimental `create` auto-migration scheme is no longer supported**.  It is highly recommended that you use a migration tool such as [Knex](http://knexjs.org/#Migrations) to handle migrations of your production database.
* **The experimental `forceLoadAdapter` datastore setting is no longer supported**.  Instead, all adapters referenced in `config/datastores.js` (formerly `config/connections.js`) are automatically loaded whenever Sails lifts.
* **The experimental `usage` route option has been removed.**  It is recommended that you perform any route parameter validation in your controller code.
* **The experimental &ldquo;associated-item&rdquo; blueprint shadow routes have been removed.** These were routes like `GET /user/1/pets/2`, whose functionality can be replicated by simply using the much-clearer route `GET /pets/2`.
* **The experimental `.validate()` method in model classes** (e.g. `User.validate()`) is now fully supported, but its usage has changed.  See the [`.validate()` docs](https://sailsjs.com/documentation/reference/waterline-orm/models/validate) for more information.
* **The ordering of attributes** in the internal representation of model classes has changed (association attributes are now sorted at the bottom).  This has the effect of causing tables created using `migrate: 'alter'` to have their columns in a different order than in previous versions of Waterline, so be aware of this if column ordering is important in your application.  As a reminder, auto-migrations are intended to help you design your schema as you build your app.  They are not guaranteed to be consistent regarding any details of your physical database columns besides setting the column name, type (including character set / encoding if specified) and uniqueness.
* **Using `_config` to link a controller to a model** will no longer work.  This was never a supported feature, but it was used in some projects to change the URLs that were mapped to the blueprint actions for a model.  Please use [`restPrefix`](https://sailsjs.com/documentation/reference/configuration/sails-config-blueprints#?properties) instead.
* **The `find()`, `destroy()`, and `update()` methods**  ignore `undefined` attributes. These methods will strip undefined attributes from their search criteria, e.g. `User.update({id: undefined}).with({ firstName: 'Finn'})` would update **every** user record. Read more about this in [this Github issue](https://github.com/balderdashy/sails/issues/4639#issuecomment-320369193)

### Changes to database configuration

* The `sails.config.connections` setting has been deprecated in favor of `sails.config.datastores`.  If you lift an app that still has `sails.config.connections` configured, you&rsquo;ll get a warning which you can avoid by simply changing `module.exports.connections` in `config/connections.js` to `module.exports.datastores`.  For your own sanity, it&rsquo;s recommended that you also change the filename to `config/datastores.js`.
* The `sails.config.models.connection` setting has been deprecated in favor of `sails.config.models.datastore`.  As above, changing the name of the property in `config/models.js` should be sufficient to turn off any warnings.
* Every app now has a default datastore (appropriately named `default`) that is configured to use a built-in version of the [`sails-disk` adapter](https://github.com/balderdashy/sails-disk).  In Sails 1.0, the default value of `sails.config.models.datastore` is `default` (rather than `localDiskDb`). The recommended approach to setting the default datastore for your models is to simply to add the desired configuration under the `default` key in `config/datastores.js`, and leave the `datastore` key in `config/models.js` undefined, rather than the previous approach of setting `datastore` to (for example) `myPostgresqlDb` and then adding a `myPostgresqlDb` key to `config/datastores.js`.  This makes it a lot easier to change the datastore used by different environments (for instance, by changing the configuration of the `default` datastore in `config/env/production.js`).
* _All_ datastores that are configured in an app will be loaded at runtime (rather than only loading datastores that were being used by at least one model).  This has the benefit of allowing the use of a datastore outside the context of an individual model, but it does mean that if you don&rsquo;t want to connect to a certain database when Sails lifts, you should comment out that datastore connection config!

### Nested creates and updates

* The [`.create()`](https://sailsjs.com/documentation/reference/waterline-orm/models/create), [`.update()`](https://sailsjs.com/documentation/reference/waterline-orm/models/update) and [`.add()`](https://sailsjs.com/documentation/reference/waterline-orm/models/find) model methods no longer support creating a new &ldquo;child&rdquo; record to link immediately to a new or existing parent.  For example, given a `User` model with a singular association to an `Animal` model through an attribute called `pet`, it is not possible to set `pet` to a dictionary representing values for a brand new `Animal` (aka a &ldquo;nested create&rdquo;).  Instead, create the new `Animal` first and use its primary key to set `pet` when creating the new `User`.
* Similarly, the [create](https://sailsjs.com/documentation/reference/blueprint-api/create), [update](https://sailsjs.com/documentation/reference/blueprint-api/update) and [add](https://sailsjs.com/documentation/reference/blueprint-api/add-to) blueprint actions no longer support nested creates.
* The [`.update()`](https://sailsjs.com/documentation/reference/waterline-orm/models/update) model method and its associated [blueprint action](https://sailsjs.com/documentation/reference/blueprint-api/update) no longer support replacing an entire plural association.  If a record is linked to one or more other records via a [&ldquo;one-to-many&rdquo;](https://sailsjs.com/documentation/concepts/models-and-orm/associations/one-to-many) or [&ldquo;many-to-many&rdquo;](https://sailsjs.com/documentation/concepts/models-and-orm/associations/many-to-many) association and you wish to link it to an entirely different set of records, use the [`.replaceCollection()` model method](https://sailsjs.com/documentation/reference/waterline-orm/models/replace-collection) or the [replace blueprint action](https://sailsjs.com/documentation/reference/blueprint-api/replace).

### Changes to model configuration

##### tl;dr

Remove any `autoPK`, `autoCreatedAt` and `autoUpdatedAt` properties from your models, and add the following to your `config/models.js` file:

```javascript
  attributes: {
    createdAt: { type: 'number', autoCreatedAt: true, },
    updatedAt: { type: 'number', autoUpdatedAt: true, },
    id: { type: 'number', autoIncrement: true}, // <-- for SQL databases
    id: { type: 'string', columnName: '_id'}, // <-- for MongoDB
  }
```

##### The `autoPK` top-level property is no longer supported

This property was formerly used to indicate whether or not Waterline should create an `id` attribute as the primary key for a model.  Starting with Sails v1.0 / Waterline 0.13, Waterline will no longer create any attributes in the background.  Instead, the `id` attribute must be defined explicitly.  There is also a new top-level model property called `primaryKey`, which can be set to the name of the attribute that should be used as the model's primary key.  This value defaults to `id` for every model, so in general you won't have to set it yourself.

##### The `autoUpdatedAt` and `autoCreatedAt` model settings are now attribute-level properties

These properties were formerly used to indicate whether or not Waterline should create `createdAt` and `updatedAt` timestamps for a model.  Starting with Sails v1.0 / Waterline 0.13, Waterline will no longer create these attributes in the background.  Instead, the `createdAt` and `updatedAt` attributes must be defined explicitly if you want to use them.  By adding `autoCreatedAt: true` or `autoUpdatedAt: true` to an attribute definition, you can instruct Waterline to set that attribute to the current timestamp whenever a record is created or updated. Depending on the type of these attributes, the timestamps will be generated in one of two formats:
  + For `type: 'string'`, these timestamps are stored in the same way as they were in Sails 0.12: as timezone-agnostic ISO 8601 JSON timestamp strings (e.g. `'2017-12-30T12:51:10Z'`).  So if any of your front-end code is relying on the timestamps as strings it's important to set this to `string`.
  + For `type: 'number'`, these timestamps are stored as JS timestamps (the number of milliseconds since Jan 1, 1970 at midnight UTC).

Furthermore, for any attribute, if you pass `new Date()` as a constraint within a Waterline criteria's `where` clause, or as a new record, or within the values to set in a `.update()` query, then these same rules are applied based on the type of the attribute. If the attribute is `type: 'json'`, it uses the latter approach.

<!-- TODO: finish filling in the gaps for this section:
##### Changes to built-in data types

As of Sails v1.0 / Waterline 0.13, we've made changes to the way that data types and type safety work in the ORM. This allows us to do more as far as type validation/coercion, which makes your app more future-proof and less error-prone[1]()[2]()[3](). As a result, we've narrowed down the `type` options to the following:

+ `'string'`
+ `'number'`
+ `'boolean'`
+ `'json'`
+ _`'ref'`_ _(advanced: do not use unless you have personally inspected the source code of your adapter to understand how it handles data of this type - this is a direct channel between the adapter and your app.)_

This means that the following types are **no longer supported** (but can be simulated in most cases by including `columnType` and/or validation rules in your attribute definition):

+ `'text'` _(use `type: 'string'` and `columnType: 'TEXT'`)_
+ `'integer'` _(use `type: 'number'`, `columnType: 'INT'` and `isInteger: true`)_
+ `'float'` _(use `type: 'number'` and `columnType: 'FLOAT'`)_
+ `'date'`
+ `'datetime'`
+ `'binary'`
+ `'array'` _(use `type: 'json'`)_
+ `'mediumtext'` _(use `type: 'string'` and `columnType: 'MEDIUMTEXT'`)_
+ `'longtext'` _(use `type: 'string'` and `columnType: 'LONGTEXT'`)_
+ `'objectid'`
+ `'email'` _(use `type: 'string'` and `isEmail: true`)_
-->

### Changes to `.create()`, `.createEach()`, `.update()`, and `.destroy()` results

As of Sails v1.0 / Waterline 0.13, the default result from `.create()`, `.createEach()`, `.update()`, and `.destroy()` has changed.

To encourage better performance and easier scalability, `.create()` no longer sends back the created record. Similarly, `.createEach() ` no longer sends back an array of created records, `.update()` no longer sends back an array of _updated_ records, and `.destroy()` no longer sends back _destroyed_ records.  Instead, the second argument to the .exec() callback is now `undefined` (or the first argument to `.then()`, if you're using promises).

This makes your app more efficient by removing unnecessary `find` queries, and it makes it possible to use `.update()` and `.destroy()` to modify many different records in large datasets, rather than falling back to lower-level native queries.

You can still instruct the adapter to send back created or modified records for a single query by using the `fetch` method.  For example:

```js
Article.update({
  category: 'health-and-wellness',
  status: 'draft'
})
.set({
  status: 'live'
})
.fetch()
.exec(function(err, updatedRecords){
  //...
});
```


> If the prospect of changing all of your app's queries seems daunting, there is a temporary convenience you might want to take advantage of.
> To ease the process of upgrading an existing app, you can tell Sails/Waterline to fetch created/updated/destroyed records for ALL of your app's `.create()`/`.createEach()`/`.update()`/`.destroy()` queries.  Just edit your app-wide model settings in `config/models.js`:
>
> ```js
> fetchRecordsOnUpdate: true,
> fetchRecordsOnDestroy: true,
> fetchRecordsOnCreate: true,
> fetchRecordsOnCreateEach: true,
> ```
>
> That's it!  Still, to improve performance and future-proof your app, you should go through all of your `.create()`, `.createEach()`, `.update()`, and `.destroy()` calls and add `.fetch()` when you can.  Support for these model settings will eventually be removed in Sails v2.

### Changes to Waterline criteria usage
* For performance reasons, as of Sails v1.0 / Waterline 0.13, criteria passed into Waterline's model methods will now be mutated in-place in most situations (whereas in Sails/Waterline v0.12, this was not necessarily the case).
* Aggregation clauses (`sum`, `average`, `min`, `max`, and `groupBy`) are no longer supported in criteria.  Instead, see new model methods [.sum()](https://sailsjs.com/documentation/reference/waterline-orm/models/sum) and [.avg()](https://sailsjs.com/documentation/reference/waterline-orm/models/avg).
* Changes to limit and skip:
  + `limit: 0` **no longer does the same thing as `limit: undefined`**.  Instead of matching ∞ results, it now matches 0 results.
  + Avoid specifying a limit of < 0.  It is still ignored, and acts like `limit: undefined`, but it now logs a deprecation warning to the console.
  + `skip: -20` **no longer does the same thing as `skip: undefined`**.  Instead of skipping zero results, it now refuses to run with an error.
  + Limit must be < Number.MAX_SAFE_INTEGER (...with one exception: for compatibility/convenience, `Infinity` is tolerated and normalized to `Number.MAX_SAFE_INTEGER` automatically.)
  + Skip must be < Number.MAX_SAFE_INTEGER


##### Change in support for mixed `where` clauses
Criteria dictionaries with a mixed `where` clause are no longer supported. For example, instead of:
```javascript
{
  username: 'santaclaus',
  limit: 4,
  select: ['beardLength', 'lat', 'long']
}
```
you should use:
```javascript
{
  where: { username: 'santaclaus' },
  limit: 4,
  select: ['beardLength', 'lat', 'long']
}
```
> Note that you can still do `{ username: 'santaclaus' }` as shorthand for `{ where: { username: 'santaclaus' } }`, you just can't mix other top-level criteria clauses (like `limit`) alongside constraints (e.g. `username`).
>
> For places where you're using Waterline's chainable deferred object to build criteria, don't worry about this&mdash;it's already taken care of for you.

### Security

New apps created with Sails 1.0 will contain a **config/security.js** file instead of individual **config/cors.js** and **config/csrf.js** files. Apps migrating from earlier versions can keep their existing files, as long as they perform the following upgrades:

* Change `module.exports.cors` to `module.exports.security.cors` in `config/cors.js`
* Change CORS config settings names to match the newly documented names in [Reference > Configuration > sails.config.security](https://sailsjs.com/documentation/reference/configuration/sails-config-security#?sailsconfigsecuritycors)
* Change `module.exports.csrf` to `module.exports.security.csrf` in `config/csrf.js`.  This value is now simply `true` or `false`; no other CSRF options are supported (see below).
* `sails.config.csrf.routesDisabled` is no longer supported. Instead, add `csrf: false` to any route in `config/routes.js` that you wish to be unprotected by CSRF, for example:

```js
'POST /some-thing': { action: 'do-a-thing', csrf: false },
```

* `sails.config.csrf.origin` is no longer supported. Instead, you can add any custom CORS settings directly to your CSRF token route configuration, for example:

```js
'GET /csrfToken': {
  action: 'security/grant-csrf-token',
  cors: {
    allowOrigins: ['http://foobar.com', 'https://owlhoot.com']
  }
}
```

* `sails.config.csrf.grantTokenViaAjax` is no longer supported.  This setting was used to turn the CSRF token-granting route on or off.  In Sails 1.0, you add that route manually in your `config/routes.js` file (see above). If you don&rsquo;t want to grant CSRF tokens via AJAX, just leave that route out of `config/routes.js`.

### Views

For maximum flexibility, Consolidate is no longer bundled with Sails.  If you are using a view engine besides EJS, you'll probably want to install Consolidate as a direct dependency of your app.  You can then configure the view engine in `config/views.js`, like so:

```javascript
extension: 'swig',
getRenderFn: function() {
  // Import `consolidate`.
  var cons = require('consolidate');
  // Return the rendering function for Swig.
  return cons.swig;
}
```

Adding custom configuration to your view engine is a lot easier in Sails 1.0:

```javascript
extension: 'swig',
getRenderFn: function() {
  // Import `consolidate`.
  var cons = require('consolidate');
  // Import `swig`.
  var swig = require('swig');
  // Configure `swig`.
  swig.setDefaults({tagControls: ['{?', '?}']});
  // Set the module that Consolidate uses for Swig.
  cons.requires.swig = swig;
  // Return the rendering function for Swig.
  return cons.swig;
}
```

Note that the [built-in support for layouts](https://sailsjs.com/documentation/concepts/views/layouts) still works for the default EJS views, but layout support for other view engines (e.g. Handlebars or Ractive) is not bundled with Sails 1.0.

### Resourceful PubSub

* Removed deprecated `backwardsCompatibilityFor0.9SocketClients` setting.
* Removed deprecated `.subscribers()` method.
* Removed deprecated "firehose" functionality.
* Removed support for 0.9.x socket client API.
* The following resourceful pubsub methods have also been removed:
  * `.publishAdd()`
  * `.publishCreate()`
  * `.publishDestroy()`
  * `.publishRemove()`
  * `.publishUpdate()`
  * `.watch()`
  * `.unwatch()`
  * `.message()`

In place of the removed methods, you should use the new `.publish()` method, or the low-level [sails.sockets](https://sailsjs.com/documentation/reference/web-sockets/sails-sockets) methods.  Keep in mind that unlike `.message()`, `.publish()` does _not_ wrap your data in an envelope containing the record ID, so&mdash;if it's important&mdash;you'll need to include the ID yourself as part of the data.  For example, in Sails v0.12.x, `User.message(123, {owl: 'hoot'})` would have resulted in the following notification being broadcasted to clients:

```
{
  verb: 'messaged',
  id: 123,
  data: {
    owl: 'hoot'
  }
}
```

By contrast, in Sails v1.0, `User.publish(123, {owl: 'hoot'})` will simply broadcast:
```
{
  owl: 'hoot'
}
```



### Replacing custom blueprints

Out of the box, it is no longer possible to add a file to `api/blueprints/` that will automatically be used as a blueprint action for all models.  However, this behavior can easily be replicated by installing [`sails-hook-custom-blueprints`](https://www.npmjs.com/package/sails-hook-custom-blueprints).

<!--
Another way is to add a route like `'POST /:model': 'SharedController.create'` to the bottom of your `config/routes.js` file, and then add the custom `create` blueprint to a `api/controllers/SharedController.js` file (or a `api/controllers/shared/create.js` standalone action).

Yet another option would be to add a `api/helpers/create.js` helper which takes a model name and dictionary of values as inputs (see [Concepts > Helpers](https://sailsjs.com/documentation/concepts/helpers)), and call that helper from the related action for each model (e.g. `UserController.create`).
-->

### Express 4

Sails 1.0 comes with an update to the internal Express server from version 3 to version 4 (thanks to some great work by [@josebaseba](http://github.com/josebaseba)).  This change is mainly about maintainability for the Sails framework and should be transparent to your app.  However, there are a couple of differences worth noting:

* The `404`, `500` and `startRequestTimer` middleware are now built-in to every Sails app, and have been removed from the `sails.config.http.middleware.order` array.  If your app has an overridden `404` or `500` handler, you should instead override `api/responses/notFound.js` and `api/responses/serverError.js` respectively.
* Session middleware that was designed specifically for Express 3 (e.g. very old versions of `connect-redis` or `connect-mongo`) will no longer work, so you&rsquo;ll need to upgrade to more recent versions.
* The `sails.config.http.customMiddleware` feature is deprecated in Sails 1.0.  It will still work for now, but may be removed in a later release.  Instead of using `customMiddleware` to modify the Express app directly, use regular (`req`, `res`, `next`) middleware instead.  For instance, you can replace something like:

```
customMiddleware: function(app) {
  var passport = require('passport');
  app.use(passport.initialize());
  app.use(passport.session());
}
```

with something like:
```
var passport = require('passport');
middleware: {
  passportInit: passport.initialize(),
  passportSession: passport.session()
},
```
being sure to insert `passportInit` and `passportSession` into your `middleware.order` array in `config/http.js`.

### Response methods
 * `.jsonx()` is deprecated. If you have files in `api/responses` that you haven't customized at all, you can just delete them and let the Sails default responses work their magic.  If you have files in `api/responses` that you&rsquo;d like to keep, replace any occurences of `res.jsonx()` in those files with `res.json()`.
 * `res.negotiate()` is deprecated. Use `res.serverError()`, `res.badRequest()`, or a [custom response](https://sailsjs.com/documentation/concepts/extending-sails/custom-responses) instead.


### i18n

Sails 1.0 switches from using the [i18n](http://npmjs.org/package/i18n) to the lighter-weight [i18n-2](http://npmjs.org/package/i18n-2) module.  The overwhelming majority of users should see no difference in their apps.  However, if you&rsquo;re using the `sails.config.i18n.updateFiles` option, be aware that this is no longer supported; instead, locale files will _always_ be updated in development mode, and _never_ in production mode.  If this is a problem or you&rsquo;re missing some other feature from the i18n module, you can install [sails-hook-i18n](http://npmjs.org/package/sails-hook-i18n) to revert to pre-Sails-1.0 functionality.

> If your 0.12 application is running into issues during upgrade due to its use of i18n features, see [#4343](https://github.com/balderdashy/sails/issues/4343) for more troubleshooting tips.

### WebSockets

All Sails 1.0 projects that use websockets must install the latest `sails-hook-sockets` dependency (`npm install --save sails-hook-sockets`).  This version of `sails-hook-sockets` differs from previous ones in a couple of ways:

* The default `transports` setting is simply `['websocket']`.  In the majority of production deployments, restricting your app to the `websocket` transport (rather than using `['polling', 'websocket']`) avoids problems with sessions (see the pre-1.0 [scaling guide notes](https://github.com/balderdashy/sails-docs/blob/1038b38cb34fd945086480ee45325a1ac95a0950/concepts/Deployment/Scaling.md#notes) for details).  If you&rsquo;re using the `sails.io.js` websocket client, the easiest way to make your app compatible with the new websocket settings is to install the new `sails.io.js` version with `sails generate sails.io.js`.  The latest version of that package also defaults to the &ldquo;websocket-only&rdquo; transport strategy.  If you&rsquo;ve customized the `transports` setting in your front-end code and `config/sockets.js` file, then you'll just need to continue to ensure that the values in both places match.
* The latest `sails-hook-sockets` hook uses a newer version of Socket.io.  See the [Socket.io changelog](https://github.com/socketio/socket.io/blob/master/History.md#150--2016-10-06) for a full update, but keep in mind that socket IDs no longer have `/#` prepended to them by default.

### Grunt

The Grunt task-management functionality that was formerly part of the Sails core has now been moved into the separate `sails-hook-grunt` module.  Existing apps simply need to `npm install --save sails-hook-grunt` to continue using Grunt.  However, with a modification to your app&rsquo;s `Gruntfile.js`, you can take advantage of the fact that `sails-hook-grunt` includes all of the `grunt-contrib` modules that previously had to be installed at the project level.  The new `Gruntfile.js` contains:

```
module.exports = function(grunt) {

  var loadGruntTasks = require('sails-hook-grunt/accessible/load-grunt-tasks');

  // Load Grunt task configurations (from `tasks/config/`) and Grunt
  // task registrations (from `tasks/register/`).
  loadGruntTasks(__dirname, grunt);

};
```

Assuming that you haven&rsquo;t customized the Gruntfile in your app, you can replace `Gruntfile.js` with that code and then safely run:

```
npm uninstall --save grunt-contrib-clean
npm uninstall --save grunt-contrib-coffee
npm uninstall --save grunt-contrib-concat
npm uninstall --save grunt-contrib-copy
npm uninstall --save grunt-contrib-cssmin
npm uninstall --save grunt-contrib-jst
npm uninstall --save grunt-contrib-less
npm uninstall --save grunt-contrib-uglify
npm uninstall --save grunt-contrib-watch
npm uninstall --save grunt-sails-linker
npm uninstall --save grunt-sync
npm uninstall --save grunt-cli
```

to remove those dependencies from your project.


### Troubleshooting


##### Still displaying v0.12 at launch?

Make sure you have `sails` installed locally in your project, and that you're using the v1 version of the command-line tool.

To install the v1.0 globally, run `npm install sails@^1.0.0 -g`. To install it for a particular Sails app, cd into that app's directory, then run `npm install sails@^1.0.0 --save`.  (After installing locally, be sure to also install the necessary hooks -- see above.)



<docmeta name="displayName" value="To v.1.0">
<docmeta name="version" value="1.0.0">
