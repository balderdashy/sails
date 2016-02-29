# request (Core Hook)

> In future releases, the various responsibilities of this hook will likely be farmed out to other hooks and/or pulled into core.

## Purpose

This hook's responsibilities are:

##### Add properties to `req`
+ req.params.all()
+ req.wantsJSON()
+ req.explicitlyAcceptsHTML()
+ req.baseUrl
+ req.port
+ req._sails (access to the app's `sails` object in case it's not global)

##### Set default view locals (i.e. `app.locals`)
+ `_` (lodash)
+ `session`
+ `req`
+ `res`
+ `sails`

> Note that this will likely move into the `views` hook in the future.



## FAQ

> If you have a question that isn't covered here, please feel free to send a PR adding it to this section (even if you don't have the answer!)
