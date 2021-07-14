# sails.getActions()

Return a dictionary of Sails [actions](https://sailsjs.com/documentation/concepts/actions-and-controllers).

```usage
sails.getActions();
```

The result is a flat (i.e. one-level) dictionary where the keys are the kebab-cased, dash-delimited action identities, and the values are the action functions.  All actions in the dictionary will have been converted to `req, res` functions at this point, even if they were defined using [actions2 syntax](https://sailsjs.com/documentation/concepts/actions-and-controllers#?actions-2).


<docmeta name="displayName" value="sails.getActions()">
<docmeta name="pageType" value="method">

