# `sails.config.http`

Configuration for your app's underlying HTTP server.  These properties are conventionally specified in the [`config/http.js`](https://sailsjs.com/documentation/anatomy/config/http.js) configuration file.


### Properties

  Property          | Type       | Default   | Details
:------------------ |:----------:| --------- |:-------
 `middleware`       | ((dictionary)) | See [conventional defaults for HTTP middleware](https://sailsjs.com/documentation/concepts/Middleware?q=conventional-defaults) | A dictionary of all HTTP middleware functions your app will run on every incoming HTTP request.<br/>[Example](https://gist.github.com/mikermcneil/9cbd68c95839da480e97)
 `middleware.order` | ((array))  | See [conventional defaults for HTTP middleware order](https://github.com/balderdashy/sails/blob/master/lib/hooks/http/index.js#l51-66) | An array of middleware names (strings) indicating the order in which middleware should be run for all incoming HTTP requests.
 `cache`            | ((number)) | `31557600000` _(1 year)_ | The number of milliseconds to cache [static assets](https://sailsjs.com/documentation/concepts/assets) when your app is running in a ['production' environment](https://sailsjs.com/documentation/reference/configuration/sails-config#?sailsconfigenvironment).<br/>More specifically, this is the "max-age" that will be included in the "Cache-Control" header when responding to requests for static assets&mdash;i.e. any flat files like images, scripts, stylesheets, etc. that are served by Express' static middleware.
 `serverOptions`    | ((dictionary)) | `{}`      | _SSL only_: advanced options to send directly to the [Node `https` module](https://nodejs.org/dist/latest/docs/api/https.html) when creating the server.  These will be merged with your [SSL settings](https://sailsjs.com/documentation/reference/configuration/sails-config#?sailsconfigssl), if any.  See the [createServer docs](https://nodejs.org/dist/latest/docs/api/https.html#https_https_createserver_options_requestlistener) for more info.
  `trustProxy`      | ((boolean)) _or_ ((function)) | `undefined`      | This tells Sails/Express how it should interpret "X-Forwarded" headers.  Only use this setting if you are using HTTPS _and_ if you are deploying behind a proxy (for example, a PaaS like Heroku).  If your app does not fit that description, then leave this as undefined.  Otherwise, you might start by setting this to `true`, which works for many deployments.  If that doesn't work, see [here](https://expressjs.com/en/guide/behind-proxies.html) for all available options.


### Customizing the body parser

The _body parser_ is what Sails/Express apps use to read and understand the body of incoming HTTP requests.  Many different body parsers are available, each with their own strengths and weaknesses.  By default, Sails apps use [Skipper](http://github.com/balderdashy/skipper), a general-purpose solution that knows how to parse most kinds of HTTP request bodies and provides support for streaming, multipart file uploads.

> You can specify a different body parser or a custom function with `req`, `res`, and `next` parameters (just like any other [HTTP middleware function](https://sailsjs.com/documentation/concepts/middleware).)

##### Configuring Skipper

To customize Skipper, first make sure to `npm install skipper --save` in your app.  Next, uncomment the following code in your `config/http.js` file:

```javascript
bodyParser: (function _configureBodyParser(){
  var skipper = require('skipper');
  var middlewareFn = skipper({
    strict: true,
    // ... more Skipper options here ...
  });
  return middlewareFn;
})(),
```

Then pass in any of the following options from the table below.

  Property                               | Type        | Default   | Details
:--------------------------------------- |:-----------:|:--------- |:-------
 `maxWaitTimeBeforePassingControlToApp`  | ((number))  | `500`     | The maximum number of milliseconds to wait when processing an incoming multipart request before passing control to your app's policies and controllers.  If this number of milliseconds elapses without any incoming file uploads, and the request hasn't finished sending other data like text parameters (i.e. the form emits "close"), then control will be passed without further delay.  For apps running behind particular combinations of load balancers, proxies, and/or SSL, it may be necessary to increase this delay (see https://github.com/balderdashy/skipper/issues/71#issuecomment-217556631).
 `maxTimeToWaitForFirstFile`             | ((number))  | `10000`   | The maximum number of milliseconds to wait for the first file upload to arrive in any given upstream before triggering `.upload()`'s callback.  If the first file upload on a given upstream does not arrive before this number of milliseconds have elapsed, then an `ETIMEOUT` error will fire.
 `maxTimeToBuffer`                         | ((number))  | `4500`    | The maximum number of milliseconds to wait for any given live [upstream](https://github.com/balderdashy/skipper#what-are-upstreams) to be plugged in to a receiver after it begins receiving an incoming file upload.  Skipper pauses upstreams to allow custom code in your app's policies and controller actions to run (e.g. doing database lookups) before you "plug in" the incoming file uploads (e.g. `req.file('avatar').upload(...)`) to your desired upload target (local disk, S3, gridfs, etc).  Incoming bytes are managed using [a combination of buffering and TCP backpressure](https://howtonode.org/streams-explained) built into Node.js streams.  The max buffer time is a configurable layer of defense to protect against denial of service attacks that attempt to flood servers with pending file uploads.  If the timeout is exceeded, an EMAXBUFFER error will fire.  The best defense against these types of attacks is to plug incoming file uploads into receivers as early as possible at the top of your controller actions.
 `strict`           | ((boolean)) | `true`    | When enabled, the body of incoming HTTP requests will only be parsed as JSON if it appears to be an array or dictionary (i.e. plain JavaScript object).  Otherwise, if _disabled_, the body parser will accept anything `JSON.parse()` accepts (including `null`, `true`, `false`, numbers, and double-quote-wrapped strings).  While these other types of data are uncommon in practice, they are technically JSON compatible; therefore, this setting is enabled by default.
 `extended`         | ((boolean)) | `true`    | Whether or not to understand multiple text parameters in square bracket notation in the URL-encoded request body (e.g. `courseId[]=ARY%20301&courseId[]=PSY%20420`) encoded  the HTTP body as an array (e.g. `courseId: ['ARY 301', 'PSY 420'], ...`).  Enabled by default.  See https://github.com/expressjs/body-parser#extended for more details.
 `onBodyParserError` | ((function)) | (see details) | An optional function to be called if Skipper encounters an error while parsing the request body (for example, if it encounters malformed JSON).  The function accepts four arguments: `err`, `req`, `res` and `next`.  Sails provides a default implementation that responds to the request with a 400 status and a message detailing the error encountered.  If no `onBodyParserError` function is provided, parser errors will be passed to `next()` and handled by the next available [error-handling middleware](https://expressjs.com/en/guide/error-handling.html).

> Note that, to allow for performance tuning and other advanced configuration, the options you pass in to Skipper this way are also passed through to the underlying Express body parser.  See the [body-parser repo](https://github.com/expressjs/body-parser) for a full list of lower-level options.


### Compatibility

Most middleware compatible with [Express](https://github.com/expressjs/), [Connect](https://github.com/senchalabs/connect), [Kraken](http://krakenjs.com/), [Loopback](https://github.com/strongloop/loopback), or [Pillar](https://pillarjs.github.io/) can also be used in a Sails app.

### Notes

> + Note that this HTTP middleware stack configured in `sails.config.http.middleware` is only applied to true HTTP requests&mdash;it is ignored when handling virtual requests (e.g. sockets).
> + The middleware named `router` is what handles all of your app's explicit routes (i.e. `sails.config.routes`), as well as shadow routes that are injected for blueprints, policies, etc.
> + You cannot define a custom middleware function with the key `order` (since `sails.config.http.middleware.order` has special meaning).



<docmeta name="displayName" value="sails.config.http">
<docmeta name="pageType" value="property">
