# `.defaults`

The `defaults` feature can be implemented either as an object or a function which takes a single argument (see &ldquo;using `defaults` as a function&rdquo; below) and returns an object.  The object you specify will be used to provide default configuration values for Sails.  You should use this feature to specify default settings for your hook.  For example, if you were creating a hook that communicates with a remote service, you may want to provide a default domain and timeout length:

```
{
   myapihook: {
      timeout: 5000,
      domain: "www.myapi.com"
   }
}
```

If a `myapihook.timeout` value is provided via a Sails configuration file, that value will be used; otherwise it will default to `5000`.

##### Namespacing your hook configuration
For [project hooks](https://sailsjs.com/documentation/concepts/extending-sails/Hooks?q=types-of-hooks), you should namespace your hook&rsquo;s configuration under a key that uniquely identifies that hook (e.g. `myapihook` above).  For [installable hooks](https://sailsjs.com/documentation/concepts/extending-sails/Hooks?q=types-of-hooks), you should use the special `__configKey__` key to allow end-users of your hook to [change the configuration key](https://sailsjs.com/documentation/concepts/extending-sails/hooks/using-hooks?q=changing-the-way-sails-loads-an-installable-hook) if necessary.  The default key for a hook using `__configKey__` is the hook name.  For example, if you create a hook called `sails-hooks-myawesomehook` which includes the following `defaults` object:

```
{
   __configKey__: {
      name: "Super Bob"
   }
}
```

then it will, by default, provide default settings for the `sails.config.myawesomehook.name` value.  If the end-user of the hook overrides the hook name to be `foo`, then the `defaults` object will provide a default value for `sails.config.foo.name`.

##### Using `defaults` as a function

If you specify a function for the `defaults` feature instead of a plain object, it takes a single argument (`config`) which receives any Sails configuration overrides.  Configuration overrides can be made by passing settings to the command line when lifting Sails (e.g. `sails lift --prod`), by passing an object as the first argument when programmatically lifting or loading Sails (e.g. `Sails.lift({port: 1338}, ...)`) or by using a [`.sailsrc`](https://sailsjs.com/documentation/anatomy/.sailsrc) file.  The `defaults` function should return a plain object representing configuration defaults for your hook.


<docmeta name="displayName" value=".defaults">
<docmeta name="stabilityIndex" value="3">
