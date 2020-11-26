# `.configure`

The `configure` feature provides a way to configure a hook after the [`defaults` objects](https://sailsjs.com/documentation/concepts/extending-sails/hooks/hook-specification/defaults) have been applied to all hooks.  By the time a custom hook&rsquo;s `configure()` function runs, all user-level configuration and core hook settings will have been merged into `sails.config`.  However, you should *not* depend on the configuration of other custom hooks at this point, as the load order of custom hooks is not guaranteed.

`configure` should be implemented as a function with no arguments, and should not return any value.  For example, the following `configure` function could be used for a hook that communicates with a remote API, to change the API endpoint based on whether the user set the hook&rsquo;s `ssl` property to `true`.  Note that the hook&rsquo;s configuration key is available in `configure` as `this.configKey`:

```
configure: function() {

   // If SSL is on, use the HTTPS endpoint
   if (sails.config[this.configKey].ssl == true) {
      sails.config[this.configKey].url = "https://" + sails.config[this.configKey].domain;
   }
   // Otherwise use HTTP
   else {
      sails.config[this.configKey].url = "http://" + sails.config[this.configKey].domain;
   }
}
```

The main benefit of `configure` is that all hook `configure` functions are guaranteed to run before any [`initialize` functions](https://sailsjs.com/documentation/concepts/extending-sails/hooks/hook-specification/initialize) run; therefore, a hook&rsquo;s `initialize` function can examine the configuration settings of other hooks.


<docmeta name="displayName" value=".configure">
<docmeta name="stabilityIndex" value="3">
