# `res.set()`

Sets specified response header (`header`) to the specified value (`value`).

Alternatively, you can pass in a single object argument (`headers`) to set multiple header fields at once, where the keys are the header field names and the corresponding values are the desired values.

### Usage
```usage
res.set(header, value);
```

-or-

```usage
res.set(headers);
```

### Example
```javascript

res.set('Content-Type', 'text/plain');

res.set({
  'Content-Type': 'text/plain',
  'Content-Length': '123',
  'ETag': '12345'
})

```



<docmeta name="displayName" value="res.set()">
<docmeta name="pageType" value="method">
