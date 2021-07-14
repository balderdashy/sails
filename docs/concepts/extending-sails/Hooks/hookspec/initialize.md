# `.initialize`

The `initialize` feature allows a hook to perform startup tasks that may be asynchronous or rely on other hooks.  All Sails configuration is guaranteed to be completed before a hook&rsquo;s `initialize` function runs.  Examples of tasks that you may want to put in `initialize` include:

* logging in to a remote API
* reading from a database that will be used by hook methods
* loading support files from a user-configured directory
* waiting for another hook to load first

Like all hook features, `initialize` is optional and can be left out of your hook definition.  If implemented, `initialize` should be an `async function` which must be resolved (i.e. not throw or hang forever) in order for Sails to finish loading:

```javascript
initialize: async function() {

   // Do some stuff here to initialize hook

}
```

##### Hook timeout settings

By default, hooks have ten seconds to complete their `initialize` function and resolve before Sails throws an error.  That timeout can be configured by setting the `_hookTimeout` key to the number of milliseconds that Sails should wait.  This can be done in the hook&rsquo;s [`defaults`](https://sailsjs.com/documentation/concepts/extending-sails/hooks/hook-specification/defaults):

```
defaults: {
   __configKey__: {
      _hookTimeout: 20000 // wait 20 seconds before timing out
   }
}
```

##### Hook events and dependencies

When a hook successfully initializes, it emits an event with the following name:

`hook:<hook name>:loaded`

For example:

* the core `orm` hook emits `hook:orm:loaded` after its initialization is complete
* a hook installed into `node_modules/sails-hook-foo` emits `hook:foo:loaded` by default
* the same `sails-hook-foo` hook, with `sails.config.installedHooks['sails-hook-foo'].name` set to `bar` would emit `hook:bar:loaded`
* a hook installed into `node_modules/mygreathook` would emit `hook:mygreathook:loaded`
* a hook installed into `api/hooks/mygreathook` would also emit `hook:mygreathook:loaded`

You can use the "hook loaded" events to make one hook dependent on another.  To do so, simply wrap your hook&rsquo;s `initialize` logic in a call to `sails.on()`.  For example, to make your hook wait for the `orm` hook to load, you could make your `initialize` similar to the following:

```javascript
initialize: async function() {
  return new Promise((resolve)=>{
    sails.on('hook:orm:loaded', ()=>{
      // Finish initializing custom hook
      // Then resolve.
      resolve();
    });
  });
}
```

To make a hook dependent on several others, gather the event names to wait for into an array and call `sails.after`:

```javascript
initialize: async function() {
  return new Promise((resolve)=>{
    var eventsToWaitFor = ['hook:orm:loaded', 'hook:mygreathook:loaded'];
    sails.after(eventsToWaitFor, ()=>{
      resolve();
    });
  });
}
```


<docmeta name="displayName" value=".initialize()">
<docmeta name="stabilityIndex" value="3">
