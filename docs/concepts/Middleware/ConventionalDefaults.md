# Conventional defaults

Sails comes bundled with a suite of conventional HTTP middleware, ready to use.  Naturally, you may choose to disable, override, append to, or rearrange it, but the pre-installed stack is perfectly acceptable for most apps in development or production.  Below is a list of the standard HTTP middleware functions that come bundled in Sails, in the order they execute every time the server receives an incoming HTTP request:

 HTTP Middleware Key       | Purpose
 :------------------------ |:------------
 _cookieParser_ *          | Parses the cookie header into a clean object for use in subsequent middleware and your application code.
 _session_ *               | Creates or loads a unique session object (`req.session`) for the requesting user agent based on their cookies and your [session configuration](https://sailsjs.com/documentation/reference/configuration/sails-config-session).
 **bodyParser**            | Parses parameters and binary upstreams (for streaming file uploads) from the HTTP request body using [Skipper](https://github.com/balderdashy/skipper).
 **compress**              | Compresses response data using gzip/deflate. See [`compression`](https://github.com/expressjs/compression) for details.
 **poweredBy**             | Attaches an `X-Powered-By` header to outgoing responses.
 _router_ *                | This is where the bulk of your app logic gets applied to any given request.  In addition to running `"before"` handlers in hooks (e.g. csrf token enforcement) and some internal Sails logic, this routes requests using your app's explicit routes (in [`sails.config.routes`](https://sailsjs.com/documentation/reference/configuration/sails-config-routes)) and/or route blueprints.
 _www_ *                   | Serves static files&mdash;usually images, stylesheets, scripts&mdash;in your app's "public" folder (configured in [`sails.config.paths`](https://github.com/balderdashy/sails/blob/master/docs/PAGE_NEEDED.md), conventionally [`.tmp/public/`](https://github.com/balderdashy/sails/blob/master/docs/PAGE_NEEDED.md)) using Connect's [static middleware](http://www.senchalabs.org/connect/static.html).
 **favicon**               | Serves the [browser favicon](http://en.wikipedia.org/wiki/Favicon) for your app if one is provided as `/assets/favicon.ico`.


###### Legend:

+ `*` : The middleware with an asterisk (*) should _almost never_ need to be modified or removed. Please only do so if you really understand what you're doing.


<docmeta name="displayName" value="Conventional defaults">
