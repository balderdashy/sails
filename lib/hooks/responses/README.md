# responses (Core Hook)

## Status

> ##### Stability: [2](http://nodejs.org/api/documentation.html#documentation_stability_index) - Unstable


## Purpose

This hook's responsibilities are:


##### Support `response` route target syntax

This hook listens for the `route:typeUnknown` event, and if the unknown route target syntax contains a `response` key, it binds the route address to a middleware function that does nothing except send that response.

For example:

```
'post /foo': {
  response: 'ok'
}
```

...would run `res.ok()` whenever a POST request to `/foo` is received.


##### Load custom responses

When Sails loads, this hook loads custom response files from the app's responses folder and merges them with built-in defaults, storing them in-memory as "outlet functions".  Conventionally this is `api/responses/*.js`, but it can be configured in `sails.config.paths`.


##### Bind shadow route that exposes response functions as `res.*`

This hook binds a shadow route that intercepts all incoming requests and attaches a method to `res` for each of the outlet functions (representing custom responses) that were prepared when the hook was initialized.


## Events

##### `hook:responses:loaded`

Emitted when this hook has been automatically loaded by Sails core, and triggered the callback in its `initialize` function.



## Methods

N/A


## FAQ

> If you have a question that isn't covered here, please feel free to send a PR adding it to this section (even if you don't have the answer!)
