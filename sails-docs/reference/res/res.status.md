# `res.status()`

Set the status code of this response.

### Usage
```usage
res.status(statusCode);
```

### Example
```javascript
res.status(418);
res.send('I am a teapot');
```

### Notes
>+ The status code may be set up until the response is sent.
>+ `res.status()` is effectively just a chainable alias of Node's `res.statusCode = …;`.










<docmeta name="displayName" value="res.status()">
<docmeta name="pageType" value="method">
