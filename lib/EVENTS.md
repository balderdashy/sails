# Core Events

## Status

> ##### Stability: [2](http://nodejs.org/api/documentation.html#documentation_stability_index) - Unstable
>
> The API is in the process of settling, but has not yet had sufficient real-world testing to be considered stable.
>
> Backwards-compatibility will be maintained if reasonable.


## Purpose

The instantiated `sails` object is a Node EventEmitter.

> WARNING
> `sails.on(*)` events are for contributors to the core or developers building custom hooks.
>
> **Please do not use these events directly in your app. You have been warned!**


### Background

Events have been a feature of the Sails core since v0.9.

+ Developers needed an easier way to modify the Sails core for their needs.  Hooks and events make this possible!
+ Events themselves originated as a feature to allow hooks to talk to each other during and after the app bootstrapping process.
+ For posterity, the original `sails.on(*)` event proposal: https://gist.github.com/mikermcneil/5898598

### Best Practices

Although it can be tempting, it's really best not to add new events to `sails` in your app code.  In general, consistent conventions, clarity, and simplicity are the best practice for developing apps, because it makes them easier to extend, and makes it easier for you to remember how everything works when you come back to it later (not to mention everyone else on your team!)

If you want to add/trigger events to monkeypatch your Sails core, it's best to do this by authoring a hook.  More information will show up as we learn more about best practices around that process, but one thing we've definitely learned is that you're better off namespacing your events and firing them on a single object (`sails`), then emitting and listening on different objects.  Why?  Sometimes objects get deleted or copied, and this can make a big mess.

If you need a special event in your hook, you *will* want to namespace it.  For instance, if I'm adding a hook called `enforceRestfulSesssions` that limits the actions that can be added to controllers to encourage code consistency, I might have a `hook:enforceRestfulSesssions:checked` event that fires when all of the controllers have been checked.  This is so that other hooks that know about `enforceRestfulSesssions` can wait until it has finished its check before proceeding  (whether it's just me, or other people on my team, or if I release my hook and it gets popular, other people in the Sails community).

In my hook's initialize method, I might have the following:

```javascript

// Wait until all the middleware from this app's controllers have loaded
sails.after('hook:controllers:loaded', function () {

  // Do stuff
  // e.g. prevent any methods called `login`, `logout` or `signup`
  // since we've opted organizationally for using CRUD on a SessionController instead
  // .....code here........

  // When you're done, fire an event in
  sails.emit('hook:enforceRestfulSesssions:checked');

});
```



## Reference

### Lifecycle

##### `lifted`
Called after drawing the sailboat.

##### `ready`
Called when all hooks are loaded and the internal router is ready to handle requests.
i.e. the HTTP hook listens for `ready` before binding its HTTP server.

##### `lower`
Called when `sails.lower()` is called.  `sails.lower()` is called automatically when the process is halted.

##### `router:before`
Called before any of the app's configured static routes have been bound.
i.e. a hook might listen to this event to bind some middleware.

##### `router:after`
Called after all of the app's configured static routes have been bound.
i.e. a hook might listen to this event to bind a "shadow route" to a blueprint.

##### `router:done`
Called when all routes have been bound, including those originating from hooks (i.e. things listening for `router:after`.)

##### `router:reset`
Called when the router is flushed (i.e. all routes are unbound).
The `http` hook (i.e. Express), and any other attached servers which maintain their own routes should listen for this event so they know to unbind their private routes.


### Lift-time

##### `router:bind`
Called when a route is bound. This allows hooks to handle routes directly if they want to-


Should receive a single argument, "routeObj", which looks like:
```
{
  path: 'String',
  target: function theFnBoundtoTheRoute (req, res, next) {},
  verb: 'String',
  options: 'Object'
}
```

##### `router:unbind`
Called when a route is unbound.


### Runtime

> NOTE: these events should only be relied on by attached servers without their own routers, or when a hook
> implementation prefers to use the built-in Sails router.
>
> The optimal behavior for the http hook implemented on Express, for instance, is to listen to `router:bind`
> from the built-in router and listen for the routes itself using `app.use`.  On the other hand, in the `sockets` hook,
> Socket.io needs to use the `router:request` event to simulate a connect-style router since it
> can't bind dynamic routes ahead of time.


##### `router:request`
Called when a request is received by the Sails router.  Should receive three arguments, `req`, `res`, and `next`.

##### `router:request:500`
Absolute last-resort handler for server errors.
Called when a request encounters an error and isn't handled by other means.
Should receive three arguments, `err`, `req`, and `res`.

##### `router:request:404`
Absolute last-resort handler for requests which don't match any routes.
Called when a request doesn't match any routes (or shadow routes, including 404/slug handlers), and this case isn't handled by other means.
Should receive two arguments, `req`, and `res`.

##### `router:route`
Called every time a request is routed.  Compare with `router:request`- e.g.:

```
sails.router.bind('/foo/*', noop);
sails.router.bind('/foo/:bar', noop);
sails.router.bind('/foo/explicit', noop);

// Request to /foo/x will emit `router:request` only once, but `router:route` three times.
```




## Usage

#### `sails.on()`

Fires your handler **NEXT TIME** the event is triggered and **EVERY TIME AFTERWARD**.

```javascript
sails.on('hook:yourHookID:someEvent', function yourEventHandler ( /* a, b, c, ..., z */ ) {
  // your implementation
});
```

#### `sails.once()`

Fires your handler **NEXT TIME** the specified event is triggered, and then stop listening.

```javascript
sails.once('hook:yourHookID:someEvent', function yourEventHandler ( /* a, b, c, ..., z */ ) {
  // your implementation
});
```

#### `sails.after()`

Fires your handler **IF THE SPECIFIED EVENT HAS ALREADY BEEN TRIGGERED** or **WHEN IT IS TRIGGERED**.

Kind of like jQuery's `$(document).ready()`, except `document` is whatever you want.
Useful for checking whether some state has been achieved yet.

```javascript
sails.after('hook:yourHookID:someEvent', function yourEventHandler ( /* a, b, c, ..., z */ ) {
  // your implementation
});
```

You can actually wait for several events using `.after` as well:

```javascript
sails.after(['hook:yourHookID:someEvent', 'hook:someOtherHookID:someOtherEvent'], function yourEventHandler ( /* a, b, c, ..., z */ ) {
  // your implementation
});
```

<!--

This can be omitted for now- it really shouldn't be used in userspace.
May be deprecated, API may change.  Please do not use.


#### sails.emit

Emit the specified event with the specified arguments to all listeners.

```javascript
sails.emit('hook:yourHookID:someEvent', 'arbitrary', 'number', {of: 'arguments'}, ['allowed']);
```

-->


## FAQ

> If you have a question that isn't covered here, please feel free to send a PR adding it to this section (even if you don't have the answer!)
