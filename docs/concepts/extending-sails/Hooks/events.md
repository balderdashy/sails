# Application Events

### Overview

Sails app instances inherit Node's [`EventEmitter` interface](https://nodejs.org/api/events.html#events_class_eventemitter), meaning that they can both emit and listen for custom events.  While it is not recommended that you utilize Sails events directly in app code (since your apps should strive to be as stateless as possible to facilitate scalability), events can be very useful when extending Sails (via [hooks](https://sailsjs.com/documentation/concepts/extending-sails/hooks) or [adapters](https://sailsjs.com/documentation/concepts/extending-sails/adapters)) and in a testing environment.

### Should I use events?

Most Sails developers never have a use case for working with application events. Events emitted by the Sails app instance are designed to be used when building your own custom hooks, and while you _could_ technically use them anywhere, in most cases you _should not_.  Never use events in your controllers, models, services, configuration, or anywhere else in the userland code in your Sails app (unless you are building a custom app-level hook in `api/hooks/`).

### Events emitted by Sails

The following are the most commonly used built-in events emitted by Sails instances.  Like any EventEmitter in Node, you can listen for these events with `sails.on()`:

```javascript
sails.on(eventName, eventHandlerFn);
```

None of the events are emitted with extra information, so your `eventHandlerFn` should not have any arguments.

| Event name | Emitted when... |
|:-----------|:----------------|
| `ready`    | The app has been loaded and the bootstrap has run, but it is not yet listening for requests |
| `lifted`   | The app has been lifted and is listening for requests. |
| `lower`  | The app has is lowering and will stop listening for requests. |
| `hook:<hook identity>:loaded` | The hook with the specified identity loaded and ran its `initialize()` method successfully.  |


> In addition to `.on()`, Sails also exposes a useful utility function called `sails.after()`.  See the [inline documentation](https://github.com/balderdashy/sails/blob/fd2f9b6866637143eda8e908775365ca52fab27c/lib/EVENTS.md#usage) in Sails core for more information.

<docmeta name="displayName" value="Events">
