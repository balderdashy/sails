# sails.registerActionMiddleware()

> ##### _**This feature is still experimental.**_
> This method is still under development, and its interface and/or behavior could change at any time.

Register a new action middleware function that will be applied to actions with the specified identities.

```usage
sails.registerActionMiddleware(actionMiddlewareFns, actionIdentities);
```

Action middleware functions are essentially [policies](https://sailsjs.com/documentation/concepts/policies#?writing-your-first-policy) that you declare programmatically (rather than via [sails.config.policies](https://sailsjs.com/documentation/reference/configuration/sails-config-policies)).  In fact, policies are implemented under-the-hood using action middleware.  The `registerActionMiddleware()` method is mainly useful in [custom hooks](https://sailsjs.com/documentation/concepts/extending-sails/hooks) as a way of adding new policies to an app.

### Usage

| &nbsp;  |       Argument             | Type                | Details
|---|--------------------------- | ------------------- |:-----------
| 1 |      actionMiddlewareFns                | ((function)) or ((array))  | One or more middleware functions to register.  Action middleware (like policies) must be functions which accept `req`, `res` and `next` arguments.
| 2 |     actionIdentities               | ((string)) | An expression that indicates the action or actions that the action middleware should apply to.  Use `*` at the end for a wildcard; e.g. `user/*` will apply to any actions whose identities begin with `user/`. Use a ! at the beginning to indicate that the action middleware should NOT apply to the actions specified by the expression, e.g. `!user/foo` or `!user/*`.  Multiple identity expressions can be specified by separating with a comma, e.g. `pets/count,user/*,!user/tickle`

> The `actionIdentities` argument expects the identities to be expressed as if they were [standalone actions](https://sailsjs.com/documentation/concepts/actions-and-controllers#?standalone-actions).  To apply action middleware to actions inside of a controller file (e.g. `UserController.js`), simply refer to the lower-cased version of the filename _without "Controller"_ (e.g. `user`).

### Example

As an example of action middleware that might be applied in a custom hook, imagine a page view counter (this code might be added to the `initialize` method of the hook):

```javascript
// Declare a local var to hold the number of views for each URL.
var pageViews = {};

// Register middleware to record each page view.
sails.registerActionMiddleware(

  // First argument is the middleware to run
  function countPage (req, res, next) {

    // Initialize the page counter to zero if this is the first time we've seen this URL.
    pageViews[req.url] = pageViews[req.url] || 0;

    // Increment the page counter.
    pageViews[req.url]++;

    // Add the current page count to the request, so that it can be used in other middleware / actions.
    req.currentPageCount = pageViews[req.url];

    // Continue to the next matching middleware / action
    next();
  },

  // Second argument is the actions to apply the middleware to.  In this case, we want the
  // hook to apply to all actions EXCEPT the `show-page-views` action supplied by this hook.
  '*, !page-view-hook/show-page-views'

);
```

<docmeta name="displayName" value="sails.registerActionMiddleware()">
<docmeta name="pageType" value="method">
<docmeta name="isExperimental" value="true">
