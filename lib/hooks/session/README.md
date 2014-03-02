## Session Hook

At configuration-time, this hook loads verifies valid configuration of the connect session store (configurable in `sails.config.session`),
At lift-time, it instantiates the session store and makes it accesible via `sails.session`.

It includes methods for:
  + attaching a connect session to a socket.io connection
  + generating new sessions
  + generating a session secret (for apps which do not specify one)
  + getting and setting the session



##### Contributing to this hook
It would be great to see a generic connect session adapter with support for the existing 'connections' in sails (ie. waterline adapters).
