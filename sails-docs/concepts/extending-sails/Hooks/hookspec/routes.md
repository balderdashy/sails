# `.routes`

The `routes` feature allows a custom hook to easily bind new routes to a Sails app at load time.  If implemented, `routes` should be an object with either a `before` key, an `after` key, or both.  The values of those keys should in turn be objects whose keys are [route addresses](https://sailsjs.com/documentation/concepts/routes/custom-routes#?route-address), and whose values are route-handling functions with the standard `(req, res, next)` parameters.  Any routes specified in the `before` object will be bound *before* custom user routes (as defined in [sails.config.routes](https://sailsjs.com/documentation/reference/configuration/sails-config-routes)) and [blueprint routes](https://next.sailsjs.com/documentation/reference/blueprint-api#?restful-shortcut-routes-and-actions).  Conversely, routes specified in the `after` object will be bound *after* custom and blueprint routes.  For example, consider the following `count-requests` hook:

```javascript
module.exports = function (sails) {

  // Declare a var that will act as a reference to this hook.
  var hook;

  return {

    initialize: function(cb) {
      // Assign this hook object to the `hook` var.
      // This allows us to add/modify values that users of the hook can retrieve.
      hook = this;
      // Initialize a couple of values on the hook.
      hook.numRequestsSeen = 0;
      hook.numUnhandledRequestsSeen = 0;
      // Signal that initialization of this hook is complete
      // by calling the callback.
      return cb();
    },

    routes: {
      before: {
        'GET /*': function (req, res, next) {
          hook.numRequestsSeen++;
          return next();
        }
      },
      after: {
        'GET /*': function (req, res, next) {
          hook.numUnhandledRequestsSeen++;
          return next();
        }
      }
    }
  };
};
```

This hook will process all requests via the function provided in the `before` object, and increment its `numRequestsSeen` variable.  It will also process any *unhandled* requests via the function provided in the `after` object&mdash;that is, any routes that aren't bound in the app via a custom route configuration or a blueprint.

> The two variables set up in the hook will be available to other modules in the Sails app as `sails.hooks["count-requests"].numRequestsSeen` and `sails.hooks["count-requests"].numUnhandledRequestsSeen`


<docmeta name="displayName" value=".routes">
<docmeta name="stabilityIndex" value="3">
