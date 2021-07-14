# How sessions work in Sails (advanced)

For our purposes, **sessions** are defined to be a few components that together allow you to store information about a user agent between requests.

> A **user agent** is the software (browser or native application) that represents you on a device (e.g. a browser tab on your computer, a smartphone application, or your refrigerator).  It is associated one-to-one with a cookie or access token.

Sessions can be very useful because the request/response cycle is **stateless**. The request/response cycle is considered stateless because neither the client nor the server inherently stores any information between different requests about a particular request.  Therefore, the lifecycle of a request/response ends when a response is made to the requesting user agent (e.g. `res.send()`).

Note: we’re going to discuss sessions in the context of a browser user agent. While you can use sessions in Sails for whatever you like, it is generally a best practice to use them purely for storing the state of user agent authentication. Authentication is a process that allows a user agent to prove that they have a certain identity.  For example, in order to access some protected functionality, I might need to prove that my browser tab actually corresponds with a particular user record in a database.  If I provide you with a unique name and a password, you can look up the name and compare my password with a stored (hopefully [encrypted](http://node-machine.org/machinepack-passwords/encrypt-password)) password.  If there's a match, I'm authenticated. But how do you store that "authenticated-ness" between requests? That's where sessions come in.

### What sessions are made of
There are three main components to the implementation of sessions in Sails:
1. the **session store** where information is retained
2. the middleware that manages the session
3. a cookie that is sent along with every request and stores a session id (by default, `sails.sid`)

The **session store** can either be in memory (this is the default Sails session store) or in a database (Sails has built-in support for using Redis for this purpose).  Sails builds on top of Connect middleware to manage the session, which includes using a **cookie** to store a session id (`sid`) on the user agent.

### A day in the life of a request, a response, and a session
When a request is sent to Sails, the request header is parsed by the session middleware.

##### Scenario 1: The request header has no cookie

If the header does not contain a cookie, a `sid` is created in the session and a default session dictionary is added to `req` (e.g. `req.session`).  At this point you can make changes to the session property (usually in a controller/action).  For example, let's look at the following login action:

```javascript
module.exports = {

  login: function(req, res) {

    // Authentication code here

    // If successfully authenticated

    req.session.userId = foundUser.id;   // returned from a database

    return res.json(foundUser);

  }
}
```

Here we added a `userId` property to `req.session`.

> **Note:** the property will not be stored in the session store, nor will it be available to other requests until the response is sent.

Once the response is sent, any new requests will have access to `req.session.userId`. Since we didn't have a cookie in the request header, a cookie will be established for us.

##### Scenario 2: The request header has a cookie with a `Sails.sid`

Now when the user agent makes the next request, the `Sails.sid` stored on the cookie is checked for authenticity. If it matches an existing `sid` in the session store, the contents of the session store are added as a property on the `req` dictionary (`req.session`).  We can access properties on `req.session` (e.g. `req.session.userId`) or set properties on it (e.g. `req.session.userId == someValue`).  The values in the session store might change, but the `Sails.sid` and `sid` generally do not.

### When does the `Sails.sid` change?
During development, the Sails session store is in memory.  Therefore, when you close the Sails server, the current session store disappears.  When Sails is restarted, although a user agent request contains a `Sails.sid` in the cookie, the `sid` is no longer in the session store.  Therefore, a new `sid` will be generated and replaced in the cookie.  The `Sails.sid` will also change if the user agent cookie expires or is removed.

>The lifespan of a Sails cookie can be changed from its default setting (never expires) to a new setting by accessing the `cookie.maxAge` property in `projectName/config/session.js`.


### Using Redis as the session store

Redis is a key-value database package that can be used as a session store that is separate from the Sails instance.  This configuration for sessions has two benefits.  The first is that the session store will remain viable between Sails restarts.  The second is that if you have multiple Sails instances behind a load balancer, all of the instances can point to a single consolidated session store.

#### Enabling Redis session store in development

To enable Redis as your session store in development, first make sure you have a local Redis instance running on your machine (`redis-server`). Then, lift your app with `sails lift --redis`.

This is just a shortcut for `sails lift --session.adapter=@sailshq/connect-redis --sockets.adapter=@sailshq/socket.io-redis`. These packages are included as dependencies of new Sails apps by default, but if you're working with an upgraded app you'll need to `npm install @sailshq/connect-redis` and `npm install @sailshq/socket.io-redis`.

> Note that this built-in configuration uses your local Redis instance. For advanced session configuration options, see [Reference > Configuration > sails.config.session](https://sailsjs.com/documentation/reference/configuration/sails-config-session).

#### Nerdy details of how the session cookie is created
The value for the cookie is created by first hashing the `sid` with a configurable *secret* which is just a long string.

> You can change the session `secret` property in `projectName/config/session.js`.

The Sails `sid` (e.g. `Sails.sid`) then becomes a combination of the plain `sid` followed by a hash of the `sid` plus the `secret`.  To take this out of the world of abstraction, let's use an example.  Sails creates a `sid` of `234lj232hg234jluy32UUYUHH` and a `session secret` of `9238cca11a83d473e10981c49c4f`. These values are simply two strings that Sails combines and hashes to create a `signature` of `AuSosBAbL9t3Ev44EofZtIpiMuV7fB2oi`.  So the `Sails.sid` becomes `234lj232hg234jluy32UUYUHH.AuSosBAbL9t3Ev44EofZtIpiMuV7fB2oi` and is stored in the user agent cookie by sending a `set-cookie` property in the response header.

**What does this prevent?** This prevents a user from guessing the `sid`. It also prevents a evildoer from spoofing a user into making an authetication request with a `sid` that the evildoer knows.  This could allow the evildoer to use the `sid` to do bad things while the user is authenticated via the session.

### Disabling sessions

Even if your Sails app is designed to be accessed by non-browser clients, such as toasters, you are strongly encouraged to use sessions for authentication.  While it can sometimes be complex to understand, the built-in session mechanism in Sails (session store + HTTP-only cookies) is a tried and true solution that is generally [less brittle, easier to use, and lower-risk than rolling out something yourself](http://cryto.net/~joepie91/blog/2016/06/13/stop-using-jwt-for-sessions/).

That said, sessions may not always be an option (for example, if you must [integrate with a different authentication scheme](https://github.com/sails101/jwt-login) like JWT).  In these cases, you can disable sessions on an app-wide or per-request basis.

##### Disabling sessions for your entire app

To entirely turn off session support for your app, add the following to your `.sailsrc` file:

```javascript
"hooks": {
  "session": false
}
```

This disables the core Sails session hook.  You can also accomplish this by setting the `sails_hooks__session` environment variable to `false`.

##### Disabling sessions for certain requests

To turn off session support on a per-route (or per-request) basis, use the [`sails.config.session.isSessionDisabled` setting](https://sailsjs.com/documentation/reference/configuration/sails-config-session#?properties).  By default, Sails enables session support for all requests except those that [look like](https://sailsjs.com/documentation/reference/application/advanced-usage/sails-looks-like-asset-rx) they're pointed at static assets like images, stylesheets, etc.

<docmeta name="displayName" value="Sessions">
