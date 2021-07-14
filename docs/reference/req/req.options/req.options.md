# req.options

`req.options` is a dictionary (plain JavaScript object) of request-agnostic settings available in your app's actions.

The purpose of `req.options` is to allow an action's code to access its configured route options, if there are any.  (Simply put, "route options" are just any additional properties provided in a [route target](https://sailsjs.com/documentation/concepts/routes/custom-routes#?route-target).)

<!--
FUTURE: pull out the rest of the content below to a new, separate page under **Concepts > Routes > Route options** and just link to it from in here rather than having all this exist inline.

(Also be sure to consolidate any additional useful content from https://sailsjs.com/documentation/concepts/routes/custom-routes#?route-target-options into the new page, and replace the content under that heading with a sentence that links to the new "Route options" page.)

-m  Feb 23, 2017
-->

### With the blueprint API

Route options in Sails were originally devised as a more flexible way to configure built-in blueprint actions.

Some special settings must always be provided to [certain blueprint actions](https://sailsjs.com/documentation/reference/blueprint-api).  This provides a way for your app to communicate which model/association a blueprint action should target.  For example, `req.options.model` is the identity of the model that a particular blueprint action should target.  And for blueprint actions that directly involve an association, `req.options.alias` indicates the name of the associating attribute.

You can take advantage of this in your app order to bind a blueprint action to an arbitrary custom route.  For example, consider the following custom route in [`config/routes.js`](https://sailsjs.com/documentation/anatomy/config/routes-js):

```js
'GET /foo/bar': {
  action: 'user/find',
  model: 'user'
}
```

Whenever a GET request to /foo/bar arrives, the `find` blueprint action will run, and `req.options.model` will be available as `user`.  (This is how the built-in, generic "find" blueprint action knows that it should communicate with the User model.)

> Need to customize blueprint actions further?  In most cases, the easiest (and most maintainable) way to do this is to write a custom action.  If you're making the transition between the blueprint API and writing your own custom actions for the first time, you might start by checking out [Concepts > Actions & Controllers](https://sailsjs.com/documentation/concepts/actions-and-controllers).
>
> Note that there is a middle ground that allows you to programmatically modify some additional aspects of a blueprint action's behavior without overriding it completely (for example, examining the request to determine the criteria that a blueprint action uses when accessing models.)  See [**Reference > sails.config.blueprints > Using parseBlueprintOptions**](https://sailsjs.com/documentation/reference/configuration/sails-config-blueprints#?using-parseblueprintoptions) for more on that.


### Custom route options

it is also possible to configure and consume your own _custom_ route options.  For example, imagine you're building a GitHub plugin for Sails.  In order to provide support for handling webhook requests from GitHub, your plugin could register a generic, configurable action like `github/receive-event` that allows any user of your plugin to easily bind it to any route in their app:


```js
'POST /my-cool-webhooks/github/doings-and-things/incoming': {
  action: 'github/receive-event',
}
```

But now, imagine that one of the purposes for your plugin's generic `receive-event` action is to save a record representing the incoming GitHub event to the app's database (e.g. to track it for future use).  In order to do that, your generic action needs to know which model to use.  So, using a simple approach that is consistent with Sails' built-in blueprint actions, your plugin could support usage like the following:

```js
'POST /my-cool-webhooks/github/doings-and-things/incoming': {
  action: 'github/receive-event',
  model: 'repoactivity'
}
```

Meanwhile, in your plugin, the action you register might look something like this:

```js
module.exports = function receiveEvent(req, res) {

  if (_.isUndefined(req.options.model) || !sails.models[req.options.model]) {
    return res.serverError(new Error('Invalid configuration: To use `github/receive-event`, please set this route's `model` to the identity of one of your app\'s models.  (Currently, it is `'+req.options.model+'`, which cannot be used.)'));
  }

  var GitHubEventModel = sails.models[req.options.model];
  GitHubEventModel.create({
    raw: req.allParams(),
    githubId: req.param('id'),
    // ...
    // ... etc. (see https://developer.github.com/webhooks/#events)
  }).exec(function(err) {
    if (err) { return res.serverError(err); }

    return res.ok();
  });
};
```

> For more about creating this type of plugin, see [Concepts > Extending Sails > Hooks](TODO).

<docmeta name="displayName" value="req.options">
<docmeta name="pageType" value="property">
