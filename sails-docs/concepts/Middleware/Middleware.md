# Middleware

Technically, much of the code you&rsquo;ll write in a Sails app is _middleware_, in that runs in between the incoming request and the outgoing response&mdash;that is, in the "middle" of the request/response stack.  In an MVC framework, the term &ldquo;middleware&rdquo; typically refers more specifically to code that runs _before_ or _after_ your route-handling code (i.e. your [controller actions](https://sailsjs.com/documentation/concepts/Controllers?q=actions)), making it possible to apply the same piece of code to multiple routes or actions.  Sails has robust support for the middleware design pattern.  Depending on your needs, you may choose to implement:

* HTTP middleware&mdash;to apply code before _every_ HTTP request (see below for more details)
* [Policies](https://sailsjs.com/documentation/concepts/policies)&mdash;to apply code before one or more controller actions
* [Hooks with the `routes` feature implemented](https://sailsjs.com/documentation/concepts/extending-sails/hooks/hook-specification/routes)&mdash;to apply code before one or more route handlers
* [Custom responses](https://sailsjs.com/documentation/concepts/custom-responses)&mdash;to apply code after one or more controller actions

### HTTP middleware

Sails is fully compatible with Express / Connect middleware, which are functions that accept `req`, `res` and `next` as arguments.  Every app utilizes a configurable _middleware stack_ for handling HTTP requests.  Each time the app receives an HTTP request, its configured HTTP middleware stack runs in order.

> Note that this HTTP middleware stack is only used for "true" HTTP requests; it is ignored for **virtual requests** (e.g. requests from a live Socket.io connection).

##### Built-in HTTP middleware

By default, Sails uses a few different middleware functions to handle low-level HTTP-related tasks.  These are things like interpreting cookies, parsing HTTP request bodies, serving assets, and even attaching your app's routes.  You can read more about the default middleware stack [here](https://sailsjs.com/documentation/concepts/middleware/conventional-defaults).


### Configuring the HTTP middleware stack

Since the middleware stack comes with reasonable defaults, many Sails apps won't need to modify this configuration at all.  But for situations where you need more flexibility, Sails makes it simple to add, reorder, override, and disable the functions in your app's HTTP middleware stack.

##### Adding middleware
To configure a new custom HTTP middleware function, add a middleware function as a new key in `middleware` (e.g. "foobar"), then add the name of its key ("foobar") in the `middleware.order` array, wherever you'd like it to run in the middleware chain.

With the exception of "order", which is reserved for configuring the order of the middleware stack, any value assigned to a key of `sails.config.middleware` should be a function which takes three arguments: `req`, `res` and `next`.  This function works almost exactly like a [policy](https://sailsjs.com/documentation/concepts/policies), the only visible difference is when it's executed.

##### Initializing middleware
If you need to run some one-time set up code for a custom middleware function, you'll need to do so _before_ passing it in.  The recommended way of doing this is with a self-calling (i.e. ["immediately-invoked"](https://en.wikipedia.org/wiki/Immediately-invoked_function_expression)) wrapper function.  In the example below, note that rather than setting the value to a "req, res, next" function directly, a self-calling function is used to "wrap" some initial setup code.  That self-calling wrapper function then returns the final middleware (req,res,next) function, so it gets set on the key just the same was as if it had been passed in directly.

##### Example: using custom middleware
The following example shows how you might set up three different custom HTTP middleware functions:

```js
// config/http.js
module.exports.http = {

  middleware: {

    order: [
      'cookieParser',
      'session',
      'passportInit',            // <==== If you're using "passport", you'll want to have its two
      'passportSession',         // <==== middleware functions run after "session".
      'bodyParser',
      'compress',
      'foobar',                  // <==== We can put other, custom HTTP middleware like this wherever we want.
      'poweredBy',
      'router',
      'www',
      'favicon',
    ],


    // An example of a custom HTTP middleware function:
    foobar: (function (){
      console.log('Initializing `foobar` (HTTP middleware)...');
      return function (req,res,next) {
        console.log('Received HTTP request: '+req.method+' '+req.path);
        return next();
      };
    })(),

    // An example of a couple of 3rd-party HTTP middleware functions:
    // (notice that this time we're using an existing middleware library from npm)
    passportInit    : (function (){
      var passport = require('passport');
      var reqResNextFn = passport.initialize();
      return reqResNextFn;
    })(),

    passportSession : (function (){
      var passport = require('passport');
      var reqResNextFn = passport.session();
      return reqResNextFn;
    })()

  },
}
```

##### Overriding or disabling built-in HTTP middleware

You can also use the strategy described above to _override_ built-in middleware like the body parser (see [Customizing the body parser](https://sailsjs.com/documentation/reference/configuration/sails-config-http#?customizing-the-body-parser)).

> While this is not recommended, you can even _disable_ a built-in HTTP middleware function entirely&mdash;just remove it from the `middleware.order` array.  This allows for complete flexibility, but it should be used with care.  If you choose to disable a piece of built-in middleware, make sure you fully understand the consequences. Disabling built-in HTTP middleware may dramatically change the way your app works.


### Express middleware in Sails

One of the really nice things about Sails apps is that they can take advantage of the wealth of existing Express/Connect middleware,  but a common question arises when people _actually_ try to do this:

> _"Where do I `app.use()` this thing?"_.

In most cases, the answer is to install the Express middleware as a custom HTTP middleware in [`sails.config.http.middleware`](https://sailsjs.com/documentation/reference/configuration/sails-config-http).  This will trigger it for all HTTP requests to your Sails app, and allow you to configure the order in which it runs in relation to other HTTP middleware.

> You should never override or remove the `router` HTTP middleware.  It is built-in to Sails; without it, your app's explicit routes and blueprint routes will not work.


##### Express middleware as policies

To make Express middleware apply to only a particular action, you can also include Express middleware as a policy&mdash;just be sure that you actually want it to run for both HTTP _and_ virtual socket requests.

To do this, edit [`config/policies.js`](https://sailsjs.com/documentation/reference/configuration/sails-config-policies) to either require and setup the middleware in an actual wrapper policy (usually a good idea) or to require it directly in your policies.js file.  The following example uses the latter strategy for brevity:

```js
var auth = require('http-auth');
var basic = auth.basic({
  realm: 'admin area'
}, function (username, password, onwards) {
  return onwards(username === 'Tina' && password === 'Bullock');
});

//...
module.exports.policies = {
  '*': [true],

  // Prevent end users from doing CRUD operations on products reserved for admins
  // (uses HTTP basic auth)
  'product/*': [auth.connect(basic)],

  // Everyone can view product pages
  'product/show': [true]
}
```



<!--

  FUTURE:

### Advanced Express Middleware In Sails

You can actually do this in a few different ways, depending on your needs.



Generally, the following best-practices apply:

If you want a middleware function

+ If you want a piece of middleware to run only when your app's explicit or blueprint routes are matched, you should include it as a policy.
+ this will run passport for all incoming http requests, including images, css, etc.

If you want a middleware function to run for all you should include it at the top of your `config/routes.js` as a wildcard route.  for your controller (both HTTP and virtual) requests
-->






<docmeta name="displayName" value="Middleware">
