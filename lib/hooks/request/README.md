# request (Core Hook)

## Status

> ##### Stability: [2](http://nodejs.org/api/documentation.html#documentation_stability_index) - Unstable


## Purpose

This hook's responsibilities are:

##### Add properties to `req`
+ req.params.all()
+ req.wantsJSON()
+ req.explicitlyAcceptsHTML()
+ req.baseUrl
+ req.port
+ req._sails (access to the app's `sails` object in case it's not global)

##### Flash Middleware
+ req.flash('keyToGet')
+ req.flash('keyToSet','valueToSetOnKey')

##### Set default view locals (i.e. `app.locals`)
+ `_` (lodash)
+ `session`
+ `req`
+ `res`
+ `sails`



##### Future: JSONP/Blueprint config

> This feature is not implemented yet.
> Keep in mind-- JSONP is always accessible using res.jsonp(), thanks to TJ & express.

1. Check `req.options`.
2. If `jsonp` is enabled for a route/middleware, `req.options.jsonp` should be truthy.
3. If `res.jsonp()` is called, but `req.options.jsonp` is false, jsonp will NOT be sent.
4. Configured jsonp callback parameter will be pruned from `req.params.all()`.
5. Wrap calls to `res.jsonp` in function that disables/enables JSONP according to `req.options`.


## FAQ

> If you have a question that isn't covered here, please feel free to send a PR adding it to this section (even if you don't have the answer!)
