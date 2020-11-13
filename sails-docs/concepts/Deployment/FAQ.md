# FAQ


### Can I use environment variables?

Yes! Like any Node app, your environment variables are available as `process.env`.

Sails also comes with built-in support for creating your own custom configuration settings that will be exposed directly on `sails.config`.  And whether custom or built-in, any of the configuration properties in `sails.config` can be overridden using environment variables.  See the conceptual documentation on [Configuration](https://sailsjs.com/documentation/concepts/configuration) for details.


### Where do I put my production database credentials?  Other settings?

The easiest way to add configuration to your Sails app is by modifying the files in `config/` or adding new ones. Sails supports environment-specific configuration loading out of the box, so you can use `config/env/production.js`.  Again, see the conceptual documentation on [Configuration](https://sailsjs.com/documentation/concepts/configuration) for details.

But sometimes you don't want to put certain configuration information into your repository.  **The best place to put this kind of configuration is in environment variables.**

That said, for development (e.g. on your laptop) using environment variables can sometimes be cumbersome.  So for your other deployment/machine-specific settings, namely any kind of credentials you want to keep private, you can also use your `config/local.js` file.  This file is included in your `.gitignore` file by default, which helps prevent you from inadvertently commiting your credentials to your code repository.

**config/local.js**
```javascript
// Local configuration
// 
// Included in the .gitignore by default,
// this is where you include configuration overrides for your local system
// or for a production deployment.
//
// For example, to use port 80 on the local machine, override the `port` config
module.exports = {
    port: 80,
    environment: 'production',
    adapters: {
        mysql: {
            user: 'root',
            password: '12345'
        }
    }
}
```



### How do I get my Sails app on the server?

If you are using a Paas like Heroku or Modulus, it's easy: just follow their instructions!

Otherwise, get the IP address of your server and `ssh` onto it.  Then `npm install -g sails` and `npm install -g forever` to install Sails and `forever` globally from NPM for the first time on the server. Finally `git clone` your project (or `scp` it onto the server if it's not in a git repo) into a new folder on the server, `cd` into it, and then run `forever start app.js`.


### What should I expect as far as performance?

Baseline performance in Sails is comparable to what you'd expect from a standard Node.js/Express application.  In other words, it's fast!  We've done some optimizations ourselves in Sails core, but our primary focus is not messing up what we get for free from our dependencies.  For a quick and dirty benchmark, see [http://serdardogruyol.com/sails-vs-rails-a-quick-and-dirty-benchmark](http://serdardogruyol.com/sails-vs-rails-a-quick-and-dirty-benchmark).

The most common performance bottleneck in production Sails applications is the database.  Over the lifetime of an application with a growing user base, it becomes increasingly important to set up good indexes on your tables/collections and use queries which return paginated results.  Eventually, as your production database grows to contain tens of millions of records, you will start to locate and optimize slow queries by hand (either by calling [`.query()`](https://sailsjs.com/documentation/reference/waterline-orm/models/query) or [`.native()`](https://sailsjs.com/documentation/reference/waterline-orm/models/native), or by using the underlying database driver from NPM).  


### What's this warning about the connect session memory store?

If you are using sessions in your Sails app, you should not use the built-in memory store in production.  The memory session store is a development-only tool that does not scale to multiple servers; even if you only have one server it is not particularly performant (see [#3099](https://github.com/balderdashy/sails/issues/3099) and [#2779](https://github.com/balderdashy/sails/issues/2779)).

For instructions on configuring a production session store, see [sails.config.session](https://sailsjs.com/documentation/reference/configuration/sails-config-session).  If you want to disable session support altogether, turn off the `session` hook in your app's `.sailsrc` file:
```javascript
"hooks": {
  "session": false
}
```


<docmeta name="displayName" value="FAQ">

