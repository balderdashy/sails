# Custom routes

### Overview

Sails allows you to explicitly route URLs in several different ways in your **config/routes.js** file.  Every route configuration consists of an **address** and a **target**, for example:

```js
'GET /foo/bar': 'UserController.subscribe'
^^^address^^^  ^^^^^^^^^^target^^^^^^^^^^
```

### Route address

The route address indicates what URL should be matched in order to apply the handler and options defined by the target.  A route consists of an optional verb and a mandatory path:

```js
'POST  /foo/bar'
^verb^ ^^path^^
```

If no verb is specified, the route will match any CRUD method (**GET**, **PUT**, **POST**, **DELETE** or **PATCH**).  If `ALL` is specified as the verb, the route will match _any_ method.

Note the initial `/` in the path--all paths should start with one in order to work properly.


### Wildcards and dynamic parameters

In addition to specifying a static path like **foo/bar**, you can use `*` as a wildcard:

```js
'/*'
```

will match all paths, where as:

```js
'/user/foo/*'
```

will match all paths that *start* with **/user/foo**.

> **Note:** When using a route with a wildcard, such as `'/*'`, be aware that this will also match requests to static assets (i.e. `/js/dependencies/sails.io.js`) and override them. To prevent this, consider using the `skipAssets` option [described below](https://sailsjs.com/documentation/concepts/routes/custom-routes#?route-target-options).

To receive the runtime value corresponding with this wildcard (`*`) in a [modern Sails action](https://sailsjs.com/documentation/concepts/actions-and-controllers#?what-does-an-action-file-look-like), use `urlWildcardSuffix` at the top level of your action definition to indicate the name of the input you would like to use to represent the dynamic value:


```javascript
urlWildcardSuffix: 'template',
inputs: {
  template: {
    description: 'The relative path to an EJS template within our `views/emails/` folder -- WITHOUT the file extension.',
    extendedDescription: 'Use strings like "foo" or "foo/bar", but NEVER "foo/bar.ejs" or "/foo/bar".  For example, '+
      '"internal/email-contact-form" would send an email using the "views/emails/internal/email-contact-form.ejs" template.',
    example: 'email-reset-password',
    type: 'string',
    required: true
  },
},
fn: async function({ template }) {
  // …
}
```


### Notes
> - Alternatively, in a classic (req,res) action, you can use `req.param('0')` to access the dynamic value of a route's URL wildcard suffix (`*`).
> - For more background, see https://www.npmjs.com/package/machine-as-action



Another way to capture parts of the address is to use **pattern variables**.  This lets a route match special named parameters which _never contain any `/` characters_ by using the `:paramName` pattern variable syntax instead of the `*`:

```js
'/user/foo/bar/:name'
```

Or for an optional path parameter, add `?` to the end of the pattern variable:

```js
'/user/foo/bar/:name?'
```

This will match _almost_ the same requests as `/user/foo/bar/*`, but will provide the value of the dynamic portions of the route URL to the route handler as parameter values (e.g. `req.param('name')`).

> Note that the wildcard (`*`) syntax matches slashes, where the URL pattern variable (`:`) syntax does not.  So in the example above, given the route address `GET /user/foo/bar/*`, incoming requests with URLs like `/user/foo/bar/baz/bing/bong/bang` would match (whereas if you used the `:name` syntax, the same URL would not match.)

### URL slugs
A common use case for pattern variables is the design of slugs or [vanity URLs](http://en.wikipedia.org/wiki/Clean_URL#Slug).  For example, consider the URL of a repository on Github, [`http://www.github.com/balderdashy/sails`](http://www.github.com/balderdashy/sails).  In Sails, we might define this route at the **bottom of our `config/routes.js` file** like so:

```javascript
'get /:account/:repo': {
  controller: 'RepoController',
  action: 'show',
  skipAssets: true
}
```

In your `RepoController`'s `show` action, we'd use `req.param('account')` and `req.param('repo')` to look up the data for the appropriate repository, then pass it in to the appropriate [view](https://sailsjs.com/documentation/concepts/Views) as [locals](https://sailsjs.com/documentation/concepts/views/locals).  The [`skipAssets` option](https://sailsjs.com/documentation/concepts/routes/custom-routes#?route-target-options) ensures that the vanity route doesn't accidentally match any of our [assets](https://sailsjs.com/documentation/concepts/assets) (e.g. `/images/logo.png`), so they are still accessible.

### Regular expressions in addresses

In addition to the wildcard address syntax, you may also use regular expressions to define the URLs that a route should match.  The syntax for defining an address with a regular expression is:

`'r|<regular expression string>|<comma-delimited list of param names>'`

That's the letter "**r**", followed by a pipe character `|`, a regular expression string *without delimiters*, another pipe, and a list of parameter names that should be mapped to parenthesized groups in the regular expression.  For example:

`'r|^/\\d+/(\\w+)/(\\w+)$|foo,bar": "message/my-action'`

Will match `/123/abc/def`, running the action in **api/controllers/message/my-action.js**, and supplying the values `abc` and `def` as `req.param('foo')` and `req.param('bar')`, respectively.

Note the double-backslash in `\\d` and `\\w`; this escaping is necessary for the regular expression to work correctly!

##### About route ordering

While you are free to add items to your **config/routes.js** file in any order, be aware that Sails will internally sort your routes by _inclusiveness_, a measure of how many potential requests an address can handle.  In general, routes with addresses containing no dynamic components will be matched first, followed by routes with dynamic parameters, followed by those with wildcards.  This prevents routes from blocking each other (for example, a `/*` route, if left at the top of the list, would respond to all requests and no other routes would ever be matched).

If you have any [regular expression addresses](https://sailsjs.com/documentation/concepts/routes/custom-routes#?regular-expressions-in-addresses), they will be left in the order you specify.  For example, if your **config/routes.js** file contains a `GET /foo/bar` route followed by a `GET r|^/foo/\\d+$|` route, the second route will always be sorted to appear immediately after `GET /foo/bar`.  This is due to the extreme difficulty of determining the inclusiveness of a regular expression route.  Take care when specifying these routes that you order them so that they won't match more requests than intended.

### Route target

The address portion of a custom route specifies which URLs the route should match.  The *target* portion specifies what Sails should do after the match is made.  A target can take one of several different forms.  In some cases you may want to chain multiple targets to a single address by placing them in an array, but in most cases each address will have only one target.  The different types of targets are discussed below, followed by a discussion of the various options that can be applied to them.

##### Controller / action target syntax

This syntax binds a route to an action in a [controller file](https://sailsjs.com/documentation/concepts/actions-and-controllers#?controllers).  The following four routes are equivalent:

```js
'GET /foo/go': 'FooController.myGoAction',
'GET /foo/go': 'foo.myGoAction',
'GET /foo/go': { controller: 'foo', action: 'myGoAction' },
'GET /foo/go': { controller: 'FooController', action:'myGoAction' },
```

Each one maps `GET /foo/go` to the `myGoAction` action of the controller in **api/controllers/FooController.js**, or to the action in **api/controllers/foo/mygoaction.js**.  If no such controller or action exists, Sails will output an error message and ignore the route.  Otherwise, whenever a **GET** request to **/foo/go** is made, the code in that action will be run.

The controller and action names in this syntax are case-insensitive.

##### Standalone action target syntax

This syntax binds an address to a [standalone Sails action](https://sailsjs.com/documentation/concepts/actions-and-controllers#?standalone-actions).  Simply specify the path of the action (relative to `api/controllers`):

```js
'GET /': { action: 'index' },   // Use the action in api/controllers/index.js

'GET /foo/go': { action: 'foo/go-action' } // Use the action in api/controllers/foo/go-action.js OR
                                           // the "go-action" action in api/controllers/FooController.js

'GET /bar/go': 'foo/go-action' // Binds to the same action as above, using shorthand notation
```

##### Routing to blueprint actions

The [blueprint API](https://sailsjs.com/documentation/reference/blueprint-api) adds several actions for each of your models, all of which are available for routing.  For example, if you have a model defined in `api/models/User.js`, you&rsquo;ll automatically be able to do:

```js
'GET /foo/go': 'user/find'              // Return a list of users
```
or
```js
'GET /foo/go': 'UserController.find'    // Same as above
```

If you have a custom action in `api/controllers/user/find.js` or `api/controllers/UserController.js`, that action will be run instead of the default blueprint `find`.  For a full list of the actions provided for your models, see the [blueprint API reference](https://sailsjs.com/documentation/reference/blueprint-api).

##### View target syntax

Another common target is one that binds a route to a [view](https://sailsjs.com/documentation/concepts/Views).  This is particularly useful for binding static views to a custom URL, and it's how the default homepage for new projects is set up out of the box.

The syntax for view targets is simple: it is just the path to the view file, without the file extension (e.g. `.ejs`) and relative to the **views/** folder :

```js
'GET /team': { view: 'brochure/about' }
```

This tells Sails to handle `GET` requests to `/team` by serving the view template located at `views/brochure/about.ejs` (assuming the default EJS [template engine](https://sailsjs.com/documentation/concepts/views/view-engines) is used).  As long as that view file exists, a **GET** request to  **/home** will display it. For consistency with Express/consolidate, if the specified relative path does not match a view file, then Sails will look for a sub-folder with the same name (e.g. `pages/brochure`) and serve the "index" view in that sub-folder (e.g. `pages/brochure/index.ejs`) if one exists.

> Note that since this route is bound directly to the view, none of your configured policies will be applied.  If you need to configure a policy, use `res.view()` from a controller action.  See [this StackOverflow question](http://stackoverflow.com/questions/21303217/sailsjs-policy-based-route-with-a-view/21340313#21340313) for more background information.



##### Redirect target syntax
You can have one address redirect to another, either within your Sails app or on another server entirely. This can be done just by specifying the redirect URL as a string:

```js
'/alias' : '/some/other/route/url',
'GET /google': 'http://www.google.com'
```

Be careful to avoid redirect loops when redirecting within your Sails app!

Note that when redirecting, the HTTP method of the original request (and any extra headers / parameters) will likely be lost, and the request will be transformed to a simple **GET** request.  In the above example, a **POST** request to **/alias** will result in a **GET** request to **/some/other/route**.  This is somewhat browser-dependent behavior, but it is recommended that you don't expect request methods and other data to survive a redirect.

##### Response target syntax
You can map an address directly to a default or custom [response](https://sailsjs.com/documentation/concepts/extending-sails/custom-responses) using this syntax:

```js
'/foo': { response: 'notFound' }
```

Simply specify the name of the response file in your **api/responses** folder, without the **.js** extension.  The response name in this syntax is case-sensitive.  If you attempt to bind a route to a non-existent response, Sails will output an error and ignore the route.

##### Policy target syntax

In most cases, you will want to apply [policies](https://sailsjs.com/documentation/concepts/policies) to your controller actions using the [**config/policies.js**](https://sailsjs.com/documentation/reference/configuration/sails-config-policies) config file.  However, there are some instances when you'll want to apply a policy directly to a custom route, particularly when you are using the [view](https://sailsjs.com/documentation/concepts/routes/custom-routes#?view-target-syntax) target syntax.  The policy target syntax is:

```js
'/foo': { policy: 'my-policy' }
```

Note that you will always want to chain the policy to at least one other type of target using an array:

```js
'/foo': [
  { policy: 'my-policy' },
  { view: 'dashboard' }
]
```

This will apply the **my-policy** policy to the route and, if it passes, continue by displaying the **views/dashboard.ejs** view.

##### Function target syntax

For one-off jobs (quick tests, for example), you can assign a route directly to a function:
```js
'/foo': function(req, res) {
  return res.send('hello!');
},
```

You can also combine this syntax with others using an array. This allows you to define quick, inline middleware:

```js
'/foo': [
  function(req, res, next) {
    sails.log('Quick and dirty test:', req.allParams());
    return next();
  },
  { controller: 'user', action: 'find' }
],
```

You can also use a dictionary with an `fn` key to assign a function.  This allows you to also specify [other route target  options](https://sailsjs.com/documentation/concepts/routes/custom-routes#?route-target-options) at the same time:
```js
'GET /*': {
  skipAssets: true,
  fn: function(req, res) {
    return res.send('hello!');
  }
},
```

> Best practice is to use the function syntax only for temporary routes, since doing so goes against the structural conventions that make Sails useful!  (Plus, the less cluttered your routes.js file, the better.)

### Route target options

In addition to the options discussed in the various route target syntaxes above, any other property added to a route target object will be passed through to the route handler in the `req.options` object.  There are several reserved properties that can be used to affect the behavior of the route handlers.  These are listed in the table below.

| Property    | Applicable Target Types       | Data Type | Details |
|-------------|:----------:|-----------|-----------|
|`skipAssets`|all|((boolean))|Set to `true` if you *don't* want the route to match URLs with dots in them (e.g. **myImage.jpg**).  This will keep your routes with [wildcard notation](https://sailsjs.com/documentation/concepts/routes/custom-routes#?wildcards-and-dynamic-parameters) from matching URLs of static assets.  Useful when creating [URL slugs](https://sailsjs.com/documentation/concepts/routes#url-slugs).|
|`skipRegex`|all|((regexp))|If skipping every URL containing a dot is too permissive, or you need a route's handler to be skipped based on different criteria entirely, you can use `skipRegex`.  This option allows you to specify a regular expression or array of regular expressions to match the request URL against; if any of the matches are successful, the handler is skipped.  Note that unlike the syntax for binding a handler with a regular expression, `skipRegex` expects *actual [RegExp objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp)*, not strings.|
|`locals`|[controller](https://sailsjs.com/documentation/concepts/routes/custom-routes#?controller-action-target-syntax), [view](https://sailsjs.com/documentation/concepts/routes/custom-routes#?view-target-syntax), [blueprint](https://sailsjs.com/documentation/concepts/routes/custom-routes#?routing-to-blueprint-actions), [response](https://sailsjs.com/documentation/concepts/routes/custom-routes#?response-target-syntax)|((dictionary))|Sets default [local variables](https://sailsjs.com/documentation/reference/response-res/res-view?q=arguments) to pass to any view that is rendered while handling the request.|
|`cors`|all|((dictionary)) or ((boolean)) or ((string))|Specifies how to handle requests for this route from a different origin.  See the [main CORS documentation](https://sailsjs.com/documentation/concepts/security/cors) for more info.|
|`csrf`|all|((boolean))|Indicate whether the route should be protected by requiring a CSRF token to be passed with the request.  See the [main CSRF documentation](https://sailsjs.com/documentation/concepts/security/csrf) for more info.
|`parseBlueprintOptions`|[blueprint](https://sailsjs.com/documentation/concepts/routes/custom-routes#?routing-to-blueprint-actions)|((function))|Provide this function in order to override the default behavior for a blueprint action (including search criteria, skip, limit, sort and population).  See the [blueprints configuration reference](https://sailsjs.com/documentation/reference/configuration/sails-config-blueprints#?using-parseblueprintoptions) for more info.
<docmeta name="displayName" value="Custom routes">
