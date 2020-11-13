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


<docmeta name="displayName" value="sails.reloadActions()">
<docmeta name="pageType" value="method">
<docmeta name="isExperimental" value="true">
