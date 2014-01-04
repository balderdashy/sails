# Router

## What does it do?

The core router in Sails is the main, _but not ONLY_ player responsible for routing requests.
It is not involved with HTTP, WebSockets, or other internet protocols directly-- instead, it emits
events on the `sails` object (a Node EventEmitter) when a route should be bound, allowing flexibility
in hooks' implementation.  For instance, at the time of this writing, the `http` hook listens for `bind` events
and takes over for the core Router directly.  On the other hand, the `sockets` hook defers to the core router,
emitting a `request` event whenever it receives and interprets a new, appropriately-formatted, socket message


## FAQ

+ When an HTTP request hits the server, does it hit the Sails router before it hits the Express router?
  + No- it only hits the Express router.

+ OK.. what requests DO hit the Sails router?
  + Requests to other attached servers that don't have their own routers, e.g. the Socket.io interpreter, will hit the Sails router's wildcard handler, which will then talk to the attached server and simulate the appropriate route.

+ What happens after an HTTP request hits the Express router?
  + Sails does not touch the Express router once it's been set up.

+ When and *how* are the routes in your `routes.js` file processed?
  + `routes.js` is read by the `userconfig` hook, which loads it into `sails.config.routes`.
  + `sails.config.routes` is used by the Sails router at lifttime (to bind routes to the external Express router) AND at runtime (to detect matches in wildcard routes coming from other attached servers like the Socket.io interpreter)

