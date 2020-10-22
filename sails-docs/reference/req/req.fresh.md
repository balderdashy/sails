# `req.fresh`

A flag indicating that the user-agent sending this request (`req`) wants "fresh" data (as indicated by the "[if-none-match](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.26)", "[cache-control](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.9)", and/or "[if-modified-since](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.25)" request headers.)

If the request wants "fresh" data, usually you'll want to `.find()` fresh data from your models and send it back to the client.

### Usage
```usage
req.fresh;
```

### Example
```js
if (req.fresh) {
  // The user-agent is asking for a more up-to-date version of the requested resource.
  // Let's hit the database to get some stuff and send it back.
}
```

### Notes
> + See the [`node-fresh`](https://github.com/visionmedia/node-fresh) module for details specific to the implementation in Sails/Express/Koa/Connect.









<docmeta name="displayName" value="req.fresh">
<docmeta name="pageType" value="property">
