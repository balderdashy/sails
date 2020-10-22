# Miscellaneous (`sails.config.*`)

For a conceptual overview of configuration in Sails, see https://sailsjs.com/documentation/concepts/Configuration.

This page is a quick reference of assorted configuration topics that don't fit elsewhere, namely top-level properties on the sails.config object.  Many of these properties are best set on a [per-environment basis](https://sailsjs.com/documentation/anatomy/my-app/config/env), or in your [config/local.js](https://sailsjs.com/documentation/concepts/configuration/the-local-js-file).  To set them globally for your app, create a new file in the `config` folder (e.g. `config/misc.js`) and add them there.

### `sails.config.port`

The `port` setting determines which <a href="http://en.wikipedia.org/wiki/Port_(computer_networking)">TCP port</a> your Sails app will use to listen for incoming requests.  Ports are a [transport-layer](https://en.wikipedia.org/wiki/Transport_layer) concept designed to allow many different networking applications to run at the same time on a single computer.

By default, if it&rsquo;s set, Sails uses the port configured in your app (`sails.config.port`).  If not, it checks to see if the `PORT` environment variable is set, and uses that if possible.  Otherwise it falls back to port 1337.

> In production, you will probably want Sails to listen on port 80 (or 443, if you have an SSL certificate and are serving your site via `https://`), but depending on where your app is deployed, you may or may not need to actually modify this setting.  For example, if you are deploying behind a proxy, or to a PaaS like [Heroku](http://heroku.com), [Azure App Service](https://azure.microsoft.com/en-us/services/app-service/), or [Deis](http://deis.io/), you probably won't need to configure `sails.config.port`, since in most cases that's handled automatically.  For more guidance and tips related to deploying, scaling, and maintaining Sails in production, see [Concepts > Deployment](https://sailsjs.com/documentation/concepts/deployment).


### `sails.config.explicitHost`

By default, Sails will assume `localhost` as the host that will be listening for incoming requests.  This will work in the majority of hosting environments you encounter, but in some cases ([OpenShift](http://www.openshift.com) being one example) you'll need to explicitly declare the host name of your Sails app.  Setting `explicitHost` tells Sails to listen for requests on that host instead of `localhost`.


### `sails.config.environment`

The runtime &ldquo;environment&rdquo; of your Sails app is usually either `development` or `production`.

In development, your Sails app will go out of its way to help you (for instance you will receive more descriptive error and debugging output).

In production, Sails configures itself (and its dependencies) to optimize performance.  You should always put your app in production mode before you deploy it to a server; this helps ensure that your Sails app remains stable, performant, and scalable.

#### Using the "production" environment

By default, Sails determines its environment using the `NODE_ENV` environment variable. If `NODE_ENV` is not set, Sails will look to see if you provided a `sails.config.environment` setting, and use it if possible.  Otherwise, it runs in the development environment.

When you lift your app with the `NODE_ENV` environment variable set to `production`, Sails automatically sets `sails.config.environment` to `production` too.  This is the recommended way of switching to production mode. We don't usually recommend configuring `sails.config.environment` manually, since some of Sails&rsquo; dependencies rely on the `NODE_ENV` environment variable, and it is automatically set by most Sails/Node.js hosting services.

If you attempt to lift a Sails app in the production environment _without_ setting `NODE_ENV` to `production` (for example, by running `sails lift --prod`), Sails automatically sets `NODE_ENV` to `production` for you.  If you attempt to lift a Sails app in production while `NODE_ENV` is set to a _different_ value (for example `NODE_ENV=development sails lift --prod`), the app fails to start.

> For more background on configuring your Sails app for production, see [Concepts > Deployment](https://sailsjs.com/documentation/concepts/deployment).

Note that it is perfectly valid to set `sails.config.environment` to something else entirely, like "staging", while still setting `NODE_ENV=production`.  This causes Sails to load a different environment-specific configuration file (e.g. `config/env/staging.js`) and Grunt task (e.g. `tasks/register/staging.js`), while still otherwise acting like it's in production.


### `sails.config.hookTimeout`

A time limit, in milliseconds, imposed on all hooks in your app.  Sails will give up if any hook takes longer than this to load.  Defaults to `20000` (20 seconds).

> The most common reason to change this setting is to tolerate slow production Grunt tasks.  For example, if your app is using uglify, and you have lots and lots of client-side JavaScript files in your assets folder, then you might need Sails to wait longer than 20 seconds to compile all of those client-side assets.  For more tips about the production asset pipeline, see [Concepts > Deployment](https://sailsjs.com/documentation/concepts/deployment).

### `sails.config.ssl`

SSL/TLS (transport-layer security) is critical for preventing potential man-in-the-middle attacks.  Without a protocol like SSL/TLS, web basics like securely transmitting login credentials and credit card numbers would be much more complicated and troublesome.  SSL/TLS is not only important for HTTP requests (`https://`), it's also necessary for WebSockets (over `wss://`).  Fortunately, you only need to worry about configuring SSL settings in one place: `sails.config.ssl`.

> ##### SSL and load balancers
>
> The `sails.config.ssl` setting is only relevant if you want your _Sails process_ to manage SSL.  This isn't always the case.  For example, if you expect your Sails app to get more traffic over time, it will need to scale to multiple servers, necessitating a load balancer.  Most of the time, for performance and simplicity, it is a good idea to terminate SSL at your load balancer.  If you do that, then since SSL/TLS will have already been dealt with _before packets reach your Sails app_, you won't need to use the `sails.config.ssl` setting at all.  (This is also true if you're using a PaaS like Heroku, or almost any other host with a built-in load balancer.)
>
> If you're satisfied that this configuration setting applies to your app, then please continue below for more details.

Use `sails.config.ssl` to set up basic SSL server options, or to indicate that you will be specifying more advanced options in [sails.config.http.serverOptions](https://sailsjs.com/documentation/reference/configuration/sails-config-http#?properties).

If you specify a dictionary, it should contain both `key` _and_ `cert` keys, _or_ a `pfx` key. The presence of those options indicates to Sails that your app should be lifted with an HTTPS server.  If your app requires a more complex SSL setup (for example by using [SNICallback](https://nodejs.org/api/tls.html#tls_tls_createserver_options_secureconnectionlistener)), set `sails.config.ssl` to `true` and specify your advanced options in [sails.config.http.serverOptions](https://sailsjs.com/documentation/reference/configuration/sails-config-http#?properties).

#### SSL configuration example

For this example, we'll assume you created a folder in your project, `config/ssl/` and dumped your certificate/key files inside.  Then, in one of your config files, include the following:

```javascript
// Assuming this is in `config/env/production.js`, and your folder of SSL cert/key files is in `config/ssl/`:

ssl: {
  ca: require('fs').readFileSync(require('path').resolve(__dirname,'../ssl/my-gd-bundle.crt')),
  key: require('fs').readFileSync(require('path').resolve(__dirname,'../ssl/my-ssl.key')),
  cert: require('fs').readFileSync(require('path').resolve(__dirname,'../ssl/my-ssl.crt'))
}
```

<docmeta name="displayName" value="sails.config.*">
