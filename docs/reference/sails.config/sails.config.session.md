# `sails.config.session`

Configuration for Sails' built-in session support.

Sails' default session integration leans heavily on the great work already done by Express and Connect, but also adds
a bit of its own special sauce by hooking into the request interpreter.  This allows Sails to access and auto-save any changes your code makes to `req.session` when handling a virtual request from Socket.IO.  Most importantly, it means you can just write code that uses `req.session` in the way you might be used to from Express or Connect, whether your controller actions are designed to handle HTTP requests, WebSocket messages, or both.

### Properties

| Property    | Type       | Default   | Details |
|:------------|:----------:|:----------|:--------|
| `adapter`   | ((string))    | `undefined` | If left unspecified, Sails will use the default memory store bundled in the underlying session middleware.  This is fine for development, but in production, you _must_ pass in the name of an installed scalable session store module instead (e.g. `@sailshq/connect-redis`).  See [Production config](https://sailsjs.com/documentation/reference/configuration/sails-config-session#?production-config) below for details.
| `name`        | ((string))       | `sails.sid`      | The name of the session ID cookie to set in the response (and read from in the request) when sessions are enabled (which is the case by default for Sails apps). If you are running multiple different Sails apps from the same shared cookie namespace (i.e. the top-level DNS domain, like `frog-enthusiasts.net`), you must be especially careful to configure separate unique keys for each separate app, otherwise the wrong cookie could be used.
| `secret` | ((string))| _n/a_     | This session secret is automatically generated when your new app is created. Care should be taken any time this secret is changed in production, as doing so will invalidate the session cookies of your users, forcing them to log in again.  Note that this is also used as the "cookie secret" for signed cookies.
| `cookie` | ((dictionary)) | _see [below](https://sailsjs.com/documentation/reference/configuration/sails-config-session#?the-session-id-cookie)_ | Configuration for the session ID cookie, including `maxAge`, `secure`, and more.  See [below](https://sailsjs.com/documentation/reference/configuration/sails-config-session#?the-session-id-cookie) for more info.
| `isSessionDisabled` | ((function)) | (see details) | A function to be run for every request which, if it returns a <a href="https://developer.mozilla.org/en-US/docs/Glossary/Truthy" target="_blank">&ldquo;truthy&rdquo; value</a>, will cause session support to be disabled for the request (i.e. `req.session` will not exist).  By default, this function will check the request path against the [sails.LOOKS_LIKE_ASSET_RX](https://sailsjs.com/documentation/reference/application/advanced-usage/sails-looks-like-asset-rx) regular expression, effectively disabling session support when requesting [assets](https://sailsjs.com/documentation/concepts/assets).



### Advanced session config

If you are using Redis as a session store in development, additional configuration options are available. Most apps can use Sails' default Redis support as described [here](https://sailsjs.com/documentation/concepts/sessions#?using-redis-as-the-session-store), but some advanced use cases may include the following optional config:


| Property      | Type       | Default  | Details |
|:--------------|------------|:---------|:--------|
| `url`          | ((string)) | `undefined` | The URL of the Redis instance to connect to.  This may include one or more of the other settings below, e.g. `redis://:mypass@myredishost.com:1234/5` would indicate a `host` of `myredishost.com`, a `port` of `1234`, a `pass` of `mypass` and a `db` of `5`.  In general, you should use either `url` or a combination of the settings below, to avoid confusion.
| `host`         | ((string))  |`'127.0.0.1'` | Hostname of your Redis instance.  If a `url` setting is configured, this setting will be ignored.
| `port`         | ((number)) |`6379`   | Port of your Redis instance.  If a `url` setting is configured, this setting will be ignored.
| `pass`         | ((string)) | `undefined` | The password for your Redis instance. Leave blank if you are not using a password.  If a `url` setting is configured that includes a password, this setting will override the password in `url`.
| `db`           | ((number))  |`undefined`   | The index of the database to use within your Redis instance.  If specified, must be an integer.  _(On typical Redis setups, this will be a number between 0 and 15.)_  If a `url` setting is configured that includes a db, this setting will override the db in `url`.
| `client`       | ((ref))  | `undefined` | An already-connected Redis client to use.  If provided, any `url`, `host` and `port` settings will be ignored.  This setting is useful if you have a Redis Sentinel setup and need to connect using a module like <a href="https://www.npmjs.com/package/ioredis" target="_blank">`ioredis`</a>
| `onRedisDisconnect` | ((function)) | `undefined` | An optional function for Sails to call if the Redis connection is dropped.  Useful for placing your site in a temporary maintenance mode or "panic mode" (see [sails-hook-panic-mode](https://www.npmjs.com/package/sails-hook-panic-mode) for an example).
| `onRedisReconnect` | ((function)) | `undefined` | An optional function for Sails to call if a previously-dropped Redis connection is restored (see `onDisconnect` above).
| `handleConstructingSessionStore` | ((function)) | `undefined` | An optional override function for Sails to call instead of the standard session store construction behavior. To use this setting, please first read and understand the [relevant source code](https://github.com/balderdashy/sails/blob/master/lib/hooks/session/index.js#L415).

> Note: `onRedisDisconnect` and `onRedisReconnect` will only be called for Redis clients that are created by Sails for you; if you provide your own Redis client (see the `client` option above), these functions will _not_ be called automatically in the case of a disconnect or reconnect.



##### Using other session stores

Any session adapter written for Connect/Express works in Sails, as long as you use a compatible version.

The recommended production session store for Sails.js is Redis... but we realize that, for some apps, that isn't an option.  Fortunately, Sails.js supports almost any Connect/Express-compatible session store-- meaning you can store your sessions almost anywhere, whether that's Mongo, on the local filesystem, or even in a relational database.  Check out the community session stores for Sails.js, Express, and Connect [available on NPM](https://www.npmjs.com/search?q=connect%20session-).




### The session ID cookie

The built-in session integration in Sails works by using a session ID cookie.  This cookie is [HTTP-only](https://www.owasp.org/index.php/HttpOnly) (as safeguard against [XSS exploits](https://sailsjs.com/documentation/concepts/security/xss)), and by default, is set with the name "sails.sid".


##### The "__Host-" prefix.

By default, cookies have no integrity against same-site attackers.

In production enviroments, we recommend that you prefix the "name" of your cookie (`sails.config.session.name`) with "__Host-" to limit the scope of your cookie to a single origin.

You can read more about the "__Host-" prefix [here](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#attributes).

```js
session: {
  name: '__Host-sails.sid'
}
```

> Note: Adding this prefix requires the ["secure" flag](#the-secure-flag) to be set to `true`.

##### Expiration

The maximum age / expiration of your app's session ID cookie can be set as a number of milliseconds.

For example, to log users out after 24 hours:

```js
session: {
  cookie: {
    maxAge: 24 * 60 * 60 * 1000
  }
}
```

Otherwise, by default, this option is set as `null`, meaning that session ID cookies will not send any kind of ["Expires" or "Max Age" header](https://en.wikipedia.org/wiki/HTTP_cookie) and will last only for as long as a user's web browser is open.


##### The "secure" flag

Whether to set the ["Secure" flag](https://www.owasp.org/index.php/SecureFlag) on the session ID cookie.

```js
session: {
  cookie: {
    secure: true
  }
}
```

During development, when you are not using HTTPS, you should leave `sails.config.session.cookie.secure` as undefined (the default).

But in production, you'll want to set it to `true`.  This instructs web browsers that they should refuse to send back the session ID cookie _except_ over a secure protocol (`https://`).

> **Note:** If you are using HTTPS behind a proxy/load balancer&mdash;for example, on a PaaS like Heroku&mdash;then you should still set `secure: true`.  But note that, in order for sessions to work with `secure` enabled, you will _also_ need to set another option called [`sails.config.http.trustProxy`](https://sailsjs.com/documentation/reference/configuration/sails-config-http).


##### Do I need an SSL certificate?

In production?  Yes.

If you are relying on Sails's built-in session integration, please **always use an SSL certificate in production.**  Otherwise, the session ID cookie (or any other secure data) could be transmitted in plain-text, which would make it possible for an attacker in a coffee shop to eavesdrop on one of your authenticated user's HTTP requests, intercept their session ID cookie, then masquerade as them to wreak havoc.

Also realize that, even if you have an SSL certificate, and you always redirect `http://` to `https://`, for _all_ of your subdomains, it is still important to set `secure: true`.  (Because without it, even if you redirect all HTTP traffic immediately, that _very first request_ will  still have been made over `http://`, and thus would have transmitted the session ID cookie in plain text.)


##### Advanced options

To see other available options (like "[domain](https://stackoverflow.com/a/7887384/486547)") for configuring the session ID cookie in Sails, see [express-session#cookie](https://github.com/expressjs/session/blob/v1.15.6/README.md#cookie).



### Disabling sessions

Sessions are enabled by default in Sails.  To disable sessions in your app, disable the `session` hook by changing your `.sailsrc` file.  The process for disabling `session` is identical to the process for [disabling the Grunt hook](https://sailsjs.com/documentation/concepts/assets/disabling-grunt) (just type `session: false` instead of `grunt: false`).

> **Note:**
> If the session hook is disabled, the session secret configured as `sails.config.session.secret` will still be used to support signed cookies, if relevant.  If the session hook is disabled _AND_ no session secret configuration exists for your app (e.g. because you deleted `config/session.js`), then signed cookies will not be usable in your application.  To make more advanced changes to this behavior, you can customize any of your app's HTTP middleware manually using [`sails.config.http`](https://sailsjs.com/documentation/reference/configuration/sails-config-http).



<docmeta name="displayName" value="sails.config.session">
<docmeta name="pageType" value="property">
