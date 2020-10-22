# `req.method`

The request method (aka "verb").

### Usage
```usage
req.method;
```

### Example

If a client sends a POST request to `/product`:

```js
req.method;
// -> "POST"
```

### Notes

> + All requests to a Sails server have a "method", even via WebSockets (this is thanks to the request interpreter).









<docmeta name="displayName" value="req.method">
<docmeta name="pageType" value="property">
