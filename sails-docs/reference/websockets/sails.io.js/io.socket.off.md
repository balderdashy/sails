# `io.socket.off()`

Unbind the specified event handler (opposite of [`.on()`](https://sailsjs.com/documentation/reference/web-sockets/socket-client/io-socket-on)).

```js
io.socket.off(eventIdentity, handlerFn);
```

> **This method is here for completeness, but most apps should not need to use it.**  See below for more information.


### Usage


|   | Argument   | Type         | Details |
|---|------------|:------------:|:--------|
| 1 | eventIdentity | ((string))   | The unique event identity associated with a server-sent message, e.g. "recipe".
| 2 | handlerFn     | ((function)) | The event handler function to unbind from the specified event.



### Notes

> + If you decide to use this method, be careful!  `io.socket.off()` does **not** stop the this client-side socket from receiving any server-sent messages, it just prevents the specified event handler from firing.  Usually, the desired effect is to prevent messages _from being sent altogether_, which is critical if your server-sent messages contain private data. This happens automatically when a socket disconnects, but there are also less-common use cases where it is necessary to unsubscribe sockets from rooms while they are still connected.  For example, consider a scenario where an admin user is banned from your system while viewing a realtime dashboard, and your app needs to prevent them from receiving all subsequent realtime updates. To force a client socket to stop receiving broadcasted messages, **do not use this method**.  Instead, unsubscribe the socket in your server-side code:
>   + If the room was joined using `sails.sockets.join()`, call `sails.sockets.leave()`.
>   + If the room was joined using resourceful PubSub methods, call `.unsubscribe()` or `.unwatch()` as appropriate.
> + In order to use `.off()`, you will need to store the `handlerFn` argument you passed in to [`.on()`](https://sailsjs.com/documentation/reference/web-sockets/socket-client/io-socket-on) in a variable.


<docmeta name="displayName" value="io.socket.off()">
<docmeta name="pageType" value="method">
