# Policies
### Overview

Policies in Sails are versatile tools for authorization and access control: they let you execute some logic _before_ an action is run in order to determine whether or not to continue processing the request.  The most common use-case for policies is to restrict certain actions to _logged-in users only_.

> NOTE: policies apply **only** to controllers and actions, not to views.  If you define a route in your [routes.js config file](https://sailsjs.com/documentation/reference/configuration/sails-config-routes) that points directly to a view, no policies will be applied to it.  To make sure policies are applied, you can instead define an action which displays your view and then point your route to that action. &nbsp;

### When to use policies

It's best to avoid implementing numerous or complex policies in your app.  Instead, when implementing features like granular, role-based permissions, rely on your [actions](https://sailsjs.com/documentation/concepts/actions-and-controllers) to reject unwanted access.  Your actions should also be responsible for any necessary personalization of the view locals and JSON response data you send in the response.

For example, if you need to implement user-level or role-based permissions in your application, the most straightforward solution is to take care of the relevant checks at the top of your controller action&mdash;either inline or by calling out to a helper.  Following this best practice will significantly improve the maintainability of your code.

### Protecting actions and controllers with policies

Sails has a built in ACL (access control list) located in `config/policies.js`.  This file is used to map policies to actions and controllers.

This file is  *declarative*, meaning it describes *what* the permissions for your app should look like rather than *how* they should work.  This makes it easier for new developers to understand what's going on, and it makes your app more flexible as requirements inevitably change over time.

The `config/policies.js` file is a dictionary whose properties and values differ depending on whether you are applying policies to [controllers](https://sailsjs.com/documentation/concepts/actions-and-controllers#?controllers) or [standalone actions](https://sailsjs.com/documentation/concepts/actions-and-controllers#?standalone-actions).

##### Applying policies to a controller

To apply policies to a controller, use the controller name as the name of a property in the  `config/policies.js` dictionary, and set its value to a dictionary mapping actions in that controller to policies that should be applied to them.  Use `*` to represent &ldquo;all unmapped actions&rdquo;.  A policy's _name_ is the same as its filename, minus the file extension.

```js
module.exports.policies = {
  UserController: {
    // By default, require requests to come from a logged-in user
    // (runs the policy in api/policies/isLoggedIn.js)
    '*': 'isLoggedIn',

    // Only allow admin users to delete other users
    // (runs the policy in api/policies/isAdmin.js)
    'delete': 'isAdmin',

    // Allow anyone to access the login action, even if they're not logged in.
    'login': true
  }
};
```

##### Applying policies to standalone actions

To apply policies to one or more standalone actions, use the action path (relative to `api/controllers`) as a property name in the `config/policies.js` dictionary, and set the value to the policy or policies that should apply to those actions.  By using a wildcard `*` at the end of the action path, you can apply policies to all actions that begin with that path.  Here's the same set of policies as above, rewritten to apply to standalone actions:

```js
module.exports.policies = {
  'user/*': 'isLoggedIn',
  'user/delete': 'isAdmin',
  'user/login': true
}
```

> Note that this example differs slightly from that of the controller-based policies in that the `isLoggedIn` policy will apply to all actions in the `api/controllers/user` folder _and subfolders_ (except for `user/delete` and `user/login`, as is explained in the next section).

##### Policy ordering and precedence

It is important to note that policies do _not_ cascade.  In the examples above, the `isLoggedIn` policy will be applied to all actions in the `UserController.js` file (or standalone actions living under `api/controllers/user` ) _except for `delete` and `login`_.  If you wish to apply multiple policies to an action, list the policies in an array. For example:

```javascript
'getEncryptedData': ['isLoggedIn', 'isInValidRegion']
```

##### Using policies with blueprint actions

Sails' built-in [blueprint API](https://sailsjs.com/documentation/concepts/blueprints) is implemented using regular Sails actions.  The only difference is that blueprint actions are implicit.

To apply your policies to blueprint actions, set up your policy mappings just like we did in the example above, but pointed at the name of the relevant implicit [blueprint action](https://sailsjs.com/documentation/concepts/blueprints/blueprint-actions) in your controller (or as a standalone action).  For example:
```js
module.exports.policies = {
  UserController: {
    // Apply the 'isLoggedIn' policy to the 'update' action of 'UserController'
    update: 'isLoggedIn'
  }
};
```
or
```js
module.exports.policies = {
  'user/update': 'isLoggedIn'
};
```

##### Global policies

You can apply a policy to _all_ actions that are not otherwise explicitly mapped by using the `*` property.  For example:

```js
module.exports.policies = {
  '*': 'isLoggedIn',
  'user/login': true
};
```
This would apply the `isLoggedIn` policy to every action except the `login` action in `api/controllers/user/login.js` (or in `api/controllers/UserController.js`).

### Built-in policies
Sails provides two built-in policies that can be applied globally or to a specific controller or action:
  + `true`: public access  (allows anyone to get to the mapped controller/action)
  + `false`: **NO** access (allows **no-one** to access the mapped controller/action)

 `'*': true` is the default policy for all controllers and actions.  In production, it's good practice to set this to `false` to prevent access to any logic you might have inadvertently exposed.


### Writing Your First Policy

Here is a simple `isLoggedIn` policy to prevent access for unauthenticated users. It checks the session for a `userId` property, and if it doesn&rsquo;t find one, sends the default [`forbidden` response](https://sailsjs.com/documentation/concepts/extending-sails/custom-responses/default-responses#?resforbidden. For many apps, this will likely be the only policy needed. The following example assumes that, in the controller actions for authenticating a user, you set `req.session.userId` to a [truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy) value.

```javascript
// policies/isLoggedIn.js
module.exports = async function (req, res, proceed) {

  // If `req.me` is set, then we know that this request originated
  // from a logged-in user.  So we can safely proceed to the next policy--
  // or, if this is the last policy, the relevant action.
  // > For more about where `req.me` comes from, check out this app's
  // > custom hook (`api/hooks/custom/index.js`).
  if (req.me) {
    return proceed();
  }

  //--•
  // Otherwise, this request did not come from a logged-in user.
  return res.forbidden();

};
```




<docmeta name="displayName" value="Policies">
<docmeta name="nextUpLink" value="/documentation/concepts/helpers">
<docmeta name="nextUpName" value="Helpers">
