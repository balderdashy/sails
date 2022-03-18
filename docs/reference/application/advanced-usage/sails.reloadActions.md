# sails.reloadActions()

> ##### _**This feature is still experimental.**_
> This method is still under development, and its interface and/or behavior could change at any time.

Flush and reload all Sails [actions](https://sailsjs.com/documentation/concepts/actions-and-controllers)

```usage
sails.reloadActions(cb);
```

_Or:_

+ `sails.reloadActions(options, cb)`

This method causes hooks to run their `registerActions()` methods if they have them.  After the hooks are finished reloading / re-registering their actions, actions in the `api/controllers` folder (including those stored in [controller files](https://sailsjs.com/documentation/concepts/actions-and-controllers#?controllers)) are reloaded and merged on top of those loaded via hooks.

This method is useful primarily in development scenarios.


### Usage

| &nbsp;  |       Argument             | Type                | Details
|---|--------------------------- | ------------------- |:-----------
| 1 |      _options_      | ((dictionary?))          | Currently accepts one key, `hooksToSkip`, which if given should be an array of names of hooks that should _not_ call their `reloadActions` method.
| 2 |      _callback_              | ((function)) | A callback to be called with the virtual response.

### Notes
> - Never dynamically replace your Sails.js controller or action files on disk with untrusted code at runtime, regardless of whether you are using `.reloadActions()` in your app or not.  Since `reloadActions()` runs the code in your Sails.js app's files, if the files are not safe to run, then using `reloadActions()` would be [a security risk](https://github.com/balderdashy/sails/issues/7209).  This risk is only present if your Sails app is deliberately overwriting its own files to replace them with unsafe code.


<docmeta name="displayName" value="sails.reloadActions()">
<docmeta name="pageType" value="method">
<docmeta name="isExperimental" value="true">
